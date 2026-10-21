const session = require("express-session");
const bcrypt = require("bcryptjs");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || "lifelink-demo-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 30 * 60 * 1000
    }
  })
);

// Serve frontend files from the project folder
// Serve frontend files, but block direct access to data and server files.
app.use((req, res, next) => {
  const blockedFiles = [
    "donors.json",
    "recipients.json",
    "hospitals.json",
    "matches.json",
    "tracking.json",
    "users.json",
    "notifications.json",
    "server.js",
    "db.js"
  ];

  const requestedFile = req.path.split("/").pop();

  if (blockedFiles.includes(requestedFile)) {
    return res.status(403).json({
      error: "Direct access to this file is forbidden."
    });
  }

  next();
});

app.use(express.static(__dirname));

// JSON file locations
const DATA_DIR = __dirname;

const DATA_FILES = {
  donors: path.join(DATA_DIR, "donors.json"),
  recipients: path.join(DATA_DIR, "recipients.json"),
  hospitals: path.join(DATA_DIR, "hospitals.json"),
  matches: path.join(DATA_DIR, "matches.json"),
  tracking: path.join(DATA_DIR, "tracking.json"),
  notifications: path.join(DATA_DIR, "notifications.json")
};
// Create missing JSON files without overwriting existing data
function initializeFiles() {
  for (const filePath of Object.values(DATA_FILES)) {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "[]", "utf8");
    }
  }
}

initializeFiles();

// Read records from a JSON file
function readData(type) {
  const filePath = DATA_FILES[type];

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(content);

    if (!Array.isArray(data)) {
      throw new Error(`${type}.json must contain a JSON array`);
    }

    return data;
  } catch (error) {
    console.error(`Error reading ${type}.json:`, error.message);
    throw error;
  }
}

// Write records to a JSON file
function writeData(type, data) {
  const filePath = DATA_FILES[type];
  const temporaryPath = `${filePath}.tmp`;

  fs.writeFileSync(
    temporaryPath,
    JSON.stringify(data, null, 2),
    "utf8"
  );

  fs.renameSync(temporaryPath, filePath);
}

// Generate unique IDs
function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// Return consistent donor fields for the existing frontend
function formatDonor(donor) {
  return {
    ...donor,
    bloodGroup: donor.bloodGroup || donor.blood || ""
  };
}

// Helper for GET routes
function getRecords(type, formatter = (record) => record) {
  return (req, res) => {
    try {
      const records = readData(type);
      res.json(records.map(formatter));
    } catch (error) {
      res.status(500).json({
        error: `Could not read ${type} records`
      });
    }
  };
}

// Helper for POST routes
function createRecord(type, prefix, validate, prepare = (record) => record) {
  return (req, res) => {
    try {
      const input = req.body || {};
      const validationError = validate(input);

      if (validationError) {
        return res.status(400).json({
          error: validationError
        });
      }

      const records = readData(type);

      const newRecord = {
        id: generateId(prefix),
        ...prepare(input)
      };

      records.push(newRecord);
      writeData(type, records);

      res.status(201).json(newRecord);
    } catch (error) {
      console.error(`Error saving ${type} record:`, error.message);

      res.status(500).json({
        error: `Could not save ${type} record`
      });
    }
  };
}

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "LifeLink API is healthy",
    storage: "JSON files"
  });
});

// ==================== DONORS ====================

app.get("/api/donors", requireLogin,getRecords("donors", formatDonor));

app.post(
  "/api/donors",
  createRecord(
    "donors",
    "D",
    ({ name, bloodGroup, blood, organ, status }) => {
      if (!name || !(bloodGroup || blood) || !organ || !status) {
        return "Name, blood group, organ, and status are required";
      }
      return null;
    },
    ({ name, bloodGroup, blood, organ, status, hospital, date }) => ({
      name,
      organ,
      blood: bloodGroup || blood,
      bloodGroup: bloodGroup || blood,
      status,
      hospital: hospital || "",
      date: date || ""
    })
  )
);

// ==================== RECIPIENTS ====================

app.get("/api/recipients", requireLogin,getRecords("recipients"));

app.post(
  "/api/recipients",
  createRecord(
    "recipients",
    "R",
    ({ name, organ, blood, status }) => {
      if (!name || !organ || !blood || !status) {
        return "Name, organ, blood group, and status are required";
      }
      return null;
    },
    ({ name, organ, blood, hospital, priority, status }) => ({
      name,
      organ,
      blood,
      hospital: hospital || "Not specified",
      priority: priority || "Medium",
      status
    })
  )
);

// ==================== HOSPITALS ====================

app.get("/api/hospitals", requireLogin,getRecords("hospitals"));

app.post(
  "/api/hospitals",
  createRecord(
    "hospitals",
    "H",
    ({ name, city, contact, status }) => {
      if (!name || !city || !contact || !status) {
        return "Name, city, contact, and status are required";
      }
      return null;
    },
    ({ name, city, contact, doctors, status }) => ({
      name,
      city,
      contact,
      doctors: Number(doctors) || 0,
      status
    })
  )
);

// ==================== MATCHES ====================

app.get("/api/matches",requireLogin, getRecords("matches"));

app.post(
  "/api/matches",
  createRecord(
    "matches",
    "M",
    ({ donor, recipient, organ, status }) => {
      if (!donor || !recipient || !organ || !status) {
        return "Donor, recipient, organ, and status are required";
      }
      return null;
    },
    ({ donor, recipient, organ, compatibility, status }) => ({
      donor,
      recipient,
      organ,
      compatibility: Number(compatibility) || 0,
      status
    })
  )
);

// ==================== TRACKING ====================

app.get("/api/tracking", requireLogin,getRecords("tracking"));

app.post(
  "/api/tracking",
  createRecord(
    "tracking",
    "T",
    ({ recipient, organ, stage, hospital }) => {
      if (!recipient || !organ || !stage || !hospital) {
        return "Recipient, organ, stage, and hospital are required";
      }
      return null;
    },
    ({ recipient, organ, stage, status, hospital, date }) => ({
      recipient,
      organ,
      stage,
      status: status || "Scheduled",
      hospital,
      date: date || ""
    })
  )
);
// Update an existing tracking record
app.put("/api/tracking/:id", (req, res) => {
  try {
    const trackingRecords = readData("tracking");

    const recordIndex = trackingRecords.findIndex(
      (record) => record.id === req.params.id
    );

    if (recordIndex === -1) {
      return res.status(404).json({
        error: "Tracking record not found"
      });
    }

    const { status, stage } = req.body;

    if (status !== undefined) {
      trackingRecords[recordIndex].status = status;
    }

    if (stage !== undefined) {
      trackingRecords[recordIndex].stage = stage;
    }

    writeData("tracking", trackingRecords);

// Create a notification when tracking status or stage changes
const updatedRecord = trackingRecords[recordIndex];

const notifications = readData("notifications");

notifications.push({
  id: `N${Date.now()}`,
  title: "Tracking update",
  message: `Tracking for ${updatedRecord.organ} has been updated. Current status: ${updatedRecord.status || updatedRecord.stage}.`,
  type: "info",
  read: false,
  date: new Date().toISOString()
});

writeData("notifications", notifications);

return res.json({
  message: "Tracking record and notification updated successfully",
  record: updatedRecord
});
  } catch (error) {
    res.status(500).json({
      error: "Failed to update tracking record"
    });
  }
});
// ===============================
// NOTIFICATIONS API
// ===============================

// Get all notifications
app.get("/api/notifications", getRecords("notifications"));

// Create a notification
app.post(
  "/api/notifications",
  createRecord(
    "notifications",
    "N",
    ({ title, message }) => {
      if (!title || !message) {
        return "Title and message are required";
      }
      return null;
    },
    ({ title, message, type, read }) => ({
      title,
      message,
      type: type || "info",
      read: read === true
    })
  )
);

// Mark a notification as read or unread
app.put("/api/notifications/:id", (req, res) => {
  try {
    const notifications = readData("notifications");

    const index = notifications.findIndex(
      notification => notification.id === req.params.id
    );

    if (index === -1) {
      return res.status(404).json({
        error: "Notification not found"
      });
    }

    if (typeof req.body.read !== "boolean") {
      return res.status(400).json({
        error: "The read field must be true or false"
      });
    }

    notifications[index].read = req.body.read;

    writeData("notifications", notifications);

    return res.json({
      message: "Notification updated successfully",
      notification: notifications[index]
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to update notification"
    });
  }
});
const USERS_FILE = path.join(__dirname, "users.json");

function readUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}
function requireLogin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      error: "Please log in to access this resource."
    });
  }

  next();
}

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required"
      });
    }

    const users = readUsers();
    const user = users.find(
      (u) => u.username === username && u.active
    );

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        error: "Invalid username or password"
      });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      return res.status(401).json({
        error: "Invalid username or password"
      });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    res.json({
      message: "Login successful",
      user: req.session.user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/api/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Please log in" });
  }

  res.json({ user: req.session.user });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({ error: "Logout failed" });
    }

    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

app.get("/api/users", (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const users = readUsers().map(({ passwordHash, ...user }) => user);
  res.json(users);
});

app.post("/api/users", async (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  try {
    const { username, password, role } = req.body;

    if (
      !username ||
      !password ||
      password.length < 8 ||
      !["admin", "hospital", "coordinator"].includes(role)
    ) {
      return res.status(400).json({
        error: "Provide a username, a password of at least 8 characters, and a valid role"
      });
    }

    const users = readUsers();

    if (users.some((u) => u.username === username)) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const user = {
      id: "U" + Date.now(),
      username,
      passwordHash: await bcrypt.hash(password, 12),
      role,
      active: true
    };

    users.push(user);
    writeUsers(users);

    const { passwordHash, ...safeUser } = user;
    res.status(201).json(safeUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create user" });
  }
});

// Handle unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({
    error: "API endpoint not found"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`LifeLink backend running at http://localhost:${PORT}`);
  console.log("Storage: JSON files");
});