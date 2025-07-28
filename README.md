EnerGenius ⚡

EnerGenius is an electricity optimization app designed for homeowners and renters who want to take control of their electricity usage. The app helps users monitor their energy consumption, visualize it through interactive charts, and receive personalized insights to optimize costs and reduce waste.

## 🌟 Key Features

- 📊 **Real-Time Consumption Visualization**: View your electricity usage over time in dynamic graphs (hourly, daily, etc.).
- 🧠 **AI Forecasting**: Predict future consumption trends to plan more efficiently.
- 💡 **Personalized Tips**: Get actionable suggestions for reducing your electricity bills based on actual usage patterns.
- 🔐 **User Authentication**: Secure sign-in and access control to ensure your data is safe.
- 📈 **Device-Level Breakdown**: Understand which appliances or areas of your home use the most energy.

## 🏗️ Tech Stack

### Frontend
- **Framework**: React (with support for modern hooks and modular components)
- **UI Libraries**: shadcn/ui, lucide-react
- **Charts**: Recharts or similar JS charting library
- **State Management**: React Context API

### Backend (expected)
- FastAPI (for serving forecasts and historical consumption data)
- PostgreSQL (as database)
- Python ML Libraries (e.g., Prophet, LSTM for forecasting)

### DevOps
- Git & GitHub for version control
- GitHub Actions or similar CI/CD
- Docker (for containerized deployments)

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
- Node.js (>= 18)
- npm / bun / yarn
- Git

### Installation

# Clone the repo
git clone https://github.com/your-username/EnerGenius.git
cd EnerGenius

# Install dependencies
bun install  # or npm install / yarn install

# Start development server
bun dev  # or npm run dev / yarn dev


> Make sure to also configure your backend and `.env` file with the proper API endpoints for user data and forecasts.

## 🧪 Testing

bun test  # or npm test / yarn test

## 📂 Project Structure (Frontend)


EnerGenius/
├── components/         # Reusable UI components
├── pages/              # App pages (e.g., Dashboard, Login)
├── contexts/           # Auth and global state providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── public/             # Static assets
├── styles/             # Global styles
├── .gitignore
├── bun.lockb
└── package.json
```

## 🧠 AI Forecast Integration

The backend is expected to run an AI service that performs forecasting using uploaded electricity data and returns structured JSON for graphs. You can configure this under `/lib/utils.js` and invoke endpoints like `/api/forecast`.


## 🤝 Contributing

Contributions are welcome! Please fork the repo and submit a PR with your changes. Don't forget to write clear commit messages and follow the project's coding style.

## 📃 License

MIT License.


Built with passion to make homes smarter and greener. 🌍
