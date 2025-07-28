EnerGenius is a comprehensive web application designed to empower homeowners and renters to effectively manage and optimize their electricity consumption. By providing intuitive tools for data analysis, intelligent forecasting, and personalized energy-saving recommendations, EnerGenius aims to foster sustainable energy habits and reduce utility costs.

##🌟 Key Features

-Real-Time Consumption Visualization: Gain clear insights into electricity usage patterns through interactive charts and dashboards, displaying data hourly, daily, and monthly.

-Smart Energy Analytics: Upload electricity bill data (CSV/Excel) to receive a detailed analysis of consumption trends and cost breakdowns.

-AI-Powered Forecasting: Predict future energy consumption based on historical data and user-configured device usage patterns, helping users plan and budget more efficiently.

-Personalized Energy Saving Tips: Receive actionable recommendations tailored to individual consumption habits and connected devices, promoting significant savings.

-Multi-Language Support: The application is available in English, Hebrew, and Russian, providing an accessible experience for diverse users.

-Device Management: Track and manage electrical appliances by inputting details such as device type, age, efficiency rating, and power consumption to enhance forecast accuracy.

-Secure User Authentication: Robust authentication system powered by Firebase ensures data privacy and secure access to personalized energy information.

-Data Upload and Processing: Easily upload electricity consumption data files (CSV, XLS, XLSX) for analysis and forecasting, with secure and chunked storage on Firebase Firestore.

##🏗️ Tech Stack

###Frontend

-Framework: React (with Vite for a fast development experience)

-User Interface: shadcn/ui for beautifully crafted, accessible components.

-Charting Library: Recharts for dynamic and responsive data visualizations.

-State Management: React Context API for efficient global state handling (Authentication, Device, Consumption data).

-Internationalization: i18next and React-i18next for multi-language support (English, Hebrew, Russian).

-Styling: Tailwind CSS with PostCSS for utility-first CSS, ensuring a consistent and modern design.

-Routing: React Router DOM for declarative navigation.

-Form Management: React Hook Form with Zod for robust form validation.

###Backend

-Firebase: Used for user authentication and as a NoSQL database (Firestore) for storing user-specific data like uploaded electricity consumption records and device configurations.

-FastAPI (Expected): The project's README.md and src/config/api.ts indicate an expected Python-based backend using FastAPI to handle:

-XLSX to text conversion.

-Electricity data analysis.

-AI-powered electricity consumption forecasting.

-Generation of personalized energy-saving tips.

-PostgreSQL (Expected): As mentioned in the original README, likely used in conjunction with FastAPI for structured data storage.

-Python ML Libraries (Expected): Tools like Prophet or LSTM are anticipated for advanced forecasting algorithms.

##DevOps & Tools

-Version Control: Git & GitHub

-CI/CD: GitHub Actions (or similar) for automated workflows.

-Containerization: Docker for streamlined deployments.

-Module Bundler: Vite

-Code Quality: ESLint and TypeScript ESLint for linting and code consistency.

##🚀 Getting Started
Prerequisites
Ensure you have the following installed on your system:

-Node.js (version 18 or higher)

-npm / Bun / Yarn

-Git

##Installation
Clone the repository:

git clone https://github.com/your-username/EnerGenius.git
cd EnerGenius
Install dependencies:


bun install  # or npm install / yarn install
Configure Environment Variables:
Create a .env file in the root directory based on a .env.example (if provided, otherwise create one) and configure the Firebase API keys and backend API endpoints:

# Example .env content (replace with your actual keys and URLs)
VITE_APP_FIREBASE_API_KEY="..."
VITE_APP_FIREBASE_AUTH_DOMAIN="..."
VITE_APP_FIREBASE_PROJECT_ID="..."
VITE_APP_FIREBASE_STORAGE_BUCKET="..."
VITE_APP_FIREBASE_MESSAGING_SENDER_ID="..."
VITE_APP_FIREBASE_APP_ID="..."
VITE_APP_FIREBASE_MEASUREMENT_ID="..."

REACT_APP_XLSX_TO_TEXT_API="YOUR_XLSX_TO_TEXT_API_ENDPOINT"
REACT_APP_ELECTRICITY_ANALYSIS_API="YOUR_ELECTRICITY_ANALYSIS_API_ENDPOINT"
REACT_APP_ELECTRICITY_FORECAST_AI_API="YOUR_ELECTRICITY_FORECAST_AI_API_ENDPOINT"
Note: The API endpoints for backend services (XLSX conversion, Electricity Analysis, AI Forecast) are expected to be configured. Refer to /src/config/api.ts for details.

Start the development server:

bun dev  # or npm run dev / yarn dev
The application should now be running locally.

##🧪 Testing
To run the frontend tests (powered by Vitest):
bun test  # or npm test / yarn test

##📂 Project Structure (Frontend)
EnerGenius/
├── public/                 # Static assets (images, videos, favicon)
├── src/
│   ├── assets/             # Project-specific assets (e.g., logo.png)
│   ├── auth/               # Authentication related components and contexts
│   ├── components/         # Reusable UI components (e.g., charts, forms)
│   │   ├── auth/           # Login, reset password forms, authentication wrappers
│   │   ├── dashboard/      # Components for displaying electricity data (charts, stats, tips)
│   │   ├── devices/        # Device selection and management forms
│   │   ├── forecast/       # Components for creating and displaying energy forecasts
│   │   ├── language/       # Language selection component
│   │   ├── layout/         # Application layout components (navigation)
│   │   ├── settings/       # Device management in settings
│   │   └── ui/             # Shadcn UI components (buttons, cards, dialogs, etc.)
│   │   └── ui-components/  # Custom UI components like LoadingSpinner, PageHeader
│   │   └── upload/         # File upload area, CSV preview, video modal
│   ├── config/             # Application configuration (e.g., API endpoints)
│   ├── contexts/           # React Context API providers (Auth, Device, Consumption, Language)
│   ├── hooks/              # Custom React hooks for shared logic (e.g., useLanguage, useElectricityData, useRTLStyles)
│   ├── lib/                # Utility functions (Firebase setup, device options, forecast calculations, general utilities)
│   ├── pages/              # Main application pages (Home, Login, Upload, Settings, Analytics, Legal)
│   ├── translations/       # Internationalization (i18n) translation files for en, he, ru
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # General utility functions (e.g., file processing, language detection)
│   ├── App.tsx             # Main application component, sets up routing and providers
│   ├── main.tsx            # Entry point for the React application
│   └── index.css           # Global CSS styles and Tailwind directives
├── .firebase/              # Firebase hosting cache
├── .firebaserc             # Firebase project configuration
├── .gitignore              # Files/directories to ignore in Git
├── README.md               # This README file
├── package.json            # Project dependencies and scripts
├── package-lock.json       # Locked dependency versions
├── postcss.config.js       # PostCSS configuration for Tailwind CSS
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration

##🤝 Contributing
Contributions are highly welcome! If you're interested in improving EnerGenius, please follow these steps:

Fork the repository.

Create a new branch for your feature or bug fix.

Commit your changes with clear and descriptive messages.

Push your branch and submit a Pull Request.

Please ensure your code adheres to the project's coding style and includes relevant tests.

📃 License
This project is licensed under the MIT License.

Built with passion to make homes smarter and greener. 🌍
