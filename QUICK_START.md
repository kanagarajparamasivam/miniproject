# Quick Start Guide - 5 Minute Setup

Fast setup for testing the application quickly.

## Prerequisites Check
```bash
node --version    # Should show v14 or higher
npm --version     # Should show version number
```

If not installed: Download Node.js from https://nodejs.org/

---

## Step-by-Step Instructions

### 1. Start External Database (Optional but Recommended)
Ensure MongoDB is installed and running. If not, the app will use some mock data but database features won't persist.
y
### 2. Install & Start Backend (Terminal 1)

```bash
cd backend
npm install
npm run dev
```

**Setup Data (First Time Only):**
Open a new terminal in `backend` and run:
```bash
npx ts-node src/scripts/seedDatabase.ts
```
*(This loads the "Chennai" -> "Coimbatore" bus routes into the database)*

**Wait for:** `🚀 Server running on http://localhost:3000`

### 3. Install & Start Frontend (Terminal 2)

Open a **new** terminal window at the project root:

```bash
cd "C:\Users\ASUS\OneDrive\Desktop\haran\mini project"
npm install
npm run web
```
*(Use `npm start` if you want to run on a mobile device with Expo Go)*

---

## 4. Test the App

### Login
- **Email:** `demo@example.com`
- **Password:** `demo123`

### Search Route (Important: Use Valid Cities)
- **Source:** `Chennai`
- **Destination:** `Coimbatore`
*(Or try: Madurai -> Tiruchirappalli)*

- Click **"Find Best Route"**

### View Results
- You should see Bus, Taxi, and Hybrid options.
- The Bus option will show the data from the database.

---

## ✅ Success Checklist

- [ ] Backend terminal shows "MongoDB connected successfully"
- [ ] Frontend terminal shows "Web is waiting on http://localhost:19006"
- [ ] Browser opens login page
- [ ] Login works
- [ ] searching "Chennai" to "Coimbatore" shows valid bus results

---

**For detailed instructions, see `SETUP_INSTRUCTIONS.md`**

