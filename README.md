
# 🌿 NutriVedha - Precision Ayurvedic Intelligence

NutriVedha is a professional-grade HealthTech application that bridges 5,000 years of Ayurvedic wisdom with cutting-edge Generative AI. It empowers practitioners (Vaidyas) and patients to manage health through biological precision, market-aware dietetics, and real-time biometric monitoring.

## 🚀 Core Features

### 🧠 AI-Powered Clinical Intelligence
*   **Sutra Engine**: Generates daily biological mantras based on unique Dosha (Vata, Pitta, Kapha) balances.
*   **Pathya Matrix**: Formulates clinical-grade 7-day diet plans using Gemini AI, considering budget, cuisine preferences, and ingredient exclusions.
*   **Vaidya Clinical Desk**: Automated prescription generator for herbs, lifestyle advice, and dietary adjustments.
*   **Health Analytics**: Multi-dimensional trend reporting using Recharts to visualize vitality, energy, and Sattva (mood).

### 🔐 Enterprise-Grade Architecture
*   **Offline-First Sync**: Robust local caching with a background sync queue that flushes data to MongoDB once connectivity is restored.
*   **Secure MongoDB Integration**: Strict Mongoose schemas for patient clinical records with upsert logic for seamless background updates.
*   **Role-Based Access Control**: Separate secure portals for **Doctors**, **Patients**, and **System Administrators**.
*   **Telehealth restricted**: Integrated video consultation module accessible only during scheduled appointments.

### 📱 User Experience
*   **Guided Orientation**: Interactive help overlay and guided tours for new users.
*   **Voice Integration**: AI-driven voice responses for the "Vaidya Chatbot".
*   **PWA Ready**: Mobile-first responsive design with dark mode support.

## 🛠️ Tech Stack

*   **Frontend**: React (ES6+), Tailwind CSS, Lucide-React (Icons), Recharts (Analytics).
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB (Mongoose ODM).
*   **AI Engine**: Google Gemini API (@google/genai).
*   **Persistence**: LocalStorage with Sync-Queue logic.

## 📂 Project Structure

```text
├── components/          # React UI Components (Layout, Dashboard, Onboarding, etc.)
├── services/            # Logic layer (Gemini AI service, MongoDB API service)
├── types.ts             # TypeScript definitions for clinical models
├── constants.ts         # Mock data and system constants
├── server.ts            # Express + Mongoose Backend
├── App.tsx              # Main application routing and sync logic
└── index.html           # Entry point
```

## ⚙️ Setup & Installation

### 1. Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas)
*   Google Gemini API Key

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_connection_string
```

### 3. Backend Setup
```bash
# Install dependencies (using your preferred manager)
npm install express mongoose cors @google/genai

# Start the secure backend
node server.ts
```

### 4. Frontend Setup
The application is structured as an ES module project. You can serve the `index.html` using any modern dev server (Vite, Live Server, etc.).

## 📖 Instructions for Use

1.  **Onboarding**: New patients enter their health goals, budget, and dietary preferences.
2.  **Daily Ritual**: Users log their vitals (Mood, Energy, Sleep) daily to update their Bio-Profile.
3.  **Formulation**: Use the "AI Pathya Matrix" to generate a diet plan. The system automatically fetches local market rates to ensure the plan fits the user's budget.
4.  **Clinical Review**: Doctors can view the "Priority Registry" to see which patients have high-severity alerts based on their logs.
5.  **Offline Use**: You can continue logging data even without internet. The "Bio-State Secured" indicator will turn yellow (Syncing) when you go offline and green (Synced) when you reconnect.

## 🛡️ Security
*   Data is scoped by `userId`.
*   Encryption is applied to all clinical health logs.
*   Admin access is protected via a secure administrative login protocol.

---
**© 2025 NutriVedha Systems. Precision in every grain.**
