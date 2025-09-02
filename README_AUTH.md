# Authentication API Endpoints

## Setup
1. Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

2. Make sure MongoDB is running locally or update MONGODB_URI in .env

3. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Register Student
```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@student.com",
  "password": "password123",
  "role": "student"
}
```

### Register Professor
```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Dr. Smith",
  "email": "smith@professor.com",
  "password": "password123",
  "role": "professor"
}
```

### Login
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "john@student.com",
  "password": "password123",
  "role": "student"
}
```

### Get Profile (Protected Route)
```bash
GET http://localhost:3000/api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

## Features Implemented

✅ **JWT Authentication**
- Secure token generation and validation
- Role-based authentication (student/professor)
- Token expiration handling

✅ **Password Security**
- Bcrypt hashing with salt rounds
- Password comparison methods

✅ **Zod Validation**
- Request body validation
- Email format validation
- Password strength requirements
- Role validation

✅ **Middleware**
- Authentication middleware
- Authorization middleware (role-based)
- Request validation middleware

✅ **Error Handling**
- Comprehensive error responses
- Validation error details
- Proper HTTP status codes

## Next Steps
1. Create appointment booking controllers and routes
2. Implement professor availability management
3. Add appointment cancellation functionality
4. Create student appointment viewing features
