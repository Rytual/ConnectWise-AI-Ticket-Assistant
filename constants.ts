import { MSPContext } from './types';

export const SYSTEM_INSTRUCTION_TEXT = `
You are an expert Tier 3 MSP (Managed Service Provider) Systems Engineer. 
Your role is to assist technicians by analyzing ConnectWise tickets and providing remediation steps.

**Your Environment Context:**
- We manage Windows Servers (2016-2022), Microsoft 365 (Exchange, SharePoint, Teams), Entra ID (Azure AD), and Networking (Firewalls, Switches).
- We use PowerShell extensively for discovery and remediation.

**Your Operational Guidelines:**
1. **Analyze First:** When presented with a ticket, analyze the scope. Is it a user device issue, a server outage, or a cloud config issue?
2. **Establish Baseline:** If information is missing, ask the technician to run specific discovery commands.
3. **PowerShell:** Provide *safe*, read-only PowerShell scripts (Get-*, Test-*) first to gather data. Only suggest modification scripts (Set-*, Remove-*) once the issue is confirmed.
4. **Tone:** Professional, concise, and technical.
5. **Format:** Use Markdown. When providing code, use code blocks with the language specified (e.g., \`\`\`powershell).
6. **Interaction:** If the user asks for a script, provide it with comments explaining what it does.
`;

export const MOCK_INITIAL_TICKETS = [
  {
    id: 204391,
    title: "User cannot access mapped drives",
    description: "User Jane Doe (jdoe@acmeco.com) reports X: and Y: drives have red Xs. She is working remotely via VPN. Reboot didn't fix.",
    category: "Service Desk",
    status: "New",
    company: "Acme Corp",
    contact: "Jane Doe",
    priority: "Medium",
    createdAt: "2023-10-27T09:00:00Z"
  },
  {
    id: 204395,
    title: "Server High CPU Alert - DB01",
    description: "RMM Alert: SRV-DB01 CPU usage > 95% for 15 minutes. SQL Server process appears to be the culprit.",
    category: "Ecare NOC",
    status: "In Progress",
    company: "Global Logistics",
    contact: "N/A (Automated)",
    priority: "High",
    createdAt: "2023-10-27T10:15:00Z"
  },
  {
    id: 204402,
    title: "Entra ID Sync Failed",
    description: "Azure AD Connect sync cycle failed. Error 106: invalid-credentials on the connector account.",
    category: "Security / Entra",
    status: "New",
    company: "TechFlow Inc",
    contact: "IT Manager",
    priority: "Critical",
    createdAt: "2023-10-27T11:30:00Z"
  },
  {
    id: 204410,
    title: "Onboarding New User - Sales",
    description: "Please create new account for Mike Ross. Standard Sales template. License: M365 Business Premium. Add to 'Sales' DL.",
    category: "Service Desk",
    status: "New",
    company: "Pearson Hardman",
    contact: "Harvey Specter",
    priority: "Low",
    createdAt: "2023-10-27T13:00:00Z"
  },
  {
    id: 204422,
    title: "Firewall VPN Tunnel Down",
    description: "Site-to-Site VPN between HQ and Branch Office is down. Ping fails.",
    category: "NOC_Ecare",
    status: "In Progress",
    company: "Acme Corp",
    contact: "System",
    priority: "High",
    createdAt: "2023-10-27T14:20:00Z"
  }
];
