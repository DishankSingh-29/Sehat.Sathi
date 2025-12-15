# Sehat Sathi - AI Health Assistant

Sehat Sathi is a comprehensive healthcare management platform that provides AI-powered medical consultation, appointment booking, and health report generation.

## Features

- **User Authentication**: Secure registration and login with JWT-based authentication
- **Role-Based Access**: Separate interfaces for patients and doctors
- **Doctor Management**: Doctor profiles with specialization, qualifications, and availability
- **Appointment Booking**: Easy appointment scheduling with conflict prevention
- **AI Chatbot**: Medical query chatbot with conversation history
- **Report Generation**: Automated medical reports from chatbot conversations
- **Profile Management**: Update and manage user profiles

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment configuration

### Frontend
- HTML, CSS, JavaScript (already implemented)

## Project Structure

```
sehat.sathi/
├── backend/                         # Node.js + Express API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/                # Login / Signup
│   │   │   ├── patient/             # Patient management
│   │   │   ├── doctor/              # Doctor management
│   │   │   ├── appointment/         # Appointment booking
│   │   │   ├── chatbot/             # Medical chatbot
│   │   │   └── report/              # Medical reports
│   │   ├── models/                  # Database schemas
│   │   │   ├── User.model.js
│   │   │   ├── Doctor.model.js
│   │   │   └── Appointment.model.js
│   │   ├── middleware/              # Auth & error handling
│   │   │   ├── auth.middleware.js
│   │   │   └── error.middleware.js
│   │   ├── utils/                   # Helper functions
│   │   │   ├── jwt.util.js
│   │   │   └── response.util.js
│   │   ├── config/                  # Configuration files
│   │   │   ├── db.config.js
│   │   │   └── env.config.js
│   │   └── app.js                   # Express app setup
│   ├── server.js                    # Server entry point
│   └── package.json
│
├── frontend/                        # HTML + CSS + JS frontend
│   ├── index.html                   # Landing page
│   ├── pages/
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── dashboard.html
│   │   ├── doctors.html
│   │   ├── appointment.html
│   │   └── chatbot.html
│   ├── css/
│   │   ├── style.css
│   │   ├── auth.css
│   │   └── dashboard.css
│   ├── js/
│   │   ├── main.js
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   └── chatbot.js
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   │   └── helpers.js
│   └── assets/
│       ├── images/
│       └── icons/
│
├── docs/                            # Documentation
│   ├── api-docs.md
│   ├── flow-diagram.png
│   └── screenshots/
│
├── .env                             # Environment variables
├── package.json                     # Root config
└── README.md                        # Project overview
```

## Architecture

The backend follows **Clean Architecture** principles with a clear separation of concerns:

- **Controller Layer**: Handles HTTP requests and responses
- **Service Layer**: Contains business logic
- **Model Layer**: Database schemas and models
- **Middleware**: Authentication, error handling, and validation
- **Utils**: Reusable utility functions

## Setup & Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/sehat-sathi
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   CORS_ORIGIN=http://localhost:5500
   ```
   
   **Important**: Replace `JWT_SECRET` with a strong random string for production use.

4. **Start MongoDB:**
   Make sure MongoDB is running on your system or update `MONGODB_URI` to point to your MongoDB instance.

5. **Run the server:**
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

6. **Verify server is running:**
   Visit `http://localhost:5000/health` to check if the server is running.

### Frontend Setup

The frontend is already implemented. Simply open `frontend/index.html` in a browser or serve it using a local server (e.g., Live Server extension in VS Code).

## API Endpoints

See [docs/api-docs.md](docs/api-docs.md) for complete API documentation.

### Quick Reference

- **Authentication**: `/api/auth/*`
- **Patients**: `/api/patients/*`
- **Doctors**: `/api/doctors/*`
- **Appointments**: `/api/appointments/*`
- **Chatbot**: `/api/chatbot/*`
- **Reports**: `/api/reports/*`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `JWT_EXPIRE` | JWT token expiration time | `7d` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5500` |

## Database Models

### User
- Base user model for both patients and doctors
- Fields: name, email, password, role, phone, address, dateOfBirth, gender

### Doctor
- Extended doctor profile
- Fields: specialization, qualification, experience, consultationFee, bio, availability, workingHours

### Appointment
- Appointment booking
- Fields: patientId, doctorId, appointmentDate, appointmentTime, duration, status, reason

### Chatbot
- Chatbot conversation sessions
- Fields: userId, messages (array), isActive

### Report
- Medical reports generated from chatbot
- Fields: userId, chatbotSessionId, reportData (symptoms, diagnosis, recommendations)

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based authorization
- Input validation
- SQL injection prevention (MongoDB)
- CORS configuration
- Error handling middleware

## Development

### Running in Development Mode

```bash
cd backend
npm run dev
```

This uses `nodemon` for automatic server restarts on file changes.

### Code Style

- Use async/await for asynchronous operations
- Follow ES6+ JavaScript standards
- Use meaningful variable and function names
- Add comments for complex logic
- Follow the existing code structure

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure a production MongoDB instance
4. Set appropriate `CORS_ORIGIN`
5. Use environment variables for sensitive data
6. Consider adding rate limiting
7. Set up proper logging
8. Use HTTPS in production

## Testing

API endpoints can be tested using:
- Postman
- cURL
- Frontend application
- Any HTTP client

Example cURL request:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify network connectivity

### JWT Token Errors
- Verify `JWT_SECRET` is set
- Check token expiration
- Ensure token is sent in Authorization header

### CORS Issues
- Update `CORS_ORIGIN` in `.env` to match frontend URL
- Check browser console for CORS errors

## Contributing

1. Follow the existing code structure
2. Add appropriate error handling
3. Include comments for complex logic
4. Test your changes thoroughly
5. Update documentation if needed

## License

ISC

## Support

For issues or questions, please refer to the API documentation or create an issue in the project repository.

## Future Enhancements

- Integration with Basic LLM Model real AI services
- Email notifications
- SMS reminders for appointments
- Payment gateway integration
- Advanced analytics and reporting
- Multi-language support
- Mobile app development

---

**Note**: The chatbot currently uses mock AI responses. For production, integrate with actual AI services like OpenAI GPT, Google Gemini, or specialized medical AI APIs.
