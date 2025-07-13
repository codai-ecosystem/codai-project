# LogAI Universal Dashboard

## Overview

LogAI Universal Dashboard este interfața web pentru monitorizarea și analiza în timp real a ecosistemului CODAI. Oferă vizualizări comprehensive pentru toate aplicațiile CODAI cu AI insights și alerting inteligent.

## Features

### 🔍 Real-time Monitoring
- Live log streaming pentru toate aplicațiile CODAI
- Metrici în timp real (logs/min, errors/min, response time)
- Status monitoring pentru fiecare aplicație

### 📊 Analytics & Insights
- AI-powered anomaly detection
- Performance trend analysis
- Predictive insights pentru degradări potențiale
- Pattern recognition pentru utilizare

### 🚨 Intelligent Alerting
- Smart alert rules configurabile
- Severity-based notification system
- Integration cu email și Slack

### 🎯 Application Focus
Monitorizare dedicată pentru:
- **CODAI** - Core AI platform
- **RomAI** - Romanian AI Central Intelligence
- **DexAI** - Romanian Dictionary with AI
- **ConversAI** - Email Service with AI features
- **DonAI** - Donation Platform cu blockchain transparency
- **Glass MCP** - Window management MCP server

## Tech Stack

- **Framework**: Next.js 15.1.0 cu App Router
- **UI**: React 19.1.0 + Tailwind CSS 3.4.17
- **Icons**: Lucide React
- **Charts**: Recharts (coming soon)
- **Real-time**: WebSocket integration
- **Language**: TypeScript 5.8.0

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Configuration

Environment variables:
- `LOGAI_DASHBOARD_PORT` - Dashboard port (default: 4036)
- `LOGAI_WS_ENDPOINT` - WebSocket endpoint pentru live logs
- `LOGAI_API_ENDPOINT` - REST API endpoint pentru queries

## Architecture

```
dashboard/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout cu metadata
│   ├── page.tsx           # Main dashboard interface
│   └── globals.css        # Global styles cu Tailwind
├── components/            # Reusable React components (coming soon)
├── lib/                   # Utilities și configurații (coming soon)
├── public/               # Static assets (coming soon)
├── package.json          # Dependencies și scripts
├── tailwind.config.js    # Tailwind CSS configuration
├── next.config.js        # Next.js configuration
└── tsconfig.json         # TypeScript configuration
```

## Integration

Dashboard-ul se integrează cu:
1. **@codai/logai-universal** - Core logging SDK
2. **WebSocket server** - Pentru live log streaming
3. **REST API** - Pentru queries și configurare
4. **Toate aplicațiile CODAI** - Via LogAI SDK

## Features Roadmap

### Phase 1 (Current) ✅
- [x] Basic dashboard layout
- [x] Real-time metrics display
- [x] Application status monitoring
- [x] AI insights panel
- [x] Log viewer cu filtering

### Phase 2 (Next)
- [ ] Charts cu Recharts integration
- [ ] Advanced filtering și search
- [ ] Alert configuration UI
- [ ] Export functionality

### Phase 3 (Future)
- [ ] Custom dashboards
- [ ] Advanced AI analytics
- [ ] Performance correlation analysis
- [ ] Automated incident response

## Usage

1. **Dashboard Overview**: Vezi status general și metrici key
2. **Live Logs**: Monitorizează logs în timp real cu filtering
3. **Analytics**: Analizează trends și performance patterns
4. **Alerts**: Configurează și gestionează alertele
5. **Settings**: Configurează LogAI și preferințe

## Performance

- **Bundle size**: Optimizat pentru încărcare rapidă
- **Real-time updates**: WebSocket pentru latență minimă
- **Responsive design**: Funcționează pe mobile și desktop
- **Accessibility**: Conform WCAG 2.1 guidelines

## Contributing

Pentru contribuții la LogAI Universal Dashboard:
1. Fork repository
2. Create feature branch
3. Implement changes
4. Add tests
5. Submit pull request

## License

Parte din CODAI Ecosystem - Licensed under MIT
