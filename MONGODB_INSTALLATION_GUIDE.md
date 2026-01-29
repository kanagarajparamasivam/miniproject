# MongoDB Installation Guide for Windows

## How to Check if MongoDB is Installed

### Method 1: Check via Command Line
Open PowerShell or Command Prompt and run:
```powershell
mongod --version
```

If MongoDB is installed, you'll see version information. If not, you'll get an error saying the command is not recognized.

### Method 2: Check Services
1. Press `Win + R` to open Run dialog
2. Type `services.msc` and press Enter
3. Look for "MongoDB" in the services list

### Method 3: Check Installation Directory
Check if MongoDB is installed in the default location:
- `C:\Program Files\MongoDB\`

---

## Installation Instructions for Windows

### Option 1: Install MongoDB Community Edition (Recommended)

#### Step 1: Download MongoDB
1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - **Version**: Latest (e.g., 7.0)
   - **Platform**: Windows
   - **Package**: MSI
3. Click "Download"

#### Step 2: Run the Installer
1. Double-click the downloaded `.msi` file
2. Click "Next" on the Setup Wizard
3. Accept the license agreement
4. Choose **"Complete"** installation (recommended)
5. Select **"Install MongoDB as a Service"** (checked by default)
   - Service Name: MongoDB
   - Run service as: Network Service user (default)
6. **IMPORTANT**: Uncheck "Install MongoDB Compass" if you don't want it (it's optional)
   - MongoDB Compass is a GUI tool (useful but not required)
7. Click "Install"
8. Wait for installation to complete
9. Click "Finish"

#### Step 3: Verify Installation
1. Open PowerShell as Administrator
2. Run:```powershell
   mongod --version
   ```
   ```powershell
   mongod --version
   ```
3. You should see version information

#### Step 4: Start MongoDB Service
MongoDB should start automatically, but to verify:
1. Press `Win + R`, type `services.msc`, press Enter
2. Find "MongoDB" service
3. Right-click → Start (if not running)
4. Right-click → Properties → Set Startup type to "Automatic" (so it starts on boot)

#### Step 5: Test MongoDB Connection
Open a new PowerShell window and run:
```powershell
mongosh
```

You should see MongoDB shell prompt (like `test>`). This confirms MongoDB is running correctly.

**Important:** 
- Type `exit` to quit the MongoDB shell
- **Do NOT** set environment variables (like `MONGODB_URI`) inside `mongosh` - those go in a `.env` file (see "Quick Start After Installation" section below)

---

### Option 2: Install MongoDB via Chocolatey (Faster)

If you have Chocolatey package manager:

```powershell
# Install Chocolatey first (if not installed)
# Visit: https://chocolatey.org/install

# Then install MongoDB
choco install mongodb
```

---

### Option 3: Use MongoDB Atlas (Cloud - No Installation Required)

If you prefer cloud hosting (free tier available):

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a free cluster
4. Get connection string
5. Update your `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bus-taxi-booking
   ```

---

## Quick Start After Installation

### 1. Start MongoDB (if not running)
```powershell
# Check if service is running
Get-Service MongoDB

# Start if not running (as Administrator)
Start-Service MongoDB
```

### 2. Test Connection
```powershell
mongosh
```

### 3. Update Your Backend .env File
Create/update `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017/bus-taxi-booking
PORT=3000
```

### 4. Seed the Database
```powershell
cd backend
npm run seed
```

### 5. Start Your Backend
```powershell
npm run dev
```

---

## Troubleshooting

### Issue: MongoDB service won't start
**Solution:**
1. Check if port 27017 is already in use:
   ```powershell
   netstat -ano | findstr :27017
   ```
2. If port is in use, stop the process or change MongoDB port
3. Check MongoDB logs: `C:\Program Files\MongoDB\Server\7.0\log\mongod.log`

### Issue: "mongod is not recognized"
**Solution:**
1. MongoDB might not be in PATH
2. Add MongoDB bin to PATH:
   - Path: `C:\Program Files\MongoDB\Server\7.0\bin`
   - System Properties → Environment Variables → Path → Add

### Issue: Permission denied
**Solution:**
Run PowerShell as Administrator

---

## Verify Installation Checklist

- [ ] `mongod --version` shows version number
- [ ] `mongosh` command works
- [ ] MongoDB service is running in Services
- [ ] Can connect: `mongosh mongodb://localhost:27017`
- [ ] Database seed script runs successfully

---

## Next Steps

Once MongoDB is installed:

1. **Configure your backend:**
   ```powershell
   cd backend
   # Create .env file with MongoDB URI
   echo MONGODB_URI=mongodb://localhost:27017/bus-taxi-booking > .env
   echo PORT=3000 >> .env
   ```

2. **Seed the database:**
   ```powershell
   npm run seed
   ```

3. **Start the backend server:**
   ```powershell
   npm run dev
   ```

4. **Start the frontend:**
   ```powershell
   cd ..
   npm start
   ```

---

## Additional Resources

- MongoDB Documentation: https://docs.mongodb.com/
- MongoDB University (Free Courses): https://university.mongodb.com/
- MongoDB Compass (GUI Tool): https://www.mongodb.com/products/compass

