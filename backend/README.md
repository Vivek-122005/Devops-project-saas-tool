# Backend API

Node.js/Express backend service for the SaaS platform.

## 📁 Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
├── tests/
│   ├── unit/           # Unit tests
│   └── integration/    # Integration tests
├── database/
│   ├── migrations/     # Database migrations
│   └── seeds/          # Seed data
├── Dockerfile
└── package.json
```

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Testing

```bash
npm test              # Run all tests
npm run test:unit     # Unit tests only
npm run test:watch    # Watch mode
```

### Linting

```bash
npm run lint          # Check code
npm run lint:fix      # Fix issues
npm run format        # Format code
```

## 📚 API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:5000/api-docs
- OpenAPI JSON: http://localhost:5000/api-docs.json

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp ../.env.example .env
```

## 🗄️ Database

### Migrations

```bash
npm run migrate       # Run migrations
```

### Seeding

```bash
npm run seed         # Seed database
```

## 🏗️ Architecture

### Layers

1. **Routes** - HTTP endpoints
2. **Controllers** - Request handling
3. **Services** - Business logic
4. **Models** - Data layer

### Key Features

- RESTful API design
- JWT authentication
- Rate limiting
- Request validation
- Error handling
- API documentation (Swagger)
- Structured logging
- Database connection pooling
- Redis caching

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update profile
- `GET /api/users/:id` - Get user by ID
- `DELETE /api/users/:id` - Delete user

### Health
- `GET /health` - Health check
- `GET /api/health` - Detailed health status

## 🧪 Testing Strategy

```
tests/
├── unit/               # Fast, isolated tests
│   ├── controllers/
│   ├── services/
│   └── utils/
└── integration/        # API endpoint tests
    └── routes/
```

## 🔒 Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation & sanitization
- SQL injection prevention
- XSS protection
- JWT with short expiration
- Password hashing (bcrypt)

## 📊 Monitoring

- Structured JSON logging
- Request/response logging
- Error tracking (Sentry)
- Performance metrics

## 🐳 Docker

### Build

```bash
docker build -t saas-backend .
```

### Run

```bash
docker run -p 5000:5000 --env-file .env saas-backend
```

## 📦 Dependencies

### Production
- **express** - Web framework
- **pg** - PostgreSQL client
- **redis** - Redis client
- **helmet** - Security middleware
- **cors** - CORS handling
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT handling
- **winston** - Logging

### Development
- **nodemon** - Auto-reload
- **jest** - Testing framework
- **supertest** - HTTP testing
- **eslint** - Linting
- **prettier** - Code formatting

## 🤝 Contributing

Follow these conventions:

1. **Code Style**: Use ESLint + Prettier
2. **Commits**: Follow Conventional Commits
3. **Testing**: Write tests for new features
4. **Documentation**: Update API docs

## 📄 License

MIT
