export enum View {
    Dashboard = 'Dashboard',
    Systems = 'Systems',
    Patches = 'Patches',
    Alerts = 'Alerts',
    Helpdesk = 'Helpdesk',
    KnowledgeBase = 'Knowledge Base'
}

export interface Device {
    id: string;
    name: string;
    os: 'Windows' | 'Linux';
    osVersion: string;
    uptime: string;
    patchLevel: 'Up-to-date' | 'Pending';
    cpuUsage: number;
    memUsage: number;
    diskUsage: number;
    security: {
        antivirus: 'Enabled' | 'Disabled';
        firewall: 'Active' | 'Inactive';
    };
}

export enum PatchUrgency {
    Critical = 'Critical',
    Security = 'Security',
    Optional = 'Optional'
}

export interface Patch {
    id: string;
    deviceId: string;
    deviceName: string;
    description: string;
    urgency: PatchUrgency;
    status: 'Pending' | 'Scheduled' | 'Applied';
}

export enum AlertSeverity {
    Critical = 'Critical',
    High = 'High',
    Medium = 'Medium',
    Low = 'Low'
}

export interface Alert {
    id: string;
    title: string;
    source: 'Prometheus' | 'Nagios' | 'Datadog';
    severity: AlertSeverity;
    summary: string;
    remediation: string;
    timestamp: string;
    count: number;
}

export enum TicketStatus {
    AI_Responding = 'AI Responding',
    Escalated = 'Escalated',
    Resolved = 'Resolved'
}

export interface TicketMessage {
    sender: 'user' | 'ai';
    content: string;
    timestamp: string;
    image?: string;
}

export enum AgentStatus {
    Pending = 'Pending',
    Active = 'Active',
    Completed = 'Completed',
    Error = 'Error'
}

export enum AgentName {
    Orchestrator = 'Orchestrator',
    BackupRecoveryAgent = 'Backup & Recovery Agent',
    DocumentationGeneratorAgent = 'Documentation Generator Agent',
    TicketAgent = 'Ticket Agent',
    MemoryAgent = 'Memory Agent',
    AutoPatchFixingAgent = 'Auto Patch Fixing Agent',
    ImageAnalysisAgent = 'Image/Video/Text/Voice Analysis Agent',
    SandboxScriptExecutorAgent = 'Sandbox Script Executor Agent',
    NetworkDiagnosticAgent = 'Network Diagnostic Agent',
    SecurityAssessmentAgent = 'Security Assessment Agent',
    PerformanceOptimizationAgent = 'Performance Optimization Agent',
    AssetDiscoveryAgent = 'Asset Discovery Agent',
    ComplianceAuditingAgent = 'Compliance Auditing Agent',
}

export interface Agent {
    name: AgentName;
    status: AgentStatus;
    task: string;
}

export interface Ticket {
    id: number;
    user: string;
    userAvatar: string;
    subject: string;
    status: TicketStatus;
    classification: 'Network' | 'Software' | 'System' | 'Account';
    messages: TicketMessage[];
    context?: {
        logs: string;
        systemInfo: Device;
        attemptedFixes: string[];
    };
    swarmState?: Agent[];
}

export interface KnowledgeBaseArticle {
    id: string;
    title: string;
    category: 'Network' | 'Software' | 'System' | 'Account';
    content: string;
    createdAt: string;
    resolvedTicketId: number;
}
