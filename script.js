const store={
 donors:[
 {id:'D-1001',name:'Arun Kumar',organ:'Kidney',blood:'O+',hospital:'Meenakshi Medical Centre',status:'Eligible',date:'2026-10-14'},
 {id:'D-1002',name:'Priya S.',organ:'Liver',blood:'B+',hospital:'City Care Hospital',status:'Under Review',date:'2026-10-12'},
 {id:'D-1003',name:'Karthik R.',organ:'Kidney',blood:'A+',hospital:'Meenakshi Medical Centre',status:'Eligible',date:'2026-10-10'}],
 recipients:[
 {id:'R-2001',name:'Lakshmi Devi',organ:'Kidney',blood:'O+',hospital:'Meenakshi Medical Centre',priority:'High',status:'Waiting'},
 {id:'R-2002',name:'Mohammed I.',organ:'Liver',blood:'B+',hospital:'City Care Hospital',priority:'Medium',status:'Matching'},
 {id:'R-2003',name:'Sanjay P.',organ:'Kidney',blood:'A+',hospital:'Meenakshi Medical Centre',priority:'High',status:'Waiting'}],
 hospitals:[
 {id:'H-301',name:'Meenakshi Medical Centre',city:'Madurai',contact:'transplant@mmc.example',doctors:8,status:'Verified'},
 {id:'H-302',name:'City Care Hospital',city:'Chennai',contact:'coordination@citycare.example',doctors:5,status:'Verified'},
 {id:'H-303',name:'Green Valley Hospital',city:'Coimbatore',contact:'admin@gvh.example',doctors:3,status:'Pending review'}],
 matches:[
 {id:'M-501',donor:'Arun Kumar',recipient:'Lakshmi Devi',organ:'Kidney',compatibility:96,status:'Awaiting approval'},
 {id:'M-502',donor:'Priya S.',recipient:'Mohammed I.',organ:'Liver',compatibility:89,status:'Medical review'},
 {id:'M-503',donor:'Karthik R.',recipient:'Sanjay P.',organ:'Kidney',compatibility:93,status:'Awaiting approval'}],
 tracking:[
 {id:'T-701',recipient:'Lakshmi Devi',organ:'Kidney',stage:'Transportation',status:'In transit',hospital:'Meenakshi Medical Centre',date:'2026-10-18 18:30'},
 {id:'T-702',recipient:'Mohammed I.',organ:'Liver',stage:'Transplant procedure',status:'Scheduled',hospital:'City Care Hospital',date:'2026-10-20 09:00'}],
 notifications:[
 {icon:'⇄',title:'Potential match identified',detail:'A kidney match is ready for clinical review.',time:'10 min ago',status:'New'},
 {icon:'✓',title:'Hospital verification pending',detail:'Green Valley Hospital requires document review.',time:'45 min ago',status:'New'},
 {icon:'➜',title:'Transportation status updated',detail:'Shipment T-701 is currently marked in transit.',time:'1 hour ago',status:'Read'}],
 users:[{name:'Dr. Meera S.',role:'Transplant coordinator',access:'Active'},{name:'Dr. Naveen R.',role:'Doctor',access:'Active'},{name:'Admin team',role:'Administrator',access:'Active'}]
};
const pageNames={dashboard:'Dashboard overview',donors:'Donor management',recipients:'Recipient management',hospitals:'Hospital management',matching:'Organ matching & allocation',tracking:'Transplant tracking',notifications:'Notifications & communication',users:'Users & access management',reports:'Reports & analytics'};
let currentPage='dashboard';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const badge=s=>{let cl=/eligible|verified|completed|approved|active|read/i.test(s)?'green':/pending|review|scheduled|matching/i.test(s)?'orange':/transit|new|waiting|high/i.test(s)?'blue':'red';return `<span class="status ${cl}">${esc(s)}</span>`};
function toast(msg){const el=document.getElementById('toast');el.textContent=msg;el.style.display='block';setTimeout(()=>el.style.display='none',2600)}
function showPage(page) {
  currentPage = page;

  if (page === "matching") loadMatches();
  if (page === "recipients") loadRecipients();
  if (page === "donors") loadDonors();
  if (page === "hospitals") loadHospitals();
  if (page === "tracking") loadTracking();
  if (page === "notifications") loadNotifications();

  document.querySelectorAll(".nav-btn").forEach(button => {
    button.classList.toggle("active", button.dataset.page === page);
  });

  document.getElementById("top-title").textContent =
    pageNames[page] || "LifeLink";

  render();

  if (page === "users") {
    loadLifeLinkUsers();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}function header(title,sub,button=''){return `<div class="page-title"><div><h2>${title}</h2><p>${sub}</p></div>${button}</div>`}
function table(headers,rows){return `<div class="table-wrap"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows||''}</tbody></table></div>`}
function person(name,id){return `<div class="person"><div class="person-icon">${esc(name.split(' ').map(x=>x[0]).slice(0,2).join(''))}</div><div><strong>${esc(name)}</strong><small>${esc(id)}</small></div></div>`}
function dashboard(){return `
<div class="welcome"><div><div class="eyebrow">Coordination workspace</div><h2>Good evening, Coordinator 👋</h2><p>Here's an overview of donation and transplant activity across LifeLink.<br>Use the workspace to manage records, review matches, and track progress.</p></div><button class="btn" onclick="openForm('donors')">＋ Register a donor</button></div>
<div class="stats">
<div class="stat"><div class="stat-top">Registered donors <span class="stat-icon">♡</span></div><div class="stat-value">${store.donors.length}</div><div class="stat-note"><em>+2.4%</em> from last month</div></div>
<div class="stat"><div class="stat-top">Recipients waiting <span class="stat-icon">✚</span></div><div class="stat-value">${store.recipients.length}</div><div class="stat-note">Across active hospital partners</div></div>
<div class="stat"><div class="stat-top">Potential matches <span class="stat-icon">⇄</span></div><div class="stat-value">${store.matches.length}</div><div class="stat-note"><em>2 need review</em> by authorized staff</div></div>
<div class="stat"><div class="stat-top">Active tracking cases <span class="stat-icon">➜</span></div><div class="stat-value">${store.tracking.length}</div><div class="stat-note">Transportation and procedures</div></div></div>
<div class="dashboard-grid"><div>
<div class="panel"><div class="panel-head"><div><h3>Recent activity</h3><div class="panel-sub">Latest coordination updates</div></div><button class="text-link" onclick="showPage('notifications')">View all →</button></div>
${store.notifications.slice(0,3).map(n=>`<div class="activity"><div class="activity-icon">${n.icon}</div><div style="flex:1"><strong>${esc(n.title)}</strong><p>${esc(n.detail)}</p><time>${esc(n.time)}</time></div>${badge(n.status)}</div>`).join('')}</div>
<div class="panel"><div class="panel-head"><div><h3>Recent transplant tracking</h3><div class="panel-sub">Monitor current stage and status</div></div><button class="text-link" onclick="showPage('tracking')">Open tracking →</button></div>
${store.tracking.map(t=>`<div class="activity"><div class="activity-icon">➜</div><div style="flex:1"><strong>${esc(t.organ)} · ${esc(t.recipient)}</strong><p>${esc(t.stage)} · ${esc(t.hospital)}</p><time>${esc(t.date)}</time></div>${badge(t.status)}</div>`).join('')}</div>
</div><div>
<div class="panel"><div class="panel-head"><div><h3>Priority match reviews</h3><div class="panel-sub">Requires authorized clinical assessment</div></div><button class="text-link" onclick="showPage('matching')">View all</button></div>
${store.matches.slice(0,3).map(m=>`<div class="match-card"><div class="match-top"><strong>${esc(m.organ)} · ${esc(m.id)}</strong>${badge(m.status)}</div><p>${esc(m.donor)} → ${esc(m.recipient)}</p><div class="progress"><span style="width:${m.compatibility}%"></span></div><div class="progress-label"><span>Demo compatibility indicator</span><b>${m.compatibility}%</b></div></div>`).join('')}
<div class="notice">Compatibility values are illustrative demo data, not clinical recommendations. Actual matching and allocation must be determined by qualified transplant professionals.</div></div>
<div class="panel"><div class="panel-head"><div><h3>Quick actions</h3><div class="panel-sub">Common workflow shortcuts</div></div></div><div class="quick-grid">
<button class="quick" onclick="openForm('recipients')"><span>✚</span><strong>Add recipient</strong><small>Create a recipient record</small></button>
<button class="quick" onclick="openForm('hospitals')"><span>⌂</span><strong>Add hospital</strong><small>Register a care facility</small></button>
<button class="quick" onclick="showPage('tracking')"><span>➜</span><strong>Track organ</strong><small>Update transport progress</small></button></div></div></div></div>
<div class="footer-note">LifeLink is a student project prototype. It uses fictional sample data and is not connected to hospital systems. Do not enter real patient or donor information.</div>`}
function recordsPage(type){let data=store[type],config={donors:{title:'Donor management',sub:'Manage donor registration, organ preferences, and eligibility review.',btn:'＋ Register donor',cols:['Donor','Organ','Blood group','Hospital','Eligibility','Registered']},recipients:{title:'Recipient management',sub:'Maintain recipient records and waiting-list status.',btn:'＋ Add recipient',cols:['Recipient','Organ needed','Blood group','Hospital','Priority','Status']},hospitals:{title:'Hospital management',sub:'Maintain hospital profiles, contacts, and verification status.',btn:'＋ Register hospital',cols:['Hospital','City','Contact','Doctors','Verification']}}[type];
let rows=data.map(x=>type==='donors'?`<tr><td>${person(x.name,x.id)}</td><td>${esc(x.organ)}</td><td>${esc(x.blood)}</td><td>${esc(x.hospital)}</td><td>${badge(x.status)}</td><td>${esc(x.date)}</td></tr>`:type==='recipients'?`<tr><td>${person(x.name,x.id)}</td><td>${esc(x.organ)}</td><td>${esc(x.blood)}</td><td>${esc(x.hospital)}</td><td>${badge(x.priority)}</td><td>${badge(x.status)}</td></tr>`:`<tr><td>${person(x.name,x.id)}</td><td>${esc(x.city)}</td><td>${esc(x.contact)}</td><td>${x.doctors}</td><td>${badge(x.status)}</td></tr>`).join('');
return `${header(config.title,config.sub,`<button class="btn" onclick="openForm('${type}')">${config.btn}</button>`)}<div class="panel"><div class="filters"><input id="recordFilter" placeholder="Search ${type}…" oninput="filterTable()"><select id="statusFilter" onchange="filterTable()"><option value="">All statuses</option><option>Eligible</option><option>Under Review</option><option>Verified</option><option>Pending review</option><option>Waiting</option><option>Matching</option></select></div><div id="recordTable">${table(config.cols,rows)}</div><div class="footer-note">Demo records only. Medical eligibility and hospital verification require authorized review.</div></div>`}
function matching() {
  const newReviewButton =
  `<button class="btn" onclick="openForm('matches')">＋ New review</button>`;

  const rows = store.matches.map(m => `
    <tr>
      <td><b>${esc(m.id)}</b></td>
      <td>${esc(m.donor)}</td>
      <td>${esc(m.recipient)}</td>
      <td>${esc(m.organ)}</td>
      <td>
        <div style="min-width:90px">
          <div class="progress">
            <span style="width:${m.compatibility}%"></span>
          </div>
          <small>${m.compatibility}%</small>
        </div>
      </td>
      <td>${badge(m.status)}</td>
      <td>
        <button class="btn secondary small"
          onclick="reviewMatch('${esc(m.id)}')">Review</button>
      </td>
    </tr>
  `).join("");

  return `
    ${header(
      "Organ matching & allocation",
      "Review potential matches and record workflow decisions.",
      newReviewButton
    )}
    <div class="notice">
      <b>Clinical safety:</b> These are fictional examples.
      Compatibility values are illustrative only, not medical scores.
      Matching and allocation require authorized clinical professionals.
    </div>
    <div class="panel">
      <div class="panel-head">
        <div>
          <h3>Potential matches</h3>
          <div class="panel-sub">Cases pending clinical review</div>
        </div>
        <select id="matchFilter" onchange="filterMatches()">
          <option value="">All statuses</option>
          <option>Awaiting approval</option>
          <option>Medical review</option>
          <option>Approved</option>
        </select>
      </div>
      <div id="matchTable">
        ${table(
          ["Match ID", "Donor", "Recipient", "Organ", "Demo indicator", "Workflow status", "Action"],
          rows
        )}
      </div>
    </div>
  `;
}
function tracking() {
  return `${header(
    'Transplant tracking',
    'Track organ transportation, schedule procedures, and update progress.',
    `<button class="btn" onclick="openForm('tracking')">＋ Add tracking case</button>`
  )}
  <div class="notice">
    Transportation and scheduling information shown here is fictional.
    Actual organ handling requires specialist teams and validated protocols.
  </div>
  <div class="panel">
    <div class="panel-head">
      <div>
        <h3>Active cases</h3>
        <div class="panel-sub">Transportation and transplant procedure timeline</div>
      </div>
      <button class="btn secondary small" onclick="openForm('tracking')">
        Schedule / update
      </button>
    </div>
    ${table(
      ['Case ID', 'Recipient', 'Organ', 'Current stage', 'Hospital', 'Date / time', 'Status', 'Action'],
      store.tracking.map(t => `
        <tr>
          <td><b>${esc(t.id)}</b></td>
          <td>${esc(t.recipient)}</td>
          <td>${esc(t.organ)}</td>
          <td>${esc(t.stage)}</td>
          <td>${esc(t.hospital)}</td>
          <td>${esc(t.date)}</td>
          <td>${badge(t.status)}</td>
          <td>
            <button class="btn secondary small"
              onclick="updateTracking('${esc(t.id)}')">Update</button>
          </td>
        </tr>
      `).join('')
    )}
  </div>
  <div class="panel">
    <h3>Process overview</h3>
    <div class="quick-grid" style="margin-top:14px">
      <div class="quick">
        <span>①</span>
        <strong>Retrieval tracking</strong>
        <small>Record authorized retrieval progress.</small>
      </div>
      <div class="quick">
        <span>②</span>
        <strong>Transportation</strong>
        <small>Maintain approved transport updates.</small>
      </div>
      <div class="quick">
        <span>③</span>
        <strong>Transplant schedule</strong>
        <small>Coordinate schedules with hospital teams.</small>
      </div>
    </div>
  </div>`;
}
function notifications() {
  const unreadCount = store.notifications.filter(
    n => !n.read && n.status !== "Read"
  ).length;

  return `${header(
    "Notifications & communication",
    "Keep authorized users informed about matching, approvals, and status changes.",
    '<button class="btn" onclick="markAllRead()">✓ Mark all read</button>'
  )}

  <div class="panel">
    <div class="panel-head">
      <div>
        <h3>Notification centre</h3>
        <div class="panel-sub">Saved in-app notifications</div>
      </div>
      <span class="status blue">${unreadCount} unread</span>
    </div>

    ${
      store.notifications.length
        ? store.notifications.map(n => `
          <div class="activity">
            <div class="activity-icon">${esc(n.icon || "🔔")}</div>

            <div style="flex:1">
              <strong>${esc(n.title)}</strong>
              <p>${esc(n.message || n.detail || "")}</p>
              <time>${esc(n.time || n.date || "")}</time>
            </div>

            ${badge(n.read || n.status === "Read" ? "Read" : "New")}

            ${
              !n.read && n.status !== "Read"
                ? `<button class="btn secondary small"
                    onclick="markRead('${String(n.id).replace(/'/g, "\\'")}')">
                    Mark read
                  </button>`
                : ""
            }
          </div>
        `).join("")
        : '<p class="panel-sub">No notifications yet.</p>'
    }

    <div class="footer-note">
      LifeLink is a student prototype. Use fictional demo data only.
    </div>
  </div>`;
}function users() {
  return `${header(
    'Users & access management',
    'Manage accounts and assign roles.',
    `<button class="btn" onclick="showAddUserForm()">＋ Add user</button>`
  )}

  <div class="notice">
    LifeLink is a student prototype. Use fictional demo accounts and data only.
  </div>

  <div class="panel" id="add-user-panel" hidden>
    <h3>Create a user account</h3>

    <form id="add-user-form" onsubmit="createLifeLinkUser(event)">
      <label for="new-username">Username</label>
      <input
        id="new-username"
        name="username"
        required
        minlength="3"
        autocomplete="off"
        placeholder="Enter username"
      >

      <label for="new-password">Temporary password (minimum 8 characters)</label>
      <input
        id="new-password"
        name="password"
        type="password"
        required
        minlength="8"
        autocomplete="new-password"
        placeholder="Enter temporary password"
      >

      <label for="new-role">Role</label>
      <select id="new-role" name="role" required>
        <option value="hospital">Hospital</option>
        <option value="coordinator">Coordinator</option>
        <option value="admin">Administrator</option>
      </select>

      <div style="margin-top:16px; display:flex; gap:10px;">
        <button class="btn" type="submit">Create account</button>
        <button class="btn secondary" type="button"
          onclick="hideAddUserForm()">Cancel</button>
      </div>

      <p id="add-user-message" role="status"></p>
    </form>
  </div>

  <div class="panel">
    <h3>Registered accounts</h3>
    <div id="users-table-container">Loading users...</div>
  </div>

  <div class="panel">
    <h3>Role descriptions</h3>

    <div class="quick-grid" style="margin-top:14px">
      <div class="quick">
        <span>⚕</span>
        <strong>Hospital</strong>
        <small>For authorized hospital staff.</small>
      </div>

      <div class="quick">
        <span>⇄</span>
        <strong>Coordinator</strong>
        <small>For coordination and scheduling.</small>
      </div>

      <div class="quick">
        <span>⚙</span>
        <strong>Administrator</strong>
        <small>For account and system management.</small>
      </div>
    </div>
  </div>`;
}
function reports(){return `${header('Reports & analytics','High-level operational summaries from sample project data.','<button class="btn secondary" onclick="exportReport()">↓ Export CSV</button>')}<div class="stats"><div class="stat"><div class="stat-top">Donor records <span class="stat-icon">♡</span></div><div class="stat-value">${store.donors.length}</div><div class="stat-note">Sample dataset</div></div><div class="stat"><div class="stat-top">Recipient records <span class="stat-icon">✚</span></div><div class="stat-value">${store.recipients.length}</div><div class="stat-note">Sample dataset</div></div><div class="stat"><div class="stat-top">Hospital partners <span class="stat-icon">⌂</span></div><div class="stat-value">${store.hospitals.length}</div><div class="stat-note">Includes pending verification</div></div><div class="stat"><div class="stat-top">Tracking cases <span class="stat-icon">➜</span></div><div class="stat-value">${store.tracking.length}</div><div class="stat-note">Sample dataset</div></div></div><div class="panel"><h3>Workflow distribution</h3><div style="margin-top:18px">${[['Donors marked eligible',store.donors.filter(x=>x.status==='Eligible').length,store.donors.length],['Matches awaiting approval',store.matches.filter(x=>x.status==='Awaiting approval').length,store.matches.length],['Verified hospitals',store.hospitals.filter(x=>x.status==='Verified').length,store.hospitals.length],['Tracking cases in transit',store.tracking.filter(x=>x.status==='In transit').length,store.tracking.length]].map(a=>`<div style="margin-bottom:18px"><div class="progress-label" style="font-size:12px;margin-bottom:7px"><span>${a[0]}</span><b>${a[1]} / ${a[2]}</b></div><div class="progress"><span style="width:${a[2]?a[1]/a[2]*100:0}%"></span></div></div>`).join('')}</div><div class="footer-note">These counts are based only on the sample records in this browser session. They are not medical outcome statistics.</div></div>`}
async function loadMatches() {
  try {
    const response = await fetch('http://localhost:3000/api/matches');

    if (!response.ok) {
      throw new Error('Could not load matches');
    }

    const savedMatches = await response.json();
    store.matches = savedMatches;

    if (currentPage === 'matching') {
      render();
    }
  } catch (error) {
    console.error('Loading matches failed:', error);
    toast('Could not load saved matches');
  }
}

async function loadRecipients() {
  try {
    const response = await fetch('http://localhost:3000/api/recipients');

    if (!response.ok) {
      throw new Error('Could not load recipients');
    }

    const savedRecipients = await response.json();
    store.recipients = savedRecipients;

    if (currentPage === 'recipients') {
      render();
    }
  } catch (error) {
    console.error('Loading recipients failed:', error);
    toast('Could not load saved recipients');
  }
}

async function loadDonors() {
  try {
    const response = await fetch('http://localhost:3000/api/donors');

    if (!response.ok) {
      throw new Error('Could not load donors');
    }

    const savedDonors = await response.json();
    store.donors = savedDonors;

    if (currentPage === 'donors') {
      render();
    }
  } catch (error) {
    console.error('Loading donors failed:', error);
    toast('Could not load saved donors');
  }
}

async function loadHospitals() {
  try {
    const response = await fetch('http://localhost:3000/api/hospitals');

    if (!response.ok) {
      throw new Error('Could not load hospitals');
    }

    const savedHospitals = await response.json();
    store.hospitals = savedHospitals;

    if (currentPage === 'hospitals') {
      render();
    }
  } catch (error) {
    console.error('Loading hospitals failed:', error);
    toast('Could not load saved hospitals');
  }
}
async function loadTracking() {
  try {
    const response = await fetch('/api/tracking');

    if (!response.ok) {
      throw new Error('Could not load tracking records');
    }

    const savedTracking = await response.json();
    store.tracking = savedTracking;

    if (currentPage === 'tracking') {
      render();
    }
  } catch (error) {
    console.error('Loading tracking failed:', error);
    toast('Could not load saved tracking records');
  }
}
function render(){const c=document.getElementById('content');const pages={dashboard,donors:()=>recordsPage('donors'),recipients:()=>recordsPage('recipients'),hospitals:()=>recordsPage('hospitals'),matching,tracking,notifications,users,reports};c.innerHTML=pages[currentPage]();document.getElementById('bell-count').textContent=store.notifications.filter(n=>n.status==='New').length}
function openForm(type){const labels={
  donors:['Register donor','Name','Organ','Blood group','Hospital'],
  recipients:['Add recipient','Name','Organ needed','Blood group','Hospital'],
  hospitals:['Register hospital','Hospital name','City','Contact email','Doctors'],
  tracking:['Add tracking case','Recipient name','Organ','Current stage','Hospital'],
  matches:['New match review','Donor name','Recipient name','Organ','Compatibility (%)']
};const f=labels[type];if(!f)return;let fields=type==='donors'||type==='recipients'?`<div class="field"><label>${f[1]}</label><input name="name" required></div><div class="field"><label>${f[2]}</label><select name="organ"><option>Kidney</option><option>Liver</option><option>Heart</option><option>Lung</option><option>Cornea</option></select></div><div class="field"><label>${f[3]}</label><select name="blood"><option>O+</option><option>O-</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>Not specified</option></select></div><div class="field"><label>${f[4]}</label><select name="hospital">${store.hospitals.map(h=>`<option>${esc(h.name)}</option>`).join('')}</select></div>`:type==='hospitals'?`<div class="field"><label>${f[1]}</label><input name="name" required></div><div class="field"><label>${f[2]}</label><input name="city" required></div><div class="field"><label>${f[3]}</label><input name="contact" type="email" required></div><div class="field"><label>${f[4]}</label><input name="doctors" type="number" min="0" value="0"></div>`:`<div class="field"><label>${f[1]}</label><input name="recipient" required></div><div class="field"><label>${f[2]}</label><select name="organ"><option>Kidney</option><option>Liver</option><option>Heart</option><option>Lung</option></select></div><div class="field"><label>${f[3]}</label><select name="stage"><option>Transportation</option><option>Transplant procedure</option><option>Retrieval</option></select></div><div class="field"><label>${f[4]}</label><select name="hospital">${store.hospitals.map(h=>`<option>${esc(h.name)}</option>`).join('')}</select></div><div class="field"><label>Date and time</label><input name="date" type="datetime-local" required></div>`;


// Fields for a new organ match review
if (type === 'matches') {
  fields = `
    <div class="field">
      <label>Donor name</label>
      <select name="donor" required>
        ${store.donors.map(d => `<option>${esc(d.name)}</option>`).join('')}
      </select>
    </div>
    <div class="field">
      <label>Recipient name</label>
      <select name="recipient" required>
        ${store.recipients.map(r => `<option>${esc(r.name)}</option>`).join('')}
      </select>
    </div>
    <div class="field">
      <label>Organ</label>
      <select name="organ" required>
        <option>Kidney</option>
        <option>Liver</option>
        <option>Heart</option>
        <option>Lung</option>
      </select>
    </div>
    <div class="field">
      <label>Compatibility score (%)</label>
      <input name="compatibility" type="number" min="0" max="100" value="90" required>
    </div>
    <div class="field">
      <label>Review status</label>
      <select name="status" required>
        <option>Awaiting approval</option>
        <option>Medical review</option>
        <option>Approved</option>
      </select>
    </div>
  `;
}

const content=document.getElementById('content');const old=content.innerHTML;content.innerHTML=`${header(f[0],'Enter fictional sample data for this prototype.')}<div class="panel"><div class="notice">Use sample data only. This prototype is not secure for real patient or donor records.</div><form id="dataForm"><div class="form-grid">${fields}${type==='donors'?'<div class="field"><label>Eligibility status</label><select name="status"><option>Under Review</option><option>Eligible</option></select></div>':''}</div><div class="form-actions"><button type="button" class="btn secondary" onclick="showPage('${currentPage}')">Cancel</button><button class="btn" type="submit">Save record</button></div></form></div>`;
document.getElementById('dataForm').addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));if (type === 'donors') {
  fetch('http://localhost:3000/api/donors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: d.name,
      organ: d.organ,
      bloodGroup: d.blood,
      hospital: d.hospital,
      status: d.status,
      date: new Date().toISOString().slice(0, 10)
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to save donor');
      }
      return response.json();
    })
    .then(savedDonor => {
      store.donors.unshift({
        id: savedDonor.id,
        name: savedDonor.name,
        organ: savedDonor.organ,
        blood: savedDonor.bloodGroup,
        hospital: savedDonor.hospital || 'Not specified',
        status: savedDonor.status,
        date: savedDonor.date || 'Not specified'
      });

      showPage('donors');
      toast('Sample donor saved to backend');
    })
    .catch(error => {
      console.error('Donor save failed:', error);
      toast('Could not save donor. Check the backend.');
    });

  return;
}if (type === 'recipients') {
  fetch('http://localhost:3000/api/recipients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: d.name,
      organ: d.organ,
      blood: d.blood,
      hospital: d.hospital,
      priority: 'Medium',
      status: 'Waiting'
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to save recipient');
      }
      return response.json();
    })
    .then(savedRecipient => {
      store.recipients.unshift(savedRecipient);
      showPage('recipients');
      toast('Recipient saved to backend');
    })
    .catch(error => {
      console.error('Recipient save failed:', error);
      toast('Could not save recipient. Check the backend.');
    });

  return;
}if (type === 'hospitals') {
  fetch('http://localhost:3000/api/hospitals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: d.name,
      city: d.city,
      contact: d.contact,
      doctors: d.doctors,
      status: d.status || 'Pending review'
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to save hospital');
      }
      return response.json();
    })
    .then(savedHospital => {
      store.hospitals.unshift(savedHospital);
      showPage('hospitals');
      toast('Hospital saved to backend');
    })
    .catch(error => {
      console.error('Hospital save failed:', error);
      toast('Could not save hospital. Check the backend.');
    });

  return;
}if (type === 'matches') {
  fetch('http://localhost:3000/api/matches', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      donor: d.donor,
      recipient: d.recipient,
      organ: d.organ,
      compatibility: d.compatibility,
      status: d.status
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to save match');
      }
      return response.json();
    })
    .then(savedMatch => {
      store.matches.unshift(savedMatch);
      showPage('matching');
      toast('Match review saved to backend');
    })
    .catch(error => {
      console.error('Match save failed:', error);
      toast('Could not save match. Check the backend.');
    });

  return;
}if (type === 'tracking') {
  fetch('/api/tracking', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      recipient: d.recipient,
      organ: d.organ,
      stage: d.stage,
      status: d.stage === 'Transplant procedure'
        ? 'Scheduled'
        : 'In transit',
      hospital: d.hospital,
      date: d.date ? d.date.replace('T', ' ') : ''
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to save tracking case');
      }
      return response.json();
    })
    .then(savedTracking => {
      store.tracking.unshift(savedTracking);
      store.notifications.unshift({
        icon: '✓',
        title: 'New tracking case added',
        detail: 'A fictional tracking case was created.',
        time: 'Just now',
        status: 'New'
      });

      showPage('tracking');
      toast('Tracking case saved to backend');
    })
    .catch(error => {
      console.error('Tracking save failed:', error);
      toast('Could not save tracking case. Check the backend.');
    });

  return;
}
});
}
function filterTable(){const q=(document.getElementById('recordFilter')?.value||'').toLowerCase(),s=(document.getElementById('statusFilter')?.value||'').toLowerCase();document.querySelectorAll('#recordTable tbody tr').forEach(tr=>{const txt=tr.innerText.toLowerCase();tr.style.display=txt.includes(q)&&(!s||txt.includes(s))?'':'none'})}
function filterMatches(){const s=(document.getElementById('matchFilter')?.value||'').toLowerCase();document.querySelectorAll('#matchTable tbody tr').forEach(tr=>tr.style.display=tr.innerText.toLowerCase().includes(s)?'':'none')}
function reviewMatch(id){const m=store.matches.find(x=>x.id===id);if(!m)return;const decision=prompt(`Review ${id}: enter "Medical review", "Awaiting approval", or "Approved" (demo workflow only).`,m.status);if(decision&&['Medical review','Awaiting approval','Approved'].includes(decision)){m.status=decision;store.notifications.unshift({icon:'⇄',title:'Match workflow updated',detail:`${id} moved to ${decision}.`,time:'Just now',status:'New'});render();toast('Demo workflow status updated')}}
async function updateTracking(id) {
  const t = store.tracking.find((x) => x.id === id);

  if (!t) return;

  const status = prompt(
    `Update status for ${id}: In transit, Delivered to hospital, Scheduled, Completed`,
    t.status
  );

  const allowedStatuses = [
    "In transit",
    "Delivered to hospital",
    "Scheduled",
    "Completed"
  ];

  if (!status || !allowedStatuses.includes(status)) {
    if (status !== null && status !== "") {
      toast("Invalid status. Please try again.");
    }
    return;
  }

  let stage = t.stage;

  if (status === "Delivered to hospital") {
    stage = "Hospital handover";
  } else if (status === "Completed") {
    stage = "Transplant procedure";
  }

  try {
    const response = await fetch(`/api/tracking/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status, stage })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Could not update tracking");
    }

    Object.assign(t, result.record);

    store.notifications.unshift({
      icon: "➜",
      title: "Tracking status updated",
      detail: `Case ${id} is now ${status}.`,
      time: "Just now",
      status: "New"
    });

    render();
    toast("Tracking updated and saved!");
  } catch (error) {
    console.error("Tracking update failed:", error);
    toast("Could not save tracking update. Please try again.");
  }
}function markRead(i){store.notifications[i].status='Read';render()}function markAllRead(){store.notifications.forEach(n=>n.status='Read');render();toast('All notifications marked read')}
function exportReport(){const rows=[['Type','ID','Name','Status'],...store.donors.map(x=>['Donor',x.id,x.name,x.status]),...store.recipients.map(x=>['Recipient',x.id,x.name,x.status]),...store.hospitals.map(x=>['Hospital',x.id,x.name,x.status])];const csv=rows.map(r=>r.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='lifelink-demo-report.csv';a.click();URL.revokeObjectURL(a.href);toast('Report exported')}
document.querySelectorAll('.nav-btn').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.page)));
document.getElementById('globalSearch').addEventListener('keydown',e=>{if(e.key==='Enter'){const q=e.target.value.toLowerCase();const found=[['donors',store.donors],['recipients',store.recipients],['hospitals',store.hospitals],['tracking',store.tracking],['matching',store.matches]].find(([k,arr])=>arr.some(x=>JSON.stringify(x).toLowerCase().includes(q)));if(found){showPage(found[0]);setTimeout(()=>{const f=document.getElementById('recordFilter');if(f){f.value=e.target.value;filterTable()}},0)}else toast(q?'No matching sample record found':'Enter a name or ID to search')}})
render();

async function testLifeLinkBackend() {
  try {
    const response = await fetch("http://localhost:3000/api/health");
    const data = await response.json();
    console.log("LifeLink backend connected:", data);
  } catch (error) {
    console.error("LifeLink backend connection failed:", error);
  }
}

testLifeLinkBackend();

async function testLifeLinkDonors() {
  try {
    const response = await fetch("http://localhost:3000/api/donors");

    if (!response.ok) {
      throw new Error("Could not load donor data");
    }

    const donors = await response.json();

    console.log("LifeLink donor data:", donors);
  } catch (error) {
    console.error("Donor data request failed:", error);
  }
}

testLifeLinkDonors();

async function loadDonorsFromBackend() {
  try {
    const response = await fetch("http://localhost:3000/api/donors");

    if (!response.ok) {
      throw new Error("Failed to load donors");
    }

    const backendDonors = await response.json();

    store.donors = backendDonors.map((donor) => ({
      id: donor.id,
      name: donor.name,
      organ: donor.organ,
      blood: donor.bloodGroup,
      hospital: donor.hospital || "Not specified",
      status: donor.status,
      date: donor.date || "Not specified"
    }));

    console.log("Donors loaded into LifeLink:", store.donors);
  } catch (error) {
    console.error("Could not load donors from backend:", error);
  }
}
async function loadRecipientsFromBackend() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/recipients"
    );

    if (!response.ok) {
      throw new Error("Failed to load recipients");
    }

    const backendRecipients = await response.json();

    store.recipients = backendRecipients;

    console.log(
      "Recipients loaded into LifeLink:",
      store.recipients
    );
  } catch (error) {
    console.error(
      "Could not load recipients from backend:",
      error
    );
  }
}
async function loadHospitalsFromBackend() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/hospitals"
    );

    if (!response.ok) {
      throw new Error("Failed to load hospitals");
    }

    const backendHospitals = await response.json();

    store.hospitals = backendHospitals;

    console.log(
      "Hospitals loaded into LifeLink:",
      store.hospitals
    );
  } catch (error) {
    console.error(
      "Could not load hospitals from backend:",
      error
    );
  }
}
async function loadMatchesFromBackend() {
  try {
    const response = await fetch(
      "http://localhost:3000/api/matches"
    );

    if (!response.ok) {
      throw new Error("Failed to load matches");
    }

    const backendMatches = await response.json();

    store.matches = backendMatches;

    console.log(
      "Matches loaded into LifeLink:",
      store.matches
    );
  } catch (error) {
    console.error(
      "Could not load matches from backend:",
      error
    );
  }
}
Promise.all([
  loadDonorsFromBackend(),
  loadRecipientsFromBackend(),
  loadHospitalsFromBackend(),
  loadMatchesFromBackend(),
  loadTracking()
]).then(() => {
  render();
});
async function loadLifeLinkUsers() {
  const container = document.getElementById("users-table-container");

  if (!container) return;

  container.textContent = "Loading users...";

  try {
    const response = await fetch("/api/users", {
      credentials: "same-origin"
    });

    if (!response.ok) {
      throw new Error(
        response.status === 401
          ? "Please log in again."
          : response.status === 403
          ? "Administrator access is required."
          : "Could not load users."
      );
    }

    const users = await response.json();

    if (!users.length) {
      container.textContent = "No user accounts found.";
      return;
    }

    const rows = users.map(user => `
      <tr>
        <td>${esc(user.username)}</td>
        <td>${esc(user.role)}</td>
        <td>${user.active ? "Active" : "Inactive"}</td>
      </tr>
    `).join("");

    container.innerHTML = `
      <div style="overflow-x:auto">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  } catch (error) {
    container.textContent = error.message;
  }
}

function showAddUserForm() {
  const panel = document.getElementById("add-user-panel");

  if (panel) {
    panel.hidden = false;
  }
}

function hideAddUserForm() {
  const panel = document.getElementById("add-user-panel");

  if (panel) {
    panel.hidden = true;
  }
}

async function createLifeLinkUser(event) {
  event.preventDefault();

  const form = event.target;
  const message = document.getElementById("add-user-message");
  const submitButton = form.querySelector('button[type="submit"]');

  const username = form.elements.username.value.trim();
  const password = form.elements.password.value;
  const role = form.elements.role.value;

  message.textContent = "Creating account...";
  submitButton.disabled = true;

  try {
    const response = await fetch("/api/users", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password, role })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.message || "Could not create account.");
    }

    message.textContent = "Account created successfully.";
    form.reset();

    await loadLifeLinkUsers();

    if (typeof toast === "function") {
      toast("User account created successfully.");
    }
  } catch (error) {
    message.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
}
async function loadNotifications() {
  try {
    const response = await fetch("/api/notifications", {
      credentials: "same-origin"
    });

    if (!response.ok) {
      throw new Error("Unable to load notifications.");
    }

    const notifications = await response.json();

    store.notifications = notifications.map(n => ({
      ...n,
      status: n.read ? "Read" : "New",
      detail: n.message || n.detail || "",
      time: n.time || n.date || ""
    }));

    if (currentPage === "notifications") {
      render();
    }

    const unreadCount = store.notifications.filter(n => !n.read).length;
    const bellCount = document.getElementById("bell-count");

    if (bellCount) {
      bellCount.textContent = unreadCount;
    }
  } catch (error) {
    console.error("Notification loading failed:", error);
  }
}
async function markRead(id) {
  try {
    const response = await fetch(
      `/api/notifications/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ read: true })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Could not mark notification as read.");
    }

    await loadNotifications();

    if (typeof toast === "function") {
      toast("Notification marked as read.");
    }
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}
async function markAllRead() {
  try {
    const unreadNotifications = store.notifications.filter(n => !n.read);

    for (const notification of unreadNotifications) {
      const response = await fetch(
        `/api/notifications/${encodeURIComponent(notification.id)}`,
        {
          method: "PUT",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ read: true })
        }
      );

      if (!response.ok) {
        throw new Error("Could not mark all notifications as read.");
      }
    }

    await loadNotifications();

    if (typeof toast === "function") {
      toast("All notifications marked as read.");
    }
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}
async function createTestNotification() {
  try {
    const response = await fetch("/api/notifications", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: "LifeLink test notification",
        message: "Your notification system is working correctly.",
        type: "info",
        read: false
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to create notification.");
    }

    await loadNotifications();

    if (typeof toast === "function") {
      toast("Test notification created!");
    }
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}