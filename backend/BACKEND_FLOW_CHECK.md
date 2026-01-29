# Backend Flow Analysis

## ✅ Server Setup (server.ts)

**Status:** ✅ Properly configured

- Express server initialized
- CORS enabled
- JSON body parser configured
- All routes registered under `/api` prefix
- Health check endpoint at `/health`
- Error handling middleware in place

**Port:** 3000 (configurable via PORT env variable)

---

## ✅ Route Configuration

All routes are properly registered in `server.ts`:

1. **Auth Routes** (`/api/login`)
   - POST `/api/login` - User authentication
   - ✅ Uses mockUsers from mockData.ts
   - ✅ Returns success response with user data and token

2. **Route Routes** (`/api/getRoutes`)
   - POST `/api/getRoutes` - Calculate route between source and destination
   - ✅ Uses calculateRoute function from mockData.ts

3. **Bus Routes** (`/api/getBusOptions`, `/api/getBusDetails`)
   - POST `/api/getBusOptions` - Get available bus options from MongoDB
   - POST `/api/getBusDetails` - Get bus details with seat availability
   - ⚠️ **Requires MongoDB connection** (uses Bus model)

4. **Taxi Routes** (`/api/getTaxiOptions`)
   - POST `/api/getTaxiOptions` - Get available taxi options
   - ✅ Uses mockTaxiData (no MongoDB required)

5. **Hybrid Routes** (`/api/getHybridRecommendation`)
   - POST `/api/getHybridRecommendation` - Get optimized hybrid recommendation
   - ⚠️ **Requires MongoDB connection** (uses Bus model)
   - ✅ Uses optimization algorithm

6. **Booking Routes** (`/api/bookBus`, `/api/bookTaxiAfterBus`, etc.)
   - POST `/api/bookBus` - Book bus with seat selection
   - POST `/api/bookTaxiAfterBus` - Book taxi after bus
   - POST `/api/bookTaxiOnly` - Book taxi only
   - POST `/api/processPayment` - Process payment
   - GET `/api/getBookings/:userId` - Get user bookings
   - ⚠️ **Requires MongoDB connection** (uses Booking, Bus, User models)

---

## ⚠️ Database Connection Issue

**Problem:** The database connection in `config/database.ts` calls `process.exit(1)` on error, which will crash the server if MongoDB is not running.

```typescript
// Current code:
catch (error) {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);  // ⚠️ This kills the server!
}
```

**Impact:**
- If MongoDB is not running, the server will exit immediately
- Routes that don't require MongoDB (login, getRoutes, getTaxiOptions) should still work
- Routes requiring MongoDB will fail

**Solution Options:**
1. Make MongoDB connection optional (don't exit on error)
2. Ensure MongoDB is running before starting server
3. Add fallback to mock data when MongoDB is unavailable

---

## ✅ Mock Data Available

**Users:**
- `demo@example.com` / `demo123` ✅
- `user@test.com` / `test123`
- `admin@booking.com` / `admin123`

**Routes:**
- Mock bus routes available in `mockBusRoutes`
- Mock taxi data available in `mockTaxiData`
- Route calculation function available

---

## 🔍 API Endpoint Summary

### Authentication
- `POST /api/login` - Login (no MongoDB required)

### Route Information
- `POST /api/getRoutes` - Calculate route (no MongoDB required)
- `POST /api/getBusOptions` - Get bus options (requires MongoDB)
- `POST /api/getTaxiOptions` - Get taxi options (no MongoDB required)
- `POST /api/getHybridRecommendation` - Hybrid recommendation (requires MongoDB)

### Booking
- `POST /api/getBusDetails` - Get bus details (requires MongoDB)
- `POST /api/bookBus` - Book bus (requires MongoDB)
- `POST /api/bookTaxiAfterBus` - Book taxi after bus (requires MongoDB)
- `POST /api/bookTaxiOnly` - Book taxi only (requires MongoDB)
- `POST /api/processPayment` - Process payment (requires MongoDB)
- `GET /api/getBookings/:userId` - Get bookings (requires MongoDB)

### Health Check
- `GET /health` - Server health check (no MongoDB required)

---

## 🐛 Potential Issues

1. **MongoDB Connection Failure**
   - Server exits if MongoDB connection fails
   - **Fix:** Make connection non-blocking or handle gracefully

2. **Database Not Seeded**
   - Bus routes need to be seeded into MongoDB
   - **Fix:** Run `npm run seed` in backend folder

3. **CORS Issues**
   - CORS is enabled, but might need specific origins
   - **Current:** Allows all origins (`cors()`)

4. **Error Handling**
   - Routes have try-catch blocks ✅
   - Error middleware in place ✅
   - But database connection error kills server ⚠️

---

## ✅ Testing Checklist

- [ ] Backend server starts without errors
- [ ] Health check endpoint responds: `GET /health`
- [ ] Login works: `POST /api/login` with `demo@example.com` / `demo123`
- [ ] Get routes works: `POST /api/getRoutes`
- [ ] MongoDB is running and connected
- [ ] Database is seeded with bus data
- [ ] Bus options endpoint works: `POST /api/getBusOptions`
- [ ] Hybrid recommendation works: `POST /api/getHybridRecommendation`

---

## 📝 Next Steps

1. **Fix database connection** to not exit on error
2. **Ensure MongoDB is running** before starting server
3. **Seed the database** with bus data
4. **Test all endpoints** to verify flow

