export const DEMO_NOTICE =
  "DEMO/SAMPLE DATA: This MVP uses fictional demonstration records for evaluation only. It is not live Waller County data.";

export const today = "2026-09-03";

export const roleConcepts = ["Commissioner", "Chief of Staff / Office Manager", "Staff", "Read-only"];

export const initialData = {
  cases: [
    {
      id: "case-101",
      demo: true,
      resident: "Sample resident - Monaville area",
      contact: "demo.resident@example.invalid",
      category: "Drainage",
      location: "Kickapoo Road near FM 1488",
      description: "Resident reports repeated ditch overflow after heavy rain and asks for update after prior call.",
      priority: "High",
      owner: "Precinct 3 Road Liaison",
      status: "Assigned",
      notes: ["Photos referenced in document DOC-302.", "Coordinate with drainage crew before Friday."],
      documents: ["DOC-302"],
      followUpDate: "2026-09-02",
      commitmentMade: "Commissioner's office will check status and call resident back.",
      resolution: "",
      history: ["2026-08-30 received", "2026-09-01 assigned to road liaison"]
    },
    {
      id: "case-102",
      demo: true,
      resident: "Sample neighborhood captain",
      contact: "demo.neighborhood@example.invalid",
      category: "Road condition",
      location: "Macedonia Road",
      description: "Concerns about potholes near school traffic route.",
      priority: "Medium",
      owner: "Office Manager",
      status: "Reviewing",
      notes: ["Add to weekly road review."],
      documents: [],
      followUpDate: "2026-09-06",
      commitmentMade: "Share inspection timing when available.",
      resolution: "",
      history: ["2026-09-02 intake"]
    },
    {
      id: "case-103",
      demo: true,
      resident: "Sample business owner",
      contact: "demo.business@example.invalid",
      category: "Signage",
      location: "Prairie View business corridor",
      description: "Requests update on missing directional sign after storm damage.",
      priority: "Low",
      owner: "Staff",
      status: "Waiting",
      notes: ["Waiting on vendor quote."],
      documents: ["DOC-306"],
      followUpDate: "2026-09-09",
      commitmentMade: "Provide estimated replacement timeline.",
      resolution: "",
      history: ["2026-08-27 intake", "2026-08-29 vendor contacted"]
    }
  ],
  infrastructure: [
    {
      id: "infra-201",
      demo: true,
      type: "Drainage",
      location: "Field Store Road culvert",
      description: "Standing water remains after rainfall; possible culvert restriction.",
      priority: "Critical",
      status: "Open",
      responsibleParty: "Precinct maintenance crew",
      documents: ["DOC-302"],
      notes: ["Field photo set attached by reference.", "Needs inspection before next storm system."],
      reportedDate: "2026-08-28",
      followUpDate: "2026-09-03"
    },
    {
      id: "infra-202",
      demo: true,
      type: "Road condition",
      location: "Macedonia Road",
      description: "Pothole cluster on two-lane segment.",
      priority: "High",
      status: "In progress",
      responsibleParty: "Road and bridge coordinator",
      documents: [],
      notes: ["Coordinate with school traffic timing."],
      reportedDate: "2026-09-01",
      followUpDate: "2026-09-05"
    },
    {
      id: "infra-203",
      demo: true,
      type: "Public facilities",
      location: "Precinct community center parking area",
      description: "Lighting outage and striping visibility issue.",
      priority: "Medium",
      status: "Waiting",
      responsibleParty: "Facilities contact",
      documents: ["DOC-309"],
      notes: ["Electrical estimate requested."],
      reportedDate: "2026-08-24",
      followUpDate: "2026-09-10"
    }
  ],
  projects: [
    {
      id: "project-301",
      demo: true,
      name: "Precinct 3 Drainage Priority List",
      category: "Drainage",
      owner: "Commissioner / Road Liaison",
      location: "Precinct-wide",
      budget: 420000,
      spent: 188500,
      committed: 95000,
      status: "Active",
      progress: 46,
      milestones: ["Field review complete", "Engineer estimate due", "Commissioners Court agenda target"],
      deadline: "2026-10-15",
      risks: ["Rainfall before culvert clearing", "Cost estimate volatility"],
      vendors: ["Sample engineering partner"],
      notes: ["Rank locations by resident impact and storm risk."],
      documents: ["DOC-303", "DOC-307"]
    },
    {
      id: "project-302",
      demo: true,
      name: "Macedonia Road Repair Package",
      category: "Roads",
      owner: "Road and bridge coordinator",
      location: "Macedonia Road",
      budget: 275000,
      spent: 221000,
      committed: 84000,
      status: "At risk",
      progress: 72,
      milestones: ["Scope confirmed", "Material quote received", "Court approval pending"],
      deadline: "2026-09-22",
      risks: ["Committed plus spent exceeds budget", "School traffic timing"],
      vendors: ["Sample paving vendor"],
      notes: ["Needs fiscal note before agenda packet closes."],
      documents: ["DOC-304"]
    }
  ],
  meetings: [
    {
      id: "meeting-401",
      demo: true,
      date: "2026-09-04",
      agendaItem: "Road material purchase authorization",
      department: "Road and Bridge",
      briefingNotes: "Decision needed on purchase authority for Macedonia Road repair package.",
      documents: ["DOC-304"],
      fiscalImpact: 84000,
      positionNotes: "Support if funding source and schedule are confirmed.",
      questions: ["Does quote include traffic control?", "Can work avoid school arrival windows?"],
      followUp: "Request final fiscal note by noon.",
      status: "Needs review"
    },
    {
      id: "meeting-402",
      demo: true,
      date: "2026-09-08",
      agendaItem: "Drainage project prioritization briefing",
      department: "Engineering",
      briefingNotes: "Review scoring for top drainage locations before court agenda submission.",
      documents: ["DOC-303", "DOC-307"],
      fiscalImpact: 0,
      positionNotes: "Ask for resident-impact rationale in public language.",
      questions: ["Which locations have repeat constituent cases?", "Which work can be handled by precinct crew?"],
      followUp: "Prepare one-page commissioner brief.",
      status: "Scheduled"
    }
  ],
  budgetItems: [
    { id: "budget-501", demo: true, category: "Road materials", approved: 650000, committed: 134000, spent: 284000, projectId: "project-302", vendor: "Sample aggregate vendor", date: "2026-08-21", notes: "Road repair material envelope." },
    { id: "budget-502", demo: true, category: "Drainage", approved: 420000, committed: 95000, spent: 188500, projectId: "project-301", vendor: "Sample engineering partner", date: "2026-08-30", notes: "Drainage priority project line." },
    { id: "budget-503", demo: true, category: "Facilities", approved: 90000, committed: 12000, spent: 37000, projectId: "", vendor: "Sample electrical contractor", date: "2026-08-26", notes: "Community center maintenance visibility." }
  ],
  commitments: [
    { id: "commit-601", demo: true, commitment: "Call resident with drainage inspection outcome.", personOrg: "Sample resident - Monaville area", related: "case-101", owner: "Commissioner", promisedDate: "2026-08-30", dueDate: "2026-09-02", status: "Open", outcome: "" },
    { id: "commit-602", demo: true, commitment: "Ask Road and Bridge for school traffic repair timing.", personOrg: "Sample neighborhood captain", related: "case-102/project-302", owner: "Office Manager", promisedDate: "2026-09-02", dueDate: "2026-09-06", status: "Open", outcome: "" },
    { id: "commit-603", demo: true, commitment: "Send one-page agenda summary to Commissioner before meeting.", personOrg: "Commissioner", related: "meeting-401", owner: "Staff", promisedDate: "2026-09-01", dueDate: "2026-09-03", status: "In progress", outcome: "" }
  ],
  documents: [
    { id: "DOC-302", demo: true, title: "Sample drainage photo reference set", type: "Constituent attachment", relatedTo: "case-101/infra-201", owner: "Staff", date: "2026-08-30", status: "Referenced", storageNote: "Metadata only. No production file storage configured." },
    { id: "DOC-303", demo: true, title: "Sample drainage prioritization map", type: "Map", relatedTo: "project-301", owner: "Engineering", date: "2026-09-01", status: "Needs review", storageNote: "Metadata only. No production file storage configured." },
    { id: "DOC-304", demo: true, title: "Sample road material fiscal note", type: "Budget document", relatedTo: "project-302/meeting-401", owner: "Office Manager", date: "2026-09-02", status: "Needs review", storageNote: "Metadata only. No production file storage configured." },
    { id: "DOC-306", demo: true, title: "Sample sign replacement quote", type: "Vendor reference", relatedTo: "case-103", owner: "Staff", date: "2026-08-29", status: "Waiting", storageNote: "Metadata only. No production file storage configured." },
    { id: "DOC-307", demo: true, title: "Sample Commissioners Court backup draft", type: "Agenda packet", relatedTo: "project-301/meeting-402", owner: "Commissioner", date: "2026-09-03", status: "Draft", storageNote: "Metadata only. No production file storage configured." },
    { id: "DOC-309", demo: true, title: "Sample community center lighting estimate", type: "Facilities report", relatedTo: "infra-203", owner: "Facilities contact", date: "2026-08-26", status: "Referenced", storageNote: "Metadata only. No production file storage configured." }
  ],
  fieldItems: [
    { id: "field-701", demo: true, observedAt: "2026-09-03", location: "Field Store Road", category: "Drainage", note: "Water line visible at culvert edge during morning route.", priority: "High", capturedBy: "Commissioner", disposition: "Convert to infrastructure follow-up", linkedRecord: "infra-201" },
    { id: "field-702", demo: true, observedAt: "2026-09-02", location: "Prairie View corridor", category: "Signs", note: "Damaged sign base near business entrance.", priority: "Medium", capturedBy: "Staff", disposition: "Convert to constituent case", linkedRecord: "case-103" }
  ]
};
