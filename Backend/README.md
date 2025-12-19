# Digious CRM - Backend API

A Node.js/Express backend API for the Digious CRM system with PostgreSQL database integration.

## Project Structure

```
Backend/
├── config/
│   └── database.js          # Database connection configuration
├── routes/
│   ├── auth.js              # Authentication endpoints
│   ├── employees.js         # Employee management endpoints
│   ├── attendance.js        # Attendance tracking endpoints
│   └── departments.js       # Department management endpoints
├── utils/
│   └── validators.js        # Input validation utilities
├── .env                     # Environment variables
├── .env.example             # Example environment file
├── package.json             # Project dependencies
├── server.js                # Main server file
└── README.md               # This file
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd Backend
npm install
```

### 2. Environment Variables

The `.env` file is already configured with the database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=digious_crm
DB_USER=digious_user
DB_PASSWORD=digious123
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 3. Start the Server

**Development mode with auto-reload:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

```bash
node migrate.js
```

This will create all necessary tables in the PostgreSQL database:
- departments
- employees
- attendance
- leaves
- applications
- memos

### 4. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will start at: `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /api/health` - Check server and database connection status

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/logout` - User logout

### Employees
- `GET /api/v1/employees` - Get all employees
- `GET /api/v1/employees/:id` - Get employee by ID
- `POST /api/v1/employees` - Create new employee
- `PUT /api/v1/employees/:id` - Update employee
- `DELETE /api/v1/employees/:id` - Delete employee

### Attendance
- `GET /api/v1/attendance` - Get attendance records
- `POST /api/v1/attendance/check-in` - Record check-in
- `POST /api/v1/attendance/check-out` - Record check-out

### Departments
- `GET /api/v1/departments` - Get all departments
- `POST /api/v1/departments` - Create new department

## Database Connection

**Host:** localhost  
**Port:** 5432  
**Database:** digious_crm  
**User:** digious_user  
**Password:** digious123  

Connection String:
```
postgresql://digious_user:digious123@localhost:5432/digious_crm
```

## Technology Stack

- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** Helmet.js, CORS
- **Logging:** Morgan
- **Validation:** Express Validator
- **ORM:** pg-promise

## Development

### Add New Route

1. Create a new file in `routes/` directory
2. Import in `server.js`
3. Add route with `app.use()`

### Add Migration

1. Create new file in `migrations/` directory
2. Update `migrate.js` to include new migration
3. Run `node migrate.js`

## Error Handling

All endpoints follow standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

## License

ISC

## Author

Digious Team
