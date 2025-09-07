import React from 'react';
import { Device, Patch, PatchUrgency, Alert, AlertSeverity, Ticket, TicketStatus, KnowledgeBaseArticle, AgentName, AgentStatus } from './types';

// Icons
export const ICONS = {
    Dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    Systems: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
    Patches: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    Alerts: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    Helpdesk: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    KnowledgeBase: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
};


// Mock Data
export const MOCK_DEVICES: Device[] = [
    { id: 'WIN-SVR-01', name: 'DC-Primary', os: 'Windows', osVersion: 'Server 2022', uptime: '32d 4h', patchLevel: 'Up-to-date', cpuUsage: 15, memUsage: 45, diskUsage: 60, security: { antivirus: 'Enabled', firewall: 'Active' }},
    { id: 'WIN-SVR-02', name: 'FileShare-HR', os: 'Windows', osVersion: 'Server 2019', uptime: '12d 1h', patchLevel: 'Pending', cpuUsage: 25, memUsage: 60, diskUsage: 85, security: { antivirus: 'Enabled', firewall: 'Active' }},
    { id: 'LNX-WEB-01', name: 'WebApp-Prod', os: 'Linux', osVersion: 'Ubuntu 22.04', uptime: '98d 12h', patchLevel: 'Up-to-date', cpuUsage: 60, memUsage: 70, diskUsage: 40, security: { antivirus: 'Enabled', firewall: 'Active' }},
    { id: 'LNX-DB-01', name: 'Postgres-Primary', os: 'Linux', osVersion: 'CentOS 9', uptime: '150d 2h', patchLevel: 'Pending', cpuUsage: 40, memUsage: 85, diskUsage: 75, security: { antivirus: 'Enabled', firewall: 'Inactive' }},
    { id: 'WIN-CLI-01', name: 'CEO-Laptop', os: 'Windows', osVersion: '11 Pro', uptime: '1d 5h', patchLevel: 'Up-to-date', cpuUsage: 30, memUsage: 55, diskUsage: 50, security: { antivirus: 'Enabled', firewall: 'Active' }},
];

export const MOCK_PATCHES: Patch[] = [
    { id: 'KB5034765', deviceId: 'WIN-SVR-02', deviceName: 'FileShare-HR', description: '2024-02 Cumulative Update for Windows Server 2019', urgency: PatchUrgency.Critical, status: 'Pending' },
    { id: 'USN-6615-1', deviceId: 'LNX-DB-01', deviceName: 'Postgres-Primary', description: 'OpenSSL vulnerabilities', urgency: PatchUrgency.Critical, status: 'Pending' },
    { id: 'KB5034127', deviceId: 'WIN-SVR-02', deviceName: 'FileShare-HR', description: '.NET Framework 4.8.1 Security Update', urgency: PatchUrgency.Security, status: 'Scheduled' },
    { id: 'driver-update-intel', deviceId: 'LNX-DB-01', deviceName: 'Postgres-Primary', description: 'Intel Network Adapter Driver Update', urgency: PatchUrgency.Optional, status: 'Pending' },
];

export const MOCK_ALERTS: Alert[] = [
    { id: 'alert-01', title: 'High CPU Usage on LNX-WEB-01', source: 'Prometheus', severity: AlertSeverity.High, summary: 'CPU utilization has been >90% for 15 minutes, impacting web app performance.', remediation: 'Check for runaway processes. Consider scaling up instance resources.', timestamp: '2 mins ago', count: 5 },
    { id: 'alert-02', title: 'Firewall Inactive on LNX-DB-01', source: 'Nagios', severity: AlertSeverity.Critical, summary: 'The firewall service (firewalld) is not running on the primary database server.', remediation: 'Immediately restart the firewall service: `systemctl start firewalld`. Investigate cause of shutdown.', timestamp: '22 mins ago', count: 1 },
    { id: 'alert-03', title: 'Disk Space Low on WIN-SVR-02', source: 'Datadog', severity: AlertSeverity.Medium, summary: 'Disk C: on FileShare-HR is at 85% capacity. Risk of write failures.', remediation: 'Run disk cleanup automation to remove temp files. Notify HR about archiving old files.', timestamp: '1 hour ago', count: 1 },
    { id: 'alert-04', title: 'Login Failed (x10)', source: 'Nagios', severity: AlertSeverity.High, summary: '10 failed SSH login attempts from IP 123.45.67.89 to LNX-WEB-01.', remediation: 'IP has been auto-banned by fail2ban. No immediate action needed unless attacks persist from other IPs.', timestamp: '3 hours ago', count: 10 },
];

export const MOCK_TICKETS: Ticket[] = [
    {
        id: 101,
        user: 'Akash Anand',
        userAvatar: 'https://picsum.photos/id/1011/100/100',
        subject: "Can't connect to VPN",
        status: TicketStatus.Escalated,
        classification: 'Network',
        messages: [
            { sender: 'user', content: "My VPN isn't connecting. It was working yesterday. I'm getting an error.", timestamp: '10:32 AM'},
            { sender: 'ai', content: "I see you're having trouble with the VPN. Let's try a few things. First, please ensure you are connected to the internet. Can you browse to google.com?", timestamp: '10:32 AM' },
            { sender: 'user', content: "Yes, internet is working fine.", timestamp: '10:33 AM' },
            { sender: 'ai', content: "Okay. Let's try resetting the network adapter. Please open Command Prompt and type `ipconfig /flushdns` and then restart the VPN client.", timestamp: '10:33 AM' },
            { sender: 'user', content: "I tried that, it didn't work.", timestamp: '10:35 AM' },
            { sender: 'ai', content: "I understand. I've gathered your system information and the steps we've tried. I am escalating this to a support agent who will be able to assist you further.", timestamp: '10:35 AM' }
        ],
        context: {
            logs: "VPN Client Log:\n[10:31] Connection attempt to vpn.corp.com\n[10:31] Error 809: The network connection between your computer and the VPN server could not be established...",
            systemInfo: MOCK_DEVICES[4],
            attemptedFixes: ["Verified internet connectivity", "Ran `ipconfig /flushdns`", "Restarted VPN client"]
        }
    },
    {
        id: 102,
        user: 'Bhavesh Rathod',
        userAvatar: 'https://picsum.photos/id/1005/100/100',
        subject: "Outlook keeps crashing",
        status: TicketStatus.Resolved,
        classification: 'Software',
        messages: [
            { sender: 'user', content: "Help, my outlook crashes every time I open it!", image: "https://i.imgur.com/3z1tQ4b.png", timestamp: '11:01 AM'}, // Example error screenshot
            { sender: 'ai', content: "I can see from your screenshot that Outlook is having trouble with an add-in. Let's start Outlook in safe mode to see if that's the cause. Press `Win + R`, type `outlook.exe /safe`, and press Enter.", timestamp: '11:01 AM' },
            { sender: 'user', content: "Wow, it opened without crashing in safe mode!", timestamp: '11:03 AM' },
            { sender: 'ai', content: "Great! That confirms it's an add-in issue. Please go to File > Options > Add-ins, select 'COM Add-ins' and click Go. Disable all add-ins, then re-enable them one by one to find the culprit. Does this resolve your issue?", timestamp: '11:03 AM' },
            { sender: 'user', content: "Yes! It was the 'Spam Blocker 3000' add-in. I disabled it and now it works. Thanks!", timestamp: '11:05 AM' },
            { sender: 'ai', content: "Excellent! I'm glad I could help. I'll mark this ticket as resolved. A new article will be added to our knowledge base based on this solution.", timestamp: '11:05 AM' }
        ]
    },
    {
        id: 104,
        user: 'Tejeshwari Chouhan',
        userAvatar: 'https://picsum.photos/id/1027/100/100',
        subject: "Outlook is slow and keeps freezing",
        status: TicketStatus.AI_Responding,
        classification: 'Software',
        messages: [
            { sender: 'user', content: "My Outlook client has been extremely slow for the past day. It freezes for a few seconds every time I try to open an email. I've already tried restarting my computer.", timestamp: '12:05 PM'},
        ],
        swarmState: [
            { name: AgentName.Orchestrator, status: AgentStatus.Pending, task: 'Coordinating agent swarm to diagnose issue.' },
            { name: AgentName.TicketAgent, status: AgentStatus.Pending, task: 'Parsing ticket details and classifying intent.' },
            { name: AgentName.AssetDiscoveryAgent, status: AgentStatus.Pending, task: 'Querying device performance counters and specs.' },
            { name: AgentName.PerformanceOptimizationAgent, status: AgentStatus.Pending, task: 'Analyzing performance data for bottlenecks.' },
            { name: AgentName.MemoryAgent, status: AgentStatus.Pending, task: 'Checking for memory leaks or excessive usage in Outlook process.' },
            { name: AgentName.DocumentationGeneratorAgent, status: AgentStatus.Pending, task: 'Searching knowledge base for similar resolved incidents.' },
            { name: AgentName.AutoPatchFixingAgent, status: AgentStatus.Pending, task: 'Verifying Office and OS patch levels.' },
            { name: AgentName.SecurityAssessmentAgent, status: AgentStatus.Pending, task: 'Idle' },
            { name: AgentName.NetworkDiagnosticAgent, status: AgentStatus.Pending, task: 'Idle' },
            { name: AgentName.SandboxScriptExecutorAgent, status: AgentStatus.Pending, task: 'Idle' },
            { name: AgentName.ComplianceAuditingAgent, status: AgentStatus.Pending, task: 'Idle' },
            { name: AgentName.BackupRecoveryAgent, status: AgentStatus.Pending, task: 'Idle' },
            { name: AgentName.ImageAnalysisAgent, status: AgentStatus.Pending, task: 'Idle' },
        ]
    }
];

export const MOCK_KB_ARTICLES: KnowledgeBaseArticle[] = [
    { id: 'KB001', title: 'Resolving Outlook Crashes by Disabling Add-ins', category: 'Software', content: "If Outlook crashes on startup, it may be caused by a faulty add-in. Start Outlook in Safe Mode (`outlook.exe /safe`). If it opens successfully, navigate to File > Options > Add-ins and disable COM Add-ins one by one to identify the problematic one.", createdAt: '2 days ago', resolvedTicketId: 102 },
    { id: 'KB002', title: 'Fixing VPN Error 809', category: 'Network', content: "VPN Error 809 is often caused by a firewall blocking the necessary ports (UDP 500, 4500). Ensure these ports are open on the client's firewall and any network firewalls between the client and the server. Also verify the VPN client configuration.", createdAt: '5 days ago', resolvedTicketId: 98 },
    { id: 'KB003', title: 'Clearing Windows Update Cache', category: 'System', content: "To resolve stuck Windows Updates, you can clear the cache. Stop the Windows Update service (`net stop wuauserv`), delete the contents of `C:\\Windows\\SoftwareDistribution`, and then restart the service (`net start wuauserv`).", createdAt: '1 week ago', resolvedTicketId: 95 },
];