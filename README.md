# Appointment Booking System

A comprehensive appointment booking system that allows students to book appointments with professors. Built with Node.js, Express, MongoDB, and includes JWT authentication with role-based access control.

## 🚀 Features

- **User Authentication**: JWT-based authentication for students and professors
- **Role-based Access Control**: Different permissions for students and professors
- **Professor Availability Management**: Professors can set their available time slots
- **Appointment Booking**: Students can book available time slots
- **Appointment Cancellation**: Professors can cancel appointments
- **Real-time Availability**: Time slots are automatically marked as unavailable when booked
- **Data Validation**: Comprehensive input validation using Zod
- **E2E Testing**: Complete end-to-end test coverage

## 📋 Requirements Implemented

✅ **Complete User Flow:**
1. Student A1 authenticates to access the system
2. Professor P1 authenticates to access the system  
3. Professor P1 specifies which time slots he is free for appointments
4. Student A1 views available time slots for Professor P1
5. Student A1 books an appointment with Professor P1 for time T1
6. Student A2 authenticates to access the system
7. Student A2 books an appointment with Professor P1 for time T2
8. Professor P1 cancels the appointment with Student A1
9. Student A1 checks their appointments and realizes they do not have any pending appointments

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Validation**: Zod schema validation
- **Password Hashing**: bcryptjs
- **Testing**: Jest, Supertest
- **Environment**: dotenv for configuration

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd unque_cloudbook
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/appointment_booking
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   ```

4. **Start the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## 🧪 Testing

Run the comprehensive E2E test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run only E2E tests
npm run test:e2e
```

The E2E test covers the complete user flow specified in the requirements and includes additional edge cases.

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "password123",
  "role": "student" // or "professor"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123", 
  "role": "student" // or "professor"
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

### Availability Endpoints

#### Add Availability (Professor Only)
```http
POST /availability/add
Authorization: Bearer <professor-token>
Content-Type: application/json

{
  "start": "2024-12-25T10:00:00.000Z",
  "end": "2024-12-25T11:00:00.000Z"
}
```

#### Get Professor's Availability
```http
GET /availability/professor/:professorId
Authorization: Bearer <token>
```

#### Get All Professors with Availability
```http
GET /availability/all
Authorization: Bearer <token>
```

#### Get My Availability (Professor Only)
```http
GET /availability/my-availability
Authorization: Bearer <professor-token>
```

#### Remove Availability (Professor Only)
```http
DELETE /availability/remove/:timeSlotId
Authorization: Bearer <professor-token>
```

### Appointment Endpoints

#### Book Appointment (Student Only)
```http
POST /appointments/book
Authorization: Bearer <student-token>
Content-Type: application/json

{
  "professorId": "professor-id-here",
  "timeSlot": "2024-12-25T10:30:00.000Z"
}
```

#### Get My Appointments (Student Only)
```http
GET /appointments/my-appointments
Authorization: Bearer <student-token>
```

#### Get Professor's Appointments (Professor Only)
```http
GET /appointments/professor-appointments
Authorization: Bearer <professor-token>
```

#### Cancel Appointment (Professor Only)
```http
PATCH /appointments/cancel/:appointmentId
Authorization: Bearer <professor-token>
```

#### Get All Appointments
```http
GET /appointments/all
Authorization: Bearer <token>
```

## 🗃️ Database Schema

### User Models

#### Student
```javascript
{
  email: String (required, unique),
  name: String (required),
  password: String (required, hashed)
}
```

#### Professor  
```javascript
{
  email: String (required, unique),
  name: String (required),
  password: String (required, hashed)
}
```

#### TimeSlot
```javascript
{
  professor: ObjectId (ref: Professor, required),
  start: Date (required),
  end: Date (required), 
  isBooked: Boolean (default: false)
}
```

#### Appointment
```javascript
{
  professor: ObjectId (ref: Professor, required),
  student: ObjectId (ref: Student, required),
  timeSlot: Date (required),
  status: String (enum: ['booked', 'cancelled'], default: 'booked')
}
```

## 🔐 Security Features

- **Password Hashing**: All passwords are hashed using bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Role-based Authorization**: Different access levels for students and professors
- **Input Validation**: Comprehensive request validation using Zod schemas
- **Error Handling**: Proper error responses without exposing sensitive information

## 🚦 Status Codes

- `200` - Success
- `201` - Created successfully
- `400` - Bad request / Validation error
- `401` - Unauthorized / Authentication required
- `403` - Forbidden / Insufficient permissions
- `404` - Not found
- `500` - Internal server error

## 📝 Error Response Format

```json
{
  "error": "Error message",
  "details": [
    {
      "field": "fieldName",
      "message": "Specific validation error"
    }
  ]
}
```

## 🧪 E2E Test Coverage

The comprehensive E2E test suite covers:

1. **Complete User Authentication Flow**
   - Student and professor registration
   - Login verification
   - Profile access

2. **Availability Management**
   - Professor setting availability
   - Students viewing availability
   - Time slot validation

3. **Appointment Booking Process**
   - Successful booking
   - Multiple student bookings
   - Availability updates

4. **Appointment Cancellation**
   - Professor cancelling appointments
   - Time slot availability restoration
   - Student appointment updates

5. **Edge Cases and Error Handling**
   - Double booking prevention
   - Unauthorized access prevention
   - Role-based access control

## 🎯 Code Quality

- **Clean Architecture**: Separation of concerns with controllers, routes, and middleware
- **Error Handling**: Comprehensive error handling throughout the application
- **Input Validation**: Zod schemas for request validation
- **Documentation**: Well-documented code and API endpoints
- **Testing**: Complete E2E test coverage
- **Security**: Best practices for authentication and authorization

## 🚀 Production Deployment

1. **Environment Setup**: Configure production environment variables
2. **Database**: Set up MongoDB Atlas or production MongoDB instance
3. **Security**: Use strong JWT secrets and enable HTTPS
4. **Monitoring**: Add logging and monitoring solutions
5. **Scaling**: Consider load balancing for high traffic

## 📱 Frontend Integration

The API is designed to work with any frontend framework. Example integration:

```javascript
// Login
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    role: 'student'
  })
});

const { token } = await loginResponse.json();

// Book appointment
const bookingResponse = await fetch('/api/v1/appointments/book', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    professorId: 'professor-id',
    timeSlot: '2024-12-25T10:30:00.000Z'
  })
});
```

## 📞 Support

For any questions or issues, please refer to the comprehensive test suite in `tests/e2e/appointment-flow.test.js` which demonstrates all functionality and serves as living documentation.
