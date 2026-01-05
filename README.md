# Power BI Insights Hub

<p align="center">
  <img src="https://img.shields.io/badge/Power%20BI-Expert-F2C811?style=for-the-badge&logo=powerbi&logoColor=black" alt="Power BI Expert">
  <img src="https://img.shields.io/badge/AI%20Powered-DAX%20Generation-0078D4?style=for-the-badge&logo=microsoft&logoColor=white" alt="AI Powered">
  <img src="https://img.shields.io/badge/Enterprise-Security-DC3545?style=for-the-badge&logo=shield&logoColor=white" alt="Enterprise Security">
</p>

<p align="center">
  <strong>Enterprise-Grade AI Assistant for Microsoft Power BI</strong><br>
  <em>Generate DAX queries, execute analytics, edit PBIP files, and test RLS - all through natural language</em>
</p>

---

## Architecture

This is a **monorepo** containing both the frontend and backend:

```
power-bi-insights-hub/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── lib/         # API service layer
│   │   ├── store/       # Zustand state management
│   │   └── types/       # TypeScript interfaces
│   └── package.json
│
├── backend/           # Python Flask + Power BI Connectors
│   ├── src/
│   │   ├── connectors/  # Power BI Desktop, XMLA, TOM, PBIP
│   │   ├── llm/         # AI providers (Azure Claude, OpenAI, Ollama)
│   │   ├── security/    # Audit logging, network validation
│   │   └── web/         # Flask routes and services
│   ├── requirements.txt
│   └── web_ui.py
│
├── package.json       # Root scripts for running both
└── README.md
```

---

## Features

| Feature | Description |
|---------|-------------|
| **Natural Language to DAX** | Ask questions in plain English, receive executable DAX queries |
| **Query Execution** | Auto-execute DAX and display results in formatted tables |
| **Schema Discovery** | Auto-detect tables, columns, measures, relationships |
| **USERELATIONSHIP Handling** | Automatic handling of inactive relationships |
| **RLS Testing** | Test row-level security as any user |
| **PBIP Editing** | Bulk rename tables, columns, measures |
| **Enterprise Security** | Schema-only data boundary, audit logging |

### Supported AI Providers

- **Azure Claude** (Recommended) - Via Azure AI Foundry
- **Azure OpenAI** - GPT-4o and GPT-4o Mini
- **Ollama** - Local, air-gapped deployment

### Supported Power BI Connections

- **Power BI Desktop** - Connect to .pbix files via ADOMD.NET
- **Power BI Service** - Connect via XMLA endpoint (Premium/PPU)

---

## Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **Python 3.10+**
- **Power BI Desktop** (for local connections) or **Power BI Premium/PPU** (for cloud)
- **Windows 10/11** (required for Power BI connectivity)

### Installation

```bash
# Clone the repository
git clone https://github.com/sulaiman013/power-bi-insights-hub.git
cd power-bi-insights-hub

# Install frontend dependencies
npm run install:frontend

# Install backend dependencies (in a Python virtual environment)
cd backend
python -m venv venv
.\venv\Scripts\activate   # Windows
pip install -r requirements.txt
cd ..
```

### Running the Application

**Option 1: Run both servers together**

```bash
npm install concurrently -D
npm run dev
```

**Option 2: Run servers separately**

Terminal 1 - Backend (Python):
```bash
cd backend
python web_ui.py
# Server runs on http://localhost:5050
```

Terminal 2 - Frontend (React):
```bash
cd frontend
npm run dev
# Server runs on http://localhost:5173
```

### First-Time Setup

1. Open http://localhost:5173 in your browser
2. Click **Settings** (gear icon)
3. Configure your AI Provider (Azure Claude, Azure OpenAI, or Ollama)
4. Connect to Power BI:
   - **Desktop**: Open a .pbix file in Power BI Desktop, then click "Discover & Connect"
   - **Cloud**: Enter your Azure AD credentials and Power BI dataset URL

---

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component library
- **Zustand** - State management
- **TanStack Query** - Server state

### Backend
- **Flask** - Web framework
- **ADOMD.NET** - Power BI Desktop connectivity
- **pyadomd** - XMLA for Power BI Service
- **MSAL** - Azure AD authentication
- **pythonnet** - .NET interop

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/discover` | GET | Discover Power BI Desktop instances |
| `/api/connect_instance` | POST | Connect to specific instance by port |
| `/api/schema` | GET | Get model schema (tables, columns, measures) |
| `/api/configure_pbi_service` | POST | Configure Power BI Service connection |
| `/api/configure_azure_claude` | POST | Configure Azure Claude provider |
| `/api/configure_azure` | POST | Configure Azure OpenAI provider |
| `/api/configure_ollama` | POST | Configure Ollama provider |
| `/api/chat` | POST | Send chat message, receive DAX + results |
| `/api/execute_dax` | POST | Execute DAX query directly |

---

## Security

### Data Boundary Enforcement

**Your actual data NEVER leaves your environment.**

Only schema metadata (table names, column names, measure definitions) is sent to the AI provider. Query results are processed locally and never transmitted.

### Audit Logging

All operations are logged with:
- Cryptographic signatures (HMAC)
- Tamper-evident chain hashing
- Compliance-ready structure (SOC2, ISO27001)

### Network Validation

For air-gapped deployments:
```bash
cd backend
validate-airgap
```

---

## Development

### Frontend Development

```bash
cd frontend
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Run ESLint
```

### Backend Development

```bash
cd backend
python web_ui.py  # Start Flask server
```

---

## Environment Variables

Create a `.env` file in the `/frontend` folder:

```env
VITE_API_URL=http://localhost:5050/api
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "Add my feature"`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) file.

---

## Author

**Sulaiman Ahmed**

- GitHub: [@sulaiman013](https://github.com/sulaiman013)
- YouTube: [Demo Video](https://youtu.be/5gNa9BUJ4r8)
