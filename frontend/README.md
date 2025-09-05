# MAESTRO Frontend

A React + Tailwind CSS dashboard for the MAESTRO microservices system.

## Features

- **Health Status Card**: Displays system health with dummy data
- **Tickets Table**: Shows static ticket data with priority and status indicators
- **Health Check Button**: Interactive button for running health checks (no API integration yet)
- **Service Overview**: Visual representation of all 5 services running on ports 8001-8005

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

3. **Open browser:**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── HealthStatusCard.js    # Health status display
│   │   ├── TicketsTable.js        # Tickets table with dummy data
│   │   └── HealthcheckButton.js   # Health check button
│   ├── App.js                     # Main app component
│   ├── index.js                   # React entry point
│   └── index.css                  # Tailwind CSS imports
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## Services Integration

The frontend is designed to work with the following backend services:

- **Ticket Service** (Port 8001)
- **Healthcheck Service** (Port 8002) 
- **Memory Service** (Port 8003)
- **Orchestrator Service** (Port 8004)
- **Sandbox Service** (Port 8005)

## Styling

Built with Tailwind CSS for rapid UI development with a clean, modern design.

## Development

The app uses Create React App with Tailwind CSS. All components are functional components using React hooks.

## Future Enhancements

- API integration for real-time data
- WebSocket connections for live updates
- User authentication
- Advanced filtering and search
- Real-time notifications
