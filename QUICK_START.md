# Quick Start Guide - MathMaster Auth System

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL running on `localhost:5433`
- Database: `mathmaster_db` created

### Step 1: Backend Setup (Terminal 1)
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r ../requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

✅ Backend running on: http://127.0.0.1:8000

### Step 2: Frontend Setup (Terminal 2)
```bash
cd frontend/mathmaster
npm install
npm run dev
```

✅ Frontend running on: http://localhost:5173

### Step 3: Test Registration & Login
1. Open browser to **http://localhost:5173**
2. Click "Register"
3. Fill form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Test123456`
   - Role: `Student`
4. Click "Create Account"
5. ✅ You should be logged in to dashboard!
6. Click "Logout" to test logout
7. Click "Login" and use same credentials
8. ✅ Success!

---

## 📋 What Was Fixed

### Backend Issues ✅
- **Fixed serializers.py**: Malformed nested RegisterSerializer → Fixed structure
- **Fixed views.py**: No tokens on registration → Now returns JWT tokens
- **Added requirements.txt**: All dependencies listed
- **URLs cleaned**: Removed unused logout endpoint

### Frontend Issues ✅
- **Fixed Navbar.jsx**: Unused React import → Removed
- **Enhanced LoginPage**: Now stores user role
- **Enhanced RegistrationPage**: Auto-login after registration
- **Redesigned Dashboard**: Better layout and navbar integration
- **Updated RegistrationSuccess**: Proper styling

---

## 🔑 How Authentication Works

### Registration Flow
```
User Registration → Serializer validates → User created
→ JWT tokens generated → Auto-stored in browser
→ Redirect to dashboard ✅
```

### Login Flow
```
User Login → Credentials verified → JWT tokens returned
→ Fetch user profile for role → Store in browser
→ Redirect to dashboard ✅
```

### Protected Routes
```
Access dashboard → Check for access_token
→ Token valid? → Show dashboard : Redirect to login ✅
```

---

## 🧪 API Endpoints

### Register
```bash
POST http://127.0.0.1:8000/api/accounts/register/
Content-Type: application/json

{
  "username": "student1",
  "email": "student@example.com",
  "password": "SecurePass123",
  "role": "student"
}

Response:
{
  "user": {
    "id": 1,
    "username": "student1",
    "email": "student@example.com",
    "role": "student"
  },
  "access": "eyJ0eXAiOiJKV1Q...",
  "refresh": "eyJ0eXAiOiJKV1Q...",
  "detail": "User registered successfully"
}
```

### Login
```bash
POST http://127.0.0.1:8000/api/accounts/login/
Content-Type: application/json

{
  "username": "student1",
  "password": "SecurePass123"
}

Response:
{
  "access": "eyJ0eXAiOiJKV1Q...",
  "refresh": "eyJ0eXAiOiJKV1Q..."
}
```

### Get Profile
```bash
GET http://127.0.0.1:8000/api/accounts/profile/
Authorization: Bearer {access_token}

Response:
{
  "id": 1,
  "username": "student1",
  "email": "student@example.com",
  "role": "student"
}
```

---

## 🐛 Common Issues & Fixes

### Issue: Database connection error
**Solution**: 
- Check PostgreSQL is running
- Verify `config/settings.py` has correct credentials

### Issue: CORS error
**Solution**: Backend already has CORS enabled, both servers need to run

### Issue: Cannot login
**Solution**:
- Verify user was registered
- Check password is correct
- Try registering new account

### Issue: Topics not loading on dashboard
**Solution**:
- Add topics via Django admin: http://127.0.0.1:8000/admin
- Or run: `python manage.py seed_learning` (if implemented)

### Issue: Token expired error
**Solution**: 
- Use refresh token: POST `/api/accounts/token/refresh/`
- API interceptor handles this automatically

---

## 📁 Modified Files

```
mathmaster/
├── backend/
│   ├── accounts/
│   │   ├── serializers.py ✅ FIXED
│   │   ├── views.py ✅ FIXED
│   │   └── urls.py ✅ UPDATED
│   └── config/
│       └── settings.py ✅ VERIFIED
├── frontend/
│   └── mathmaster/
│       └── src/
│           ├── components/
│           │   └── Navbar.jsx ✅ FIXED
│           └── pages/
│               ├── LoginPage.jsx ✅ ENHANCED
│               ├── RegistrationPage.jsx ✅ ENHANCED
│               ├── RegistrationSuccess.jsx ✅ UPDATED
│               └── StudentDashboard.jsx ✅ REDESIGNED
├── requirements.txt ✅ CREATED
├── SETUP_GUIDE.md ✅ CREATED
└── CHANGES_SUMMARY.md ✅ CREATED
```

---

## 🎯 Features Now Working

- ✅ Student Registration
- ✅ Teacher Registration
- ✅ Role-based Registration
- ✅ JWT Authentication
- ✅ Auto-login after Registration
- ✅ Login with JWT Tokens
- ✅ Protected Dashboard Routes
- ✅ User Profile Display
- ✅ Role Display in Navbar
- ✅ Logout Functionality
- ✅ Token Refresh Support

---

## 📚 Documentation Files

1. **SETUP_GUIDE.md** - Comprehensive setup and testing guide
2. **CHANGES_SUMMARY.md** - Detailed changes and data flow
3. **README.md** - Original project info

---

## 🚀 Next Steps

After getting registration/login working:

1. **Populate Database**
   - Add math topics, lessons, quizzes
   - Use Django admin or create seed management command

2. **Implement Features**
   - Quiz system
   - Progress tracking
   - Teacher dashboard
   - Analytics

3. **Production Ready**
   - Environment variables
   - Database backups
   - SSL/HTTPS
   - Rate limiting

---

## ✅ Success Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors  
- [ ] Can register as Student
- [ ] Auto-logged in after registration
- [ ] Can see username in navbar
- [ ] Can logout and return to login
- [ ] Can login with existing account
- [ ] Can access protected dashboard
- [ ] Cannot access dashboard without token
- [ ] No console errors

**All done! Happy coding! 🎉**
