# MathMaster - Setup & Run Guide

## Overview
Complete authentication system with Student/Teacher registration and login, JWT token-based authentication, and dashboard access.

## Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL (configured on localhost:5433)
- pip (Python package manager)

---

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r ../requirements.txt
```

### 4. Database Configuration
The backend is configured to use PostgreSQL:
- **Database Name**: `mathmaster_db`
- **User**: `postgres`
- **Password**: `1234`
- **Host**: `localhost`
- **Port**: `5433`

**Create the database in PostgreSQL:**
```sql
CREATE DATABASE mathmaster_db;
```

### 5. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser (Optional - for Admin Panel)
```bash
python manage.py createsuperuser
```

### 7. Start Django Development Server
```bash
python manage.py runserver
```

The backend will run on: `http://127.0.0.1:8000`

---

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd frontend/mathmaster
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

The frontend will run on: `http://localhost:5173` (or similar port)

---

## Testing the Authentication Flow

### 1. Register a Student Account
- Navigate to: `http://localhost:5173/register`
- Fill in the form:
  - Username: `student1`
  - Email: `student@example.com`
  - Password: `SecurePass123`
  - Role: `Student`
- Click "Create Account"
- ✅ You should be automatically logged in and redirected to the dashboard

### 2. Register a Teacher Account
- Navigate to: `http://localhost:5173/register`
- Fill in the form:
  - Username: `teacher1`
  - Email: `teacher@example.com`
  - Password: `SecurePass123`
  - Role: `Teacher`
- Click "Create Account"
- ✅ You should be automatically logged in and see the teacher dashboard

### 3. Test Login
- Navigate to: `http://localhost:5173/login`
- Use credentials from registration (e.g., `student1` / `SecurePass123`)
- ✅ You should be logged in and redirected to the dashboard

### 4. Test Logout
- Click the "Logout" button in the navbar
- ✅ You should be redirected to the login page

### 5. Test Protected Routes
- Try accessing the dashboard without logging in
- ✅ You should be redirected to the login page

---

## API Endpoints

### Authentication Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/accounts/register/` | Register new user |
| POST | `/api/accounts/login/` | Login and get JWT tokens |
| GET | `/api/accounts/profile/` | Get logged-in user profile |
| POST | `/api/accounts/token/refresh/` | Refresh access token |

### Example Requests

**Register:**
```bash
curl -X POST http://127.0.0.1:8000/api/accounts/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student1",
    "email": "student@example.com",
    "password": "SecurePass123",
    "role": "student"
  }'
```

**Login:**
```bash
curl -X POST http://127.0.0.1:8000/api/accounts/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student1",
    "password": "SecurePass123"
  }'
```

---

## Key Files Modified

### Backend
- ✅ `accounts/serializers.py` - Fixed malformed RegisterSerializer
- ✅ `accounts/views.py` - Cleaned up views, added JWT token generation on registration
- ✅ `accounts/urls.py` - Removed unused logout endpoint
- ✅ `requirements.txt` - Added all dependencies

### Frontend
- ✅ `components/Navbar.jsx` - Fixed React import, added logout functionality
- ✅ `pages/LoginPage.jsx` - Added profile fetching for role storage
- ✅ `pages/RegistrationPage.jsx` - Auto-login after registration
- ✅ `pages/StudentDashboard.jsx` - Updated with proper navbar and layout

---

## Troubleshooting

### Database Connection Error
**Error**: `psycopg2.OperationalError: could not connect to server`

**Solution**:
- Verify PostgreSQL is running on port 5433
- Check database name, user, and password in `config/settings.py`

### CORS Error
**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
- CORS is already enabled in settings (`CORS_ALLOW_ALL_ORIGINS = True`)
- Ensure backend is running

### JWT Token Expired
**Solution**:
- Use the refresh token endpoint: `/api/accounts/token/refresh/`
- The API interceptor will handle this automatically

### Topics Not Loading
**Error**: `404 - Not Found on /api/learning/topics/`

**Solution**:
- You need to populate the database with learning data
- Run: `python manage.py seed_learning` (if seed command exists)
- Or create topics via Django admin: `http://127.0.0.1:8000/admin`

---

## Environment Configuration

### Backend (config/settings.py)
```python
# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}

# CORS Settings
CORS_ALLOW_ALL_ORIGINS = True

# Custom User Model
AUTH_USER_MODEL = 'accounts.User'
```

### Frontend (services/api.js)
```javascript
baseURL: 'http://127.0.0.1:8000'
```

---

## Next Steps

1. **Populate Learning Data**: Add topics, lessons, and quizzes
2. **Implement Teacher Dashboard**: Course management features
3. **Add Quiz Functionality**: Question handling and scoring
4. **Add Analytics**: Track student progress
5. **Deploy**: Use Docker, Heroku, or AWS

---

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for frontend errors
3. Check Django logs for backend errors
4. Verify database connection and migrations
