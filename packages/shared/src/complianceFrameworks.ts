export interface ComplianceControl {
  id: string;
  title: string;
  category: string;
}

export interface ComplianceFramework {
  key: "iso27001" | "nist_csf" | "cis_controls";
  name: string;
  controls: ComplianceControl[];
}

// Real published control identifiers/titles (abridged to the most
// commonly-cited controls per framework, not the full exhaustive standard —
// e.g. ISO 27001:2022 Annex A has 93 controls total; this lists the core
// representative set per category).
export const COMPLIANCE_FRAMEWORKS: ComplianceFramework[] = [
  {
    key: "iso27001",
    name: "ISO/IEC 27001:2022 (Annex A)",
    controls: [
      { id: "A.5.1", title: "Policies for information security", category: "Organizational" },
      { id: "A.5.7", title: "Threat intelligence", category: "Organizational" },
      { id: "A.5.9", title: "Inventory of information and other associated assets", category: "Organizational" },
      { id: "A.5.15", title: "Access control", category: "Organizational" },
      { id: "A.5.23", title: "Information security for use of cloud services", category: "Organizational" },
      { id: "A.5.24", title: "Information security incident management planning and preparation", category: "Organizational" },
      { id: "A.5.30", title: "ICT readiness for business continuity", category: "Organizational" },
      { id: "A.6.1", title: "Screening", category: "People" },
      { id: "A.6.3", title: "Information security awareness, education and training", category: "People" },
      { id: "A.6.8", title: "Information security event reporting", category: "People" },
      { id: "A.7.1", title: "Physical security perimeters", category: "Physical" },
      { id: "A.7.4", title: "Physical security monitoring", category: "Physical" },
      { id: "A.7.9", title: "Security of assets off-premises", category: "Physical" },
      { id: "A.8.1", title: "User endpoint devices", category: "Technological" },
      { id: "A.8.8", title: "Management of technical vulnerabilities", category: "Technological" },
      { id: "A.8.9", title: "Configuration management", category: "Technological" },
      { id: "A.8.16", title: "Monitoring activities", category: "Technological" },
      { id: "A.8.23", title: "Web filtering", category: "Technological" },
      { id: "A.8.24", title: "Use of cryptography", category: "Technological" },
      { id: "A.8.28", title: "Secure coding", category: "Technological" },
    ],
  },
  {
    key: "nist_csf",
    name: "NIST Cybersecurity Framework 2.0",
    controls: [
      { id: "GV.OC", title: "Organizational Context", category: "Govern" },
      { id: "GV.RM", title: "Risk Management Strategy", category: "Govern" },
      { id: "GV.RR", title: "Roles, Responsibilities, and Authorities", category: "Govern" },
      { id: "GV.PO", title: "Policy", category: "Govern" },
      { id: "GV.SC", title: "Cybersecurity Supply Chain Risk Management", category: "Govern" },
      { id: "ID.AM", title: "Asset Management", category: "Identify" },
      { id: "ID.RA", title: "Risk Assessment", category: "Identify" },
      { id: "ID.IM", title: "Improvement", category: "Identify" },
      { id: "PR.AA", title: "Identity Management, Authentication and Access Control", category: "Protect" },
      { id: "PR.AT", title: "Awareness and Training", category: "Protect" },
      { id: "PR.DS", title: "Data Security", category: "Protect" },
      { id: "PR.PS", title: "Platform Security", category: "Protect" },
      { id: "PR.IR", title: "Technology Infrastructure Resilience", category: "Protect" },
      { id: "DE.CM", title: "Continuous Monitoring", category: "Detect" },
      { id: "DE.AE", title: "Adverse Event Analysis", category: "Detect" },
      { id: "RS.MA", title: "Incident Management", category: "Respond" },
      { id: "RS.AN", title: "Incident Analysis", category: "Respond" },
      { id: "RS.CO", title: "Incident Response Reporting and Communication", category: "Respond" },
      { id: "RC.RP", title: "Incident Recovery Plan Execution", category: "Recover" },
      { id: "RC.CO", title: "Incident Recovery Communication", category: "Recover" },
    ],
  },
  {
    key: "cis_controls",
    name: "CIS Controls v8",
    controls: [
      { id: "CIS-1", title: "Inventory and Control of Enterprise Assets", category: "Basic" },
      { id: "CIS-2", title: "Inventory and Control of Software Assets", category: "Basic" },
      { id: "CIS-3", title: "Data Protection", category: "Basic" },
      { id: "CIS-4", title: "Secure Configuration of Enterprise Assets and Software", category: "Basic" },
      { id: "CIS-5", title: "Account Management", category: "Basic" },
      { id: "CIS-6", title: "Access Control Management", category: "Basic" },
      { id: "CIS-7", title: "Continuous Vulnerability Management", category: "Foundational" },
      { id: "CIS-8", title: "Audit Log Management", category: "Foundational" },
      { id: "CIS-9", title: "Email and Web Browser Protections", category: "Foundational" },
      { id: "CIS-10", title: "Malware Defenses", category: "Foundational" },
      { id: "CIS-11", title: "Data Recovery", category: "Foundational" },
      { id: "CIS-12", title: "Network Infrastructure Management", category: "Foundational" },
      { id: "CIS-13", title: "Network Monitoring and Defense", category: "Foundational" },
      { id: "CIS-14", title: "Security Awareness and Skills Training", category: "Organizational" },
      { id: "CIS-15", title: "Service Provider Management", category: "Organizational" },
      { id: "CIS-16", title: "Application Software Security", category: "Organizational" },
      { id: "CIS-17", title: "Incident Response Management", category: "Organizational" },
      { id: "CIS-18", title: "Penetration Testing", category: "Organizational" },
    ],
  },
];
