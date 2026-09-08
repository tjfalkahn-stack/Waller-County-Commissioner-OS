import test from "node:test";
import assert from "node:assert/strict";
import { initialData, DEMO_NOTICE } from "../src/commissioner/sampleData.js";
import {
  attentionItems,
  budgetSummary,
  createCase,
  isOverdue,
  morningBrief,
  overdueCommitments,
  precinctPulse,
  projectBudgetPosition,
  searchRecords,
  updateCaseStatus
} from "../src/commissioner/services.js";

test("demo data is clearly marked as sample data", () => {
  assert.match(DEMO_NOTICE, /DEMO\/SAMPLE DATA/);
  for (const records of Object.values(initialData)) {
    if (Array.isArray(records)) assert.ok(records.every((record) => record.demo === true));
  }
});

test("precinct budget calculates approved, committed, spent, and remaining", () => {
  const summary = budgetSummary(initialData.budgetItems);
  assert.equal(summary.approved, 1160000);
  assert.equal(summary.committed, 241000);
  assert.equal(summary.spent, 509500);
  assert.equal(summary.remaining, 409500);
});

test("commitment tracker identifies overdue promises", () => {
  const overdue = overdueCommitments(initialData.commitments, "2026-09-03");
  assert.equal(overdue.length, 1);
  assert.equal(overdue[0].id, "commit-601");
});

test("infrastructure and case follow-up overdue behavior respects status", () => {
  assert.equal(isOverdue("2026-09-02", "Assigned", "2026-09-03"), true);
  assert.equal(isOverdue("2026-09-02", "Resolved", "2026-09-03"), false);
});

test("project budget position reports over-budget projects", () => {
  const project = initialData.projects.find((item) => item.id === "project-302");
  const position = projectBudgetPosition(project);
  assert.equal(position.isOverBudget, true);
  assert.equal(position.remaining, -30000);
});

test("morning brief renders actionable information from application data", () => {
  const brief = morningBrief(initialData, "2026-09-03");
  assert.match(brief.headline, /priority items/);
  assert.ok(brief.attention.length > 0);
  assert.equal(brief.atRiskProjects[0].id, "project-302");
});

test("unified search finds records across supported modules", () => {
  const results = searchRecords(initialData, "Macedonia");
  assert.ok(results.some((item) => item.module === "Constituent Service"));
  assert.ok(results.some((item) => item.module === "Roads & Infrastructure"));
  assert.ok(results.some((item) => item.module === "Projects"));
});

test("case workflow can create and resolve a constituent case", () => {
  const created = createCase(initialData, { resident: "Sample new caller", description: "Needs callback", followUpDate: "2026-09-04" });
  assert.equal(created.cases[0].resident, "Sample new caller");
  assert.equal(created.cases[0].status, "New");
  const resolved = updateCaseStatus(created, created.cases[0].id, "Resolved");
  assert.equal(resolved.cases[0].status, "Resolved");
  assert.match(resolved.cases[0].resolution, /resolved/i);
});

test("command center pulse includes primary dashboard counts", () => {
  const pulse = precinctPulse(initialData, "2026-09-03");
  assert.equal(pulse.openCases, 3);
  assert.equal(pulse.infrastructureIssues, 3);
  assert.equal(pulse.activeProjects, 2);
  assert.equal(pulse.overdueItems, 2);
});

test("attention items surface constituent, infrastructure, and commitment work", () => {
  const modules = new Set(attentionItems(initialData, "2026-09-03").map((item) => item.module));
  assert.ok(modules.has("Constituent Service"));
  assert.ok(modules.has("Roads & Infrastructure"));
  assert.ok(modules.has("Commitments"));
});
