# BudgetBuddy ERP - Production Deployment Guide

## 🚀 Quick Start Options

### Option 1: Docker Compose (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd budgetbuddy-erp

# Copy environment configuration
cp .env.example .env

# Start the full stack
docker-compose up -d

# Visit http://localhost for the app
# API available at http://localhost:3000/api
```

### Option 2: Manual Development Setup
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev

# Visit http://localhost:5173
```

## 🏗️ Production Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    MongoDB      │
│   (Nginx)       │    │   (Node.js)     │    │   (Database)    │
│   Port: 80      │◄──►│   Port: 3000    │◄──►│   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=production
MONGODB_URI=mongodb://admin:password123@mongodb:27017/budgetbuddy_erp?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
FRONTEND_URL=http://localhost
PORT=3000
BCRYPT_SALT_ROUNDS=12
```

**Frontend (build time)**
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=BudgetBuddy ERP
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

### Frontend Tests
```bash
cd frontend
npm test                # Run all tests
npm run test:ui         # Visual test runner
npm run test:coverage   # Coverage report
```

## 🛡️ Security Features

### Implemented Security Measures
- ✅ JWT authentication with configurable expiration
- ✅ bcrypt password hashing (12 salt rounds)
- ✅ Rate limiting (100 requests per 15 minutes)
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Input validation and sanitization
- ✅ MongoDB injection protection
- ✅ Secure Docker configurations

### Security Headers (Nginx)
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

## 📊 Performance Optimizations

### Frontend Optimizations
- ✅ Code splitting by vendor and feature
- ✅ Tree shaking for unused code
- ✅ Gzip compression
- ✅ Asset caching (1 year for static assets)
- ✅ Bundle analysis and optimization

### Backend Optimizations
- ✅ MongoDB indexes on frequently queried fields
- ✅ Connection pooling
- ✅ Response compression
- ✅ Efficient data normalization

### Database Indexes
```javascript
// Budgets
{ "category": 1 }
{ "status": 1 }
{ "createdAt": -1 }

// Expenses
{ "status": 1 }
{ "date": -1 }
{ "budgetId": 1 }

// Users
{ "email": 1 } // unique
{ "role": 1 }
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
- ✅ Automated testing (Jest + Vitest)
- ✅ Code quality checks (ESLint, TypeScript)
- ✅ Security auditing (npm audit)
- ✅ Docker image building
- ✅ Multi-stage deployment validation

### Pipeline Stages
1. **Test**: Run unit and integration tests
2. **Lint**: Check code quality and style
3. **Security**: Audit dependencies for vulnerabilities
4. **Build**: Create Docker images
5. **Deploy**: Production deployment (manual trigger)

## 🐳 Docker Configuration

### Multi-stage Builds
- **Base**: Node.js 18 Alpine (minimal)
- **Dependencies**: Cached layer for faster builds
- **Builder**: TypeScript compilation
- **Runner**: Production image with minimal footprint

### Health Checks
- **Frontend**: HTTP check on /health endpoint
- **Backend**: API health check on /api/health
- **MongoDB**: Connection ping validation

## 📈 Monitoring & Logging

### Application Metrics
- Response times and error rates
- Database query performance
- Memory and CPU usage
- User authentication metrics

### Log Levels
```
ERROR: System errors, failures
WARN:  Performance issues, deprecations
INFO:  User actions, system events
DEBUG: Detailed debugging information
```

## 🚨 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check MongoDB status
docker-compose logs mongodb

# Restart database
docker-compose restart mongodb
```

**Build Failures**
```bash
# Clear dependencies
rm -rf node_modules package-lock.json
npm install

# Clear Docker cache
docker builder prune
```

**Permission Issues**
```bash
# Fix file permissions
chmod +x scripts/*.sh
chown -R $USER:$USER .
```

## 📦 Deployment Environments

### Development
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Staging
```bash
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up
```

### Production
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 🔐 Production Checklist

- [ ] Update JWT_SECRET to secure random string (32+ chars)
- [ ] Configure production MongoDB instance
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx/traefik)
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategy
- [ ] Review and update rate limits
- [ ] Set up log aggregation
- [ ] Configure CDN for static assets
- [ ] Test disaster recovery procedures

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review application logs
3. Open an issue in the repository
4. Contact the development team

---

**Version**: 1.0.0  
**Last Updated**: $(date)  
**Environment**: Production Ready ✅