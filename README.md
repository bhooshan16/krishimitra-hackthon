# KrishiMitra AI 🌱

KrishiMitra AI is a comprehensive agribusiness platform built for a hackathon. It empowers farmers with AI-driven crop recommendations, multi-lingual disease detection, live mandi (market) rates, weather alerts, and a profit calculator. 

## Features
*   **AI Crop Recommendation:** Recommends the best crops based on soil, season, and location, fetching real data like yield and duration directly from our MongoDB database. 
*   **AI Disease Detection:** Upload a plant photo or enter symptoms to get an instant diagnosis, complete with treatments and prevention strategies. Powered by Google Gemini Vision with a robust 50-disease MongoDB fallback.
*   **Cold-Climate Farming Support:** Customized warnings for Frost & Snow, alongside specialized disease and market data for crops like Apple, Walnut, and Saffron.
*   **Live Mandi Rates:** Real-time market prices across various states and commodities.
*   **Fertilizer Guide & Profit Calculator:** Advanced tools for maximizing yield and understanding financial returns.

## Tech Stack
*   **Frontend:** React, Vite, Tailwind CSS
*   **Backend:** Node.js, Express
*   **Database:** MongoDB, Mongoose
*   **AI Integration:** OpenRouter (Google Gemini)

---

## 🛠️ How to Set Up the Project Locally (For Collaborators)

Welcome to the team! To get this project running on your own computer so you can write code, follow these exact steps:

### Prerequisites
1.  You must have **Node.js** installed on your computer.
2.  You must have **MongoDB** installed and running locally on your computer (port `27017`).

### 1. Clone the Repository
Open your terminal and clone the code to your machine:
```bash
git clone https://github.com/MaheshHugar/krishimitra-hackthon.git
cd krishimitra-hackthon
```

### 2. Set Up the Backend
We need to install the backend dependencies and start the server.
```bash
cd backend
npm install
```

#### ⚠️ IMPORTANT: The `.env` File
For security reasons, our API keys are NOT stored on GitHub. **You will get errors if you try to run the backend without the `.env` file.**
1. Ask the project owner (Mahesh) to securely send you the `backend/.env` file.
2. Once you receive the file, place it exactly inside the `krishimitra-hackthon/backend/` folder on your computer. Make sure it is named exactly `.env`.

#### Seed the Database
Before starting the server, build your local MongoDB database with our crop and disease data:
```bash
node seedDatabase.js
```
*(You should see a message saying "Database seeding complete!")*

#### Start the Backend Server
```bash
npm run dev
```
*(The backend should now be running on `http://localhost:5000`)*

### 3. Set Up the Frontend
Open a **new** separate terminal window, navigate to the frontend folder, and start the React app.
```bash
cd krishimitra-hackthon/frontend
npm install
npm run dev
```
*(The frontend should now be running on `http://localhost:5173`)*

---

## 🚀 You are ready to code!
Open `http://localhost:5173` in your browser. 
If you are working on the **Frontend**, edit files inside `frontend/src/`.
If you are working on the **Backend**, edit files inside `backend/src/`.

Happy coding and good luck at the Hackathon! 🏆
