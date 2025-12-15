# Sehat Sathi API Documentation

Complete API documentation for Sehat Sathi - AI Health Assistant backend.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication

#### Register User
- **Endpoint:** `POST /api/auth/register`
- **Description:** Register a new user (patient or doctor)
- **Authentication:** Not required
- **Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "patient",
  "phone": "+1234567890",
  "address": "123 Main St",
  "dateOfBirth": "1990-01-01",
  "gender": "male"
}
```
- **Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "patient"
    },
    "token": "jwt-token-here"
  }
}
```

#### Login
- **Endpoint:** `POST /api/auth/login`
- **Description:** Login user and receive JWT token
- **Authentication:** Not required
- **Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "patient"
    },
    "token": "jwt-token-here"
  }
}
```

#### Get Current User
- **Endpoint:** `GET /api/auth/me`
- **Description:** Get current authenticated user profile
- **Authentication:** Required
- **Response (200):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "_id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient"
  }
}
```

---

### Patient

#### Get Patient Profile
- **Endpoint:** `GET /api/patients/profile`
- **Description:** Get patient's own profile
- **Authentication:** Required (Patient role)
- **Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient"
  }
}
```

#### Update Patient Profile
- **Endpoint:** `PUT /api/patients/profile`
- **Description:** Update patient's own profile
- **Authentication:** Required (Patient role)
- **Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+1234567890",
  "address": "456 New St"
}
```
- **Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "user-id",
    "name": "John Updated",
    "email": "john@example.com"
  }
}
```

---

### Doctor

#### Create Doctor Profile
- **Endpoint:** `POST /api/doctors/profile`
- **Description:** Create doctor profile (for doctor role users)
- **Authentication:** Required (Doctor role)
- **Request Body:**
```json
{
  "specialization": "Cardiology",
  "qualification": "MD, MBBS",
  "experience": 10,
  "consultationFee": 500,
  "bio": "Experienced cardiologist",
  "workingHours": {
    "start": "09:00",
    "end": "17:00"
  }
}
```
- **Response (201):**
```json
{
  "success": true,
  "message": "Doctor profile created successfully",
  "data": {
    "_id": "doctor-id",
    "userId": "user-id",
    "specialization": "Cardiology"
  }
}
```

#### Get All Doctors
- **Endpoint:** `GET /api/doctors`
- **Description:** Get list of all doctors (with optional filtering)
- **Authentication:** Not required
- **Query Parameters:**
  - `specialization` (optional): Filter by specialization
- **Example:** `GET /api/doctors?specialization=Cardiology`
- **Response (200):**
```json
{
  "success": true,
  "message": "Doctors retrieved successfully",
  "data": [
    {
      "_id": "doctor-id",
      "specialization": "Cardiology",
      "qualification": "MD, MBBS",
      "experience": 10
    }
  ]
}
```

#### Get Doctor by ID
- **Endpoint:** `GET /api/doctors/:id`
- **Description:** Get doctor details by ID
- **Authentication:** Not required
- **Response (200):**
```json
{
  "success": true,
  "message": "Doctor retrieved successfully",
  "data": {
    "_id": "doctor-id",
    "specialization": "Cardiology",
    "userId": {
      "name": "Dr. Smith",
      "email": "smith@example.com"
    }
  }
}
```

#### Get Doctor Profile (Current Doctor)
- **Endpoint:** `GET /api/doctors/profile/me`
- **Description:** Get current doctor's own profile
- **Authentication:** Required (Doctor role)
- **Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "doctor-id",
    "specialization": "Cardiology"
  }
}
```

#### Update Doctor Profile
- **Endpoint:** `PUT /api/doctors/profile`
- **Description:** Update current doctor's profile
- **Authentication:** Required (Doctor role)
- **Request Body:**
```json
{
  "consultationFee": 600,
  "bio": "Updated bio"
}
```
- **Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "doctor-id",
    "consultationFee": 600
  }
}
```

---

### Appointment

#### Book Appointment
- **Endpoint:** `POST /api/appointments`
- **Description:** Book a new appointment
- **Authentication:** Required (Patient role)
- **Request Body:**
```json
{
  "doctorId": "doctor-id",
  "appointmentDate": "2024-12-25",
  "appointmentTime": "10:00",
  "duration": 30,
  "reason": "Regular checkup",
  "notes": "First visit"
}
```
- **Response (201):**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "_id": "appointment-id",
    "patientId": "patient-id",
    "doctorId": "doctor-id",
    "appointmentDate": "2024-12-25T00:00:00.000Z",
    "appointmentTime": "10:00",
    "status": "pending"
  }
}
```

#### Get Patient Appointments
- **Endpoint:** `GET /api/appointments/patient`
- **Description:** Get all appointments for current patient
- **Authentication:** Required (Patient role)
- **Response (200):**
```json
{
  "success": true,
  "message": "Appointments retrieved successfully",
  "data": [
    {
      "_id": "appointment-id",
      "appointmentDate": "2024-12-25T00:00:00.000Z",
      "appointmentTime": "10:00",
      "status": "pending",
      "doctorId": {
        "name": "Dr. Smith",
        "email": "smith@example.com"
      }
    }
  ]
}
```

#### Get Doctor Appointments
- **Endpoint:** `GET /api/appointments/doctor`
- **Description:** Get all appointments for current doctor
- **Authentication:** Required (Doctor role)
- **Response (200):**
```json
{
  "success": true,
  "message": "Appointments retrieved successfully",
  "data": [
    {
      "_id": "appointment-id",
      "appointmentDate": "2024-12-25T00:00:00.000Z",
      "appointmentTime": "10:00",
      "status": "pending",
      "patientId": {
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

#### Get Appointment by ID
- **Endpoint:** `GET /api/appointments/:id`
- **Description:** Get appointment details by ID
- **Authentication:** Required
- **Response (200):**
```json
{
  "success": true,
  "message": "Appointment retrieved successfully",
  "data": {
    "_id": "appointment-id",
    "appointmentDate": "2024-12-25T00:00:00.000Z",
    "status": "pending"
  }
}
```

#### Update Appointment Status
- **Endpoint:** `PATCH /api/appointments/:id/status`
- **Description:** Update appointment status (confirmed, completed, cancelled)
- **Authentication:** Required (Patient or Doctor role)
- **Request Body:**
```json
{
  "status": "confirmed",
  "cancellationReason": "Optional reason if cancelling"
}
```
- **Response (200):**
```json
{
  "success": true,
  "message": "Appointment status updated successfully",
  "data": {
    "_id": "appointment-id",
    "status": "confirmed"
  }
}
```

---

### Chatbot

#### Get Chatbot Session
- **Endpoint:** `GET /api/chatbot/session`
- **Description:** Get or create chatbot session for current user
- **Authentication:** Required
- **Response (200):**
```json
{
  "success": true,
  "message": "Session retrieved successfully",
  "data": {
    "_id": "session-id",
    "userId": "user-id",
    "messages": [],
    "isActive": true
  }
}
```

#### Send Message to Chatbot
- **Endpoint:** `POST /api/chatbot/message`
- **Description:** Send a message to chatbot and receive AI response
- **Authentication:** Required
- **Request Body:**
```json
{
  "message": "I have a headache"
}
```
- **Response (200):**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "session-id",
    "messages": [
      {
        "role": "user",
        "content": "I have a headache",
        "timestamp": "2024-12-20T10:00:00.000Z"
      },
      {
        "role": "assistant",
        "content": "Headaches can have various causes...",
        "timestamp": "2024-12-20T10:00:01.000Z"
      }
    ]
  }
}
```

#### Get Chat History
- **Endpoint:** `GET /api/chatbot/history`
- **Description:** Get all chatbot sessions for current user
- **Authentication:** Required
- **Response (200):**
```json
{
  "success": true,
  "message": "Chat history retrieved successfully",
  "data": [
    {
      "_id": "session-id",
      "messages": [],
      "isActive": false
    }
  ]
}
```

#### Close Chatbot Session
- **Endpoint:** `POST /api/chatbot/close`
- **Description:** Close current active chatbot session
- **Authentication:** Required
- **Response (200):**
```json
{
  "success": true,
  "message": "Session closed successfully",
  "data": {
    "_id": "session-id",
    "isActive": false
  }
}
```

---

### Report

#### Generate Report
- **Endpoint:** `POST /api/reports/generate`
- **Description:** Generate medical report from chatbot session
- **Authentication:** Required
- **Request Body:**
```json
{
  "chatbotSessionId": "session-id"
}
```
- **Response (201):**
```json
{
  "success": true,
  "message": "Report generated successfully",
  "data": {
    "_id": "report-id",
    "userId": "user-id",
    "chatbotSessionId": "session-id",
    "reportData": {
      "symptoms": ["Headache", "Fever"],
      "diagnosis": "Possible infection",
      "recommendations": ["Follow up with healthcare provider"],
      "severity": "medium",
      "suggestedActions": ["Consult with doctor"]
    }
  }
}
```

#### Get All User Reports
- **Endpoint:** `GET /api/reports`
- **Description:** Get all reports for current user
- **Authentication:** Required
- **Response (200):**
```json
{
  "success": true,
  "message": "Reports retrieved successfully",
  "data": [
    {
      "_id": "report-id",
      "reportData": {
        "symptoms": ["Headache"],
        "diagnosis": "General consultation",
        "severity": "low"
      },
      "generatedAt": "2024-12-20T10:00:00.000Z"
    }
  ]
}
```

#### Get Report by ID
- **Endpoint:** `GET /api/reports/:id`
- **Description:** Get report details by ID
- **Authentication:** Required
- **Response (200):**
```json
{
  "success": true,
  "message": "Report retrieved successfully",
  "data": {
    "_id": "report-id",
    "reportData": {
      "symptoms": ["Headache"],
      "diagnosis": "General consultation",
      "severity": "low",
      "recommendations": [],
      "suggestedActions": []
    }
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": "Optional error details"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting for production use.

## Notes

- All dates should be in ISO 8601 format
- JWT tokens expire after 7 days (configurable via `JWT_EXPIRE`)
- Password must be at least 6 characters long
- Email must be unique across all users
- Appointment time slots cannot overlap for the same doctor
