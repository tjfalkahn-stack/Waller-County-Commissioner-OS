import { initialData, DEMO_NOTICE, roleConcepts, today } from "./commissioner/sampleData.js";
import {
  attentionItems,
  budgetSummary,
  captureFieldIssue,
  createCase,
  isOverdue,
  morningBrief,
  overdueCommitments,
  precinctPulse,
  projectBudgetPosition,
  searchRecords,
  updateCaseStatus,
  upcomingCommitments
} from "./commissioner/services.js";

const app = document.querySelector("#app");
let state = structuredClone(initialData);
let route = "command";
let query = "";

const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
const pct = (value) => `${Math.round(value)}%`;
const badge = (label, tone = "") => `<span class="badge ${tone}">${label}</span>`;
const byId = (id) => document.getElementById(id);

const nav = [
  ["command", "Command Center"],
  ["brief", "Morning Brief"],
  ["cases", "Constituent Service"],
  ["infrastructure", "Roads & Infrastructure"],
  ["projects", "Projects"],
  ["field", "Field Desk"],
  ["meetings", "Agenda & Meetings"],
  ["budget", "Budget"],
  ["commitments", "Commitments"],
  ["documents", "Documents"],
  ["reports", "Reports"]
];

function priorityTone(priority) {
  return { Critical: "danger", High: "warn", Medium: "info", Low: "muted" }[priority] || "muted";
}

function statusTone(status) {
  if (["Resolved", "Closed", "Complete"].includes(status)) return "good";
  if (["At risk", "Needs review", "Overdue"].includes(status)) return "danger";
  if (["Assigned", "In progress", "Reviewing"].includes(status)) return "info";
  return "muted";
}

function shell(content) {
  const results = searchRecords(state, query);
  app.innerHTML = `
    <aside class="sidebar">
      <div class="brand">
        <span class="seal">P3</span>
        <div>
          <strong>Waller County Commissioner OS</strong>
          <small>Precinct 3 Command Center MVP</small>
        </div>
      </div>
      <nav>${nav.map(([key, label]) => `<button data-route="${key}" class="${route === key ? "active" : ""}">${label}</button>`).join("")}</nav>
      <section class="roleBox">
        <span>Role Foundation</span>
        ${roleConcepts.map((role) => `<small>${role}</small>`).join("")}
      </section>
    </aside>
    <main class="workspace">
      <header class="topbar">
        <div>
          <span class="eyebrow">Demo workspace - ${today}</span>
          <h1>${nav.find(([key]) => key === route)?.[1] || "Command Center"}</h1>
        </div>
        <label class="search">
          <span>Search</span>
          <input id="globalSearch" value="${escapeHtml(query)}" placeholder="roads, commitments, resident, budget..." />
        </label>
      </header>
      <div class="demoNotice">${DEMO_NOTICE}</div>
      ${query ? renderSearch(results) : ""}
      ${content}
    </main>
  `;
  document.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => {
      route = button.dataset.route;
      query = "";
      render();
    });
  });
  byId("globalSearch").addEventListener("input", (event) => {
    query = event.target.value;
    render();
  });
}

function renderSearch(results) {
  return `
    <section class="panel searchResults">
      <div class="sectionHead">
        <div><span>Unified Search</span><h2>${results.length} matching records</h2></div>
      </div>
      <div class="recordGrid compact">
        ${results.map((item) => card(item.module, item.title, `${item.id} ${item.status ? "- " + item.status : ""}`, [item.priority ? badge(item.priority, priorityTone(item.priority)) : ""])).join("") || empty("No supported records match this search.")}
      </div>
    </section>
  `;
}

function commandCenter() {
  const pulse = precinctPulse(state);
  const brief = morningBrief(state);
  const attention = attentionItems(state);
  return shell(`
    <section class="heroBand">
      <div>
        <span>Commissioner Command Center</span>
        <h2>What needs attention before the day gets away from the office.</h2>
        <p>Priority service issues, field observations, commitments, agenda work, and budget posture in one operating picture.</p>
      </div>
      <button class="primary" data-open-brief>Open Morning Brief</button>
    </section>
    <section class="metricStrip">
      ${metric("Open Cases", pulse.openCases, "Constituent matters still moving")}
      ${metric("Road / Infrastructure", pulse.infrastructureIssues, "Unresolved physical issues")}
      ${metric("Active Projects", pulse.activeProjects, "Precinct initiatives")}
      ${metric("Overdue Items", pulse.overdueItems, "Follow-ups and promises", "danger")}
      ${metric("Budget Remaining", money(pulse.budget.remaining), `${money(pulse.budget.spent)} spent`)}
    </section>
    <section class="twoCol">
      <div class="panel">
        <div class="sectionHead"><div><span>Today</span><h2>Priority issues and actions</h2></div></div>
        <div class="stack">${attention.slice(0, 6).map((item) => actionRow(item)).join("")}</div>
      </div>
      <div class="panel">
        <div class="sectionHead"><div><span>Morning Command Brief</span><h2>${brief.headline}</h2></div></div>
        <p class="briefText">Start with overdue resident commitments, drainage risk, the road material agenda item, and the over-budget Macedonia Road repair package.</p>
        <div class="miniList">
          ${brief.meetings.map((meeting) => `<div><strong>${meeting.date}</strong><span>${meeting.agendaItem}</span></div>`).join("")}
        </div>
      </div>
    </section>
    <section class="threeCol">
      ${modulePreview("Constituent Service", state.cases, "resident", "description")}
      ${modulePreview("Roads & Infrastructure", state.infrastructure, "location", "description")}
      ${modulePreview("Commitments", overdueCommitments(state), "commitment", "personOrg")}
    </section>
  `);
}

function morningBriefView() {
  const brief = morningBrief(state);
  return shell(`
    <section class="briefPage">
      <div class="briefHeader">
        <span>Executive Brief - ${brief.date}</span>
        <h2>${brief.headline}</h2>
        <p>Structured for future AI-generated intelligence, currently generated from the local MVP data layer with no paid provider.</p>
      </div>
      <div class="twoCol">
        <div class="panel"><div class="sectionHead"><div><span>Needs Attention</span><h2>Top priority stack</h2></div></div><div class="stack">${brief.attention.map(actionRow).join("")}</div></div>
        <div class="panel"><div class="sectionHead"><div><span>Pre-Meeting Brief</span><h2>Upcoming agenda work</h2></div></div>${brief.meetings.map(meetingCard).join("")}</div>
      </div>
      <section class="panel">
        <div class="sectionHead"><div><span>Risk and Budget</span><h2>Projects requiring commissioner awareness</h2></div></div>
        <div class="recordGrid">${brief.atRiskProjects.map(projectCard).join("")}</div>
      </section>
      <section class="panel">
        <div class="sectionHead"><div><span>Field Intelligence</span><h2>Recent route observations</h2></div></div>
        <div class="recordGrid compact">${brief.fieldUpdates.map((item) => card(item.location, item.note, `${item.observedAt} - ${item.disposition}`, [badge(item.priority, priorityTone(item.priority))])).join("")}</div>
      </section>
    </section>
  `);
}

function casesView() {
  return shell(`
    <section class="panel">
      <div class="sectionHead">
        <div><span>Case Management</span><h2>Resident service workflow</h2></div>
        <button class="primary" id="newCase">Create Case</button>
      </div>
      <div class="recordGrid">${state.cases.map(caseCard).join("")}</div>
    </section>
  `);
}

function infrastructureView() {
  return shell(`
    <section class="panel">
      <div class="sectionHead"><div><span>Roads & Infrastructure</span><h2>Conditions, maintenance, drainage, signs, facilities</h2></div></div>
      <div class="recordGrid">${state.infrastructure.map(infraCard).join("")}</div>
    </section>
  `);
}

function projectsView() {
  return shell(`
    <section class="panel">
      <div class="sectionHead"><div><span>Precinct Projects</span><h2>Progress, budget, milestones, risks</h2></div></div>
      <div class="recordGrid wide">${state.projects.map(projectCard).join("")}</div>
    </section>
  `);
}

function fieldView() {
  return shell(`
    <section class="twoCol">
      <form class="panel formPanel" id="fieldForm">
        <div class="sectionHead"><div><span>Field Desk</span><h2>Rapid issue capture</h2></div></div>
        ${input("location", "Location")}
        ${input("category", "Category")}
        <label>Priority<select name="priority"><option>High</option><option>Medium</option><option>Low</option><option>Critical</option></select></label>
        <label>Disposition<select name="disposition"><option>Needs triage</option><option>Convert to constituent case</option><option>Convert to infrastructure follow-up</option><option>Project follow-up</option></select></label>
        <label>Observation<textarea name="note" required></textarea></label>
        <button class="primary">Capture Field Issue</button>
      </form>
      <section class="panel">
        <div class="sectionHead"><div><span>Recent Field Intelligence</span><h2>Observed and reported issues</h2></div></div>
        <div class="stack">${state.fieldItems.map((item) => actionRow({ module: item.category, title: item.location, detail: item.note, priority: item.priority, due: item.observedAt })).join("")}</div>
      </section>
    </section>
  `);
}

function meetingsView() {
  return shell(`
    <section class="panel">
      <div class="sectionHead"><div><span>County Agenda & Meetings</span><h2>Pre-meeting briefing workspace</h2></div></div>
      <div class="recordGrid wide">${state.meetings.map(meetingCard).join("")}</div>
    </section>
  `);
}

function budgetView() {
  const summary = budgetSummary(state.budgetItems);
  return shell(`
    <section class="metricStrip">
      ${metric("Approved", money(summary.approved), "Total executive visibility")}
      ${metric("Committed", money(summary.committed), "Planned obligations")}
      ${metric("Spent", money(summary.spent), "Recorded MVP spend")}
      ${metric("Remaining", money(summary.remaining), "Approved minus committed/spent", summary.remaining < 0 ? "danger" : "")}
    </section>
    <section class="panel">
      <div class="sectionHead"><div><span>Precinct Budget</span><h2>Executive budget visibility, not accounting software</h2></div></div>
      <table><thead><tr><th>Category</th><th>Approved</th><th>Committed</th><th>Spent</th><th>Remaining</th><th>Project</th><th>Vendor / Payee</th></tr></thead>
      <tbody>${state.budgetItems.map((item) => `<tr><td>${item.category}</td><td>${money(item.approved)}</td><td>${money(item.committed)}</td><td>${money(item.spent)}</td><td>${money(item.approved - item.committed - item.spent)}</td><td>${item.projectId || "None"}</td><td>${item.vendor}</td></tr>`).join("")}</tbody></table>
    </section>
  `);
}

function commitmentsView() {
  return shell(`
    <section class="twoCol">
      <div class="panel"><div class="sectionHead"><div><span>Overdue</span><h2>Promises needing action</h2></div></div><div class="stack">${overdueCommitments(state).map(commitmentRow).join("")}</div></div>
      <div class="panel"><div class="sectionHead"><div><span>Upcoming</span><h2>Next 7 days</h2></div></div><div class="stack">${upcomingCommitments(state).map(commitmentRow).join("")}</div></div>
    </section>
  `);
}

function documentsView() {
  return shell(`
    <section class="panel">
      <div class="sectionHead"><div><span>Document Workspace</span><h2>Metadata and references only</h2></div></div>
      <div class="recordGrid">${state.documents.map((doc) => card(doc.title, doc.type, `${doc.id} - ${doc.relatedTo}<br>${doc.storageNote}`, [badge(doc.status, statusTone(doc.status))])).join("")}</div>
    </section>
  `);
}

function reportsView() {
  const reports = [
    ["Morning Brief", morningBrief(state).headline],
    ["Weekly Precinct Brief", `${precinctPulse(state).openCases} open cases, ${precinctPulse(state).infrastructureIssues} unresolved infrastructure issues, ${precinctPulse(state).activeProjects} active projects.`],
    ["Open Issues", `${attentionItems(state).length} priority or overdue records across service, infrastructure, and commitments.`],
    ["Project Status", state.projects.map((project) => `${project.name}: ${pct(project.progress)} ${project.status}`).join("; ")],
    ["Constituent Case Summary", state.cases.map((item) => `${item.status}: ${item.resident}`).join("; ")],
    ["Infrastructure Summary", state.infrastructure.map((item) => `${item.priority} ${item.type}: ${item.location}`).join("; ")],
    ["Commitment Report", `${overdueCommitments(state).length} overdue and ${upcomingCommitments(state).length} upcoming commitments.`]
  ];
  return shell(`
    <section class="panel">
      <div class="sectionHead"><div><span>Briefings & Reports</span><h2>Executive outputs ready for print/export expansion</h2></div><button class="secondary" onclick="window.print()">Print</button></div>
      <div class="recordGrid wide">${reports.map(([title, body]) => card(title, body, "Generated from local demo data layer", [badge("Demo report", "info")])).join("")}</div>
    </section>
  `);
}

function caseCard(item) {
  const overdue = isOverdue(item.followUpDate, item.status);
  return card(item.resident, item.description, `${item.location}<br>Owner: ${item.owner}<br>Follow-up: ${item.followUpDate}<br>Commitment: ${item.commitmentMade}`, [
    badge(item.priority, priorityTone(item.priority)),
    badge(overdue ? "Overdue" : item.status, overdue ? "danger" : statusTone(item.status)),
    `<button class="mini" data-resolve="${item.id}">Resolve</button>`
  ]);
}

function infraCard(item) {
  const overdue = isOverdue(item.followUpDate, item.status);
  return card(item.location, item.description, `Responsible: ${item.responsibleParty}<br>Follow-up: ${item.followUpDate}<br>Notes: ${item.notes.join(" ")}`, [
    badge(item.priority, priorityTone(item.priority)),
    badge(overdue ? "Overdue" : item.status, overdue ? "danger" : statusTone(item.status))
  ]);
}

function projectCard(project) {
  const position = projectBudgetPosition(project);
  return card(project.name, `${project.category} - ${project.location}`, `Owner: ${project.owner}<br>Budget: ${money(project.budget)} - Spent: ${money(project.spent)} - Committed: ${money(project.committed)} - Remaining: ${money(position.remaining)}<div class="progress"><span style="width:${project.progress}%"></span></div>Milestones: ${project.milestones.join(", ")}<br>Risks: ${project.risks.join(", ")}`, [
    badge(project.status, statusTone(project.status)),
    badge(`${project.progress}%`, "info"),
    position.isOverBudget ? badge("Over budget", "danger") : badge(`${position.usedPercent}% used`, "muted")
  ]);
}

function meetingCard(item) {
  return card(item.agendaItem, item.briefingNotes, `Date: ${item.date}<br>Department: ${item.department}<br>Fiscal impact: ${money(item.fiscalImpact)}<br>Position: ${item.positionNotes}<br>Questions: ${item.questions.join(" ")}`, [
    badge(item.status, statusTone(item.status)),
    badge(`${item.documents.length} docs`, "muted")
  ]);
}

function commitmentRow(item) {
  return actionRow({ module: item.owner, title: item.commitment, detail: `${item.personOrg} - ${item.related}`, priority: isOverdue(item.dueDate, item.status) ? "High" : "Medium", due: item.dueDate });
}

function actionRow(item) {
  return `<article class="actionRow"><div><strong>${item.title}</strong><span>${item.module} - ${item.detail}</span></div><div>${badge(item.priority, priorityTone(item.priority))}<small>${item.due || ""}</small></div></article>`;
}

function modulePreview(title, records, titleKey, bodyKey) {
  return `<section class="panel"><div class="sectionHead"><div><span>${title}</span><h2>${records.length} records</h2></div></div><div class="stack">${records.slice(0, 3).map((record) => actionRow({ module: record.status || record.priority, title: record[titleKey], detail: record[bodyKey], priority: record.priority || "Medium", due: record.followUpDate || record.dueDate || record.deadline })).join("")}</div></section>`;
}

function metric(label, value, detail, tone = "") {
  return `<article class="metric ${tone}"><span>${label}</span><strong>${value}</strong><small>${detail}</small></article>`;
}

function card(title, body, meta, chips = []) {
  return `<article class="recordCard"><div class="chips">${chips.join("")}</div><h3>${title}</h3><p>${body}</p><small>${meta}</small></article>`;
}

function input(name, label) {
  return `<label>${label}<input name="${name}" required /></label>`;
}

function empty(message) {
  return `<p class="empty">${message}</p>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

function render() {
  const views = {
    command: commandCenter,
    brief: morningBriefView,
    cases: casesView,
    infrastructure: infrastructureView,
    projects: projectsView,
    field: fieldView,
    meetings: meetingsView,
    budget: budgetView,
    commitments: commitmentsView,
    documents: documentsView,
    reports: reportsView
  };
  views[route]();
  bindActions();
}

function bindActions() {
  document.querySelector("[data-open-brief]")?.addEventListener("click", () => {
    route = "brief";
    render();
  });
  byId("newCase")?.addEventListener("click", () => {
    const resident = prompt("Resident/contact name for demo case:");
    if (!resident) return;
    state = createCase(state, {
      resident,
      category: "General",
      location: "Precinct 3",
      description: "New demo case created from MVP workflow.",
      priority: "Medium",
      followUpDate: today,
      commitmentMade: "Office will follow up."
    });
    render();
  });
  document.querySelectorAll("[data-resolve]").forEach((button) => {
    button.addEventListener("click", () => {
      state = updateCaseStatus(state, button.dataset.resolve, "Resolved");
      render();
    });
  });
  byId("fieldForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    state = captureFieldIssue(state, Object.fromEntries(new FormData(event.currentTarget)));
    render();
  });
}

render();
