import { today } from "./sampleData.js";

const dateValue = (value) => new Date(`${value}T00:00:00`).getTime();
const money = (value) => Number(value || 0);

export function isOverdue(date, status, asOf = today) {
  return Boolean(date) && !["Resolved", "Closed", "Complete"].includes(status) && dateValue(date) < dateValue(asOf);
}

export function budgetSummary(items) {
  return items.reduce(
    (summary, item) => {
      summary.approved += money(item.approved);
      summary.committed += money(item.committed);
      summary.spent += money(item.spent);
      summary.remaining += money(item.approved) - money(item.committed) - money(item.spent);
      return summary;
    },
    { approved: 0, committed: 0, spent: 0, remaining: 0 }
  );
}

export function projectBudgetPosition(project) {
  const remaining = money(project.budget) - money(project.committed) - money(project.spent);
  return {
    remaining,
    isOverBudget: remaining < 0,
    usedPercent: project.budget ? Math.round(((money(project.spent) + money(project.committed)) / money(project.budget)) * 100) : 0
  };
}

export function overdueCommitments(commitments, asOf = today) {
  return commitments.filter((item) => isOverdue(item.dueDate, item.status, asOf));
}

export function upcomingCommitments(commitments, asOf = today) {
  const start = dateValue(asOf);
  const end = start + 7 * 24 * 60 * 60 * 1000;
  return commitments.filter((item) => {
    const due = dateValue(item.dueDate);
    return due >= start && due <= end && !["Resolved", "Closed", "Complete"].includes(item.status);
  });
}

export function priorityRank(priority) {
  return { Critical: 0, High: 1, Medium: 2, Low: 3 }[priority] ?? 4;
}

export function attentionItems(data, asOf = today) {
  const cases = data.cases
    .filter((item) => isOverdue(item.followUpDate, item.status, asOf) || ["Critical", "High"].includes(item.priority))
    .map((item) => ({ module: "Constituent Service", title: item.resident, detail: item.description, priority: item.priority, due: item.followUpDate, id: item.id }));
  const infra = data.infrastructure
    .filter((item) => isOverdue(item.followUpDate, item.status, asOf) || ["Critical", "High"].includes(item.priority))
    .map((item) => ({ module: "Roads & Infrastructure", title: item.location, detail: item.description, priority: item.priority, due: item.followUpDate, id: item.id }));
  const commitments = overdueCommitments(data.commitments, asOf).map((item) => ({
    module: "Commitments",
    title: item.commitment,
    detail: item.personOrg,
    priority: "High",
    due: item.dueDate,
    id: item.id
  }));
  return [...cases, ...infra, ...commitments].sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || dateValue(a.due) - dateValue(b.due));
}

export function precinctPulse(data, asOf = today) {
  const budget = budgetSummary(data.budgetItems);
  return {
    openCases: data.cases.filter((item) => !["Resolved", "Closed"].includes(item.status)).length,
    infrastructureIssues: data.infrastructure.filter((item) => !["Resolved", "Closed"].includes(item.status)).length,
    activeProjects: data.projects.filter((item) => !["Complete", "Closed"].includes(item.status)).length,
    overdueItems:
      data.cases.filter((item) => isOverdue(item.followUpDate, item.status, asOf)).length +
      data.infrastructure.filter((item) => isOverdue(item.followUpDate, item.status, asOf)).length +
      overdueCommitments(data.commitments, asOf).length,
    budget
  };
}

export function morningBrief(data, asOf = today) {
  const attention = attentionItems(data, asOf).slice(0, 5);
  const meetings = data.meetings.filter((item) => dateValue(item.date) >= dateValue(asOf)).sort((a, b) => dateValue(a.date) - dateValue(b.date));
  const atRiskProjects = data.projects.filter((project) => project.status === "At risk" || projectBudgetPosition(project).isOverBudget);
  return {
    date: asOf,
    headline: `${attention.length} priority items, ${meetings.length} upcoming meetings, ${overdueCommitments(data.commitments, asOf).length} overdue commitments`,
    attention,
    meetings: meetings.slice(0, 3),
    atRiskProjects,
    budget: budgetSummary(data.budgetItems),
    fieldUpdates: data.fieldItems.slice(0, 3)
  };
}

const searchableModules = [
  ["cases", "Constituent Service", ["resident", "category", "location", "description", "priority", "owner", "status", "commitmentMade"]],
  ["infrastructure", "Roads & Infrastructure", ["type", "location", "description", "priority", "status", "responsibleParty"]],
  ["projects", "Projects", ["name", "category", "owner", "location", "status", "risks", "vendors", "notes"]],
  ["meetings", "County Agenda & Meetings", ["agendaItem", "department", "briefingNotes", "positionNotes", "questions", "followUp", "status"]],
  ["commitments", "Commitments", ["commitment", "personOrg", "related", "owner", "status", "outcome"]],
  ["documents", "Documents", ["title", "type", "relatedTo", "owner", "status", "storageNote"]],
  ["fieldItems", "Field Desk", ["location", "category", "note", "priority", "capturedBy", "disposition"]]
];

export function searchRecords(data, query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return [];
  return searchableModules.flatMap(([key, module, fields]) =>
    data[key]
      .filter((record) => fields.some((field) => String(Array.isArray(record[field]) ? record[field].join(" ") : record[field] || "").toLowerCase().includes(q)))
      .map((record) => ({
        module,
        id: record.id,
        title: record.resident || record.location || record.name || record.agendaItem || record.commitment || record.title || record.note,
        status: record.status || record.disposition || "",
        priority: record.priority || ""
      }))
  );
}

export function createCase(data, input) {
  const next = {
    id: `case-${Date.now()}`,
    demo: true,
    resident: input.resident || "New sample resident",
    contact: input.contact || "",
    category: input.category || "General",
    location: input.location || "",
    description: input.description || "",
    priority: input.priority || "Medium",
    owner: input.owner || "Staff",
    status: input.status || "New",
    notes: input.notes ? [input.notes] : [],
    documents: [],
    followUpDate: input.followUpDate || today,
    commitmentMade: input.commitmentMade || "",
    resolution: "",
    history: [`${today} created in MVP workspace`]
  };
  return { ...data, cases: [next, ...data.cases] };
}

export function updateCaseStatus(data, id, status) {
  return {
    ...data,
    cases: data.cases.map((item) =>
      item.id === id ? { ...item, status, history: [...item.history, `${today} status changed to ${status}`], resolution: status === "Resolved" ? "Marked resolved in MVP workflow." : item.resolution } : item
    )
  };
}

export function captureFieldIssue(data, input) {
  const next = {
    id: `field-${Date.now()}`,
    demo: true,
    observedAt: today,
    location: input.location || "",
    category: input.category || "Field observation",
    note: input.note || "",
    priority: input.priority || "Medium",
    capturedBy: input.capturedBy || "Staff",
    disposition: input.disposition || "Needs triage",
    linkedRecord: ""
  };
  return { ...data, fieldItems: [next, ...data.fieldItems] };
}
