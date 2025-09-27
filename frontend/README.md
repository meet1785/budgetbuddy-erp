# BudgetBuddy ERP - Complete Finance Management System

A comprehensive Enterprise Resource Planning (ERP) system for budget and expense management with MongoDB integration.

![BudgetBuddy ERP Dashboard](https://github.com/user-attachments/assets/c8d497fe-451a-4993-b64b-8d40f1978fde)

## 🚀 Features

### ✅ Complete Implementation
- **Dashboard**: Real-time financial metrics and analytics
- **Budget Management**: Create, track, and monitor budgets with alerts
- **Expense Tracking**: Full expense lifecycle with approval workflows
- **Transaction Management**: Income and expense transaction tracking
- **User Management**: Role-based access control (Admin, Manager, User)
- **Category Management**: Organize expenses and budgets by category
- **Reports**: Comprehensive financial reporting and analytics
- **Settings**: System configuration and user preferences

### 🛡️ Production Ready
- **MongoDB Cloud Integration**: Connected to MongoDB Atlas
- **API Backend**: Express.js with TypeScript
- **Authentication**: JWT-based secure authentication
- **Authorization**: Role-based permissions system
- **Security**: Rate limiting, CORS, input validation, helmet security
- **Error Handling**: Comprehensive error boundaries and logging
- **Caching**: Optimized data loading and caching strategies
- **Docker Support**: Complete containerization setup
- **Nginx**: Production-ready reverse proxy configuration

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** with shadcn/ui components
- **React Router** for navigation
- **React Query** for data fetching and caching
- **React Hook Form** with Zod validation

### Backend
- **Express.js** with TypeScript
- **MongoDB** with Mongoose ODM
- **JWT** authentication and authorization
- **bcryptjs** for password hashing
- **Express Validator** for input validation
- **Morgan** for logging
- **Helmet** for security headers
- **CORS** for cross-origin requests

### Database
- **MongoDB Atlas** (Cloud) or Local MongoDB
- **Mongoose** schemas with validation
- **Indexes** for performance optimization
- **Data relationships** and referential integrity

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account or local MongoDB

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd budgetbuddy-erp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb+srv://meet:meetshah@project.n6lhrxe.mongodb.net/?retryWrites=true&w=majority&appName=Project
   DB_NAME=budgetbuddy_erp
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   ```

4. **Start Development Servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start separately
   npm run dev:client   # Frontend on http://localhost:8080
   npm run dev:server   # Backend on http://localhost:3001
   ```

5. **Seed Initial Data** (optional)
   ```bash
   npm run seed
   ```

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PATCH /api/auth/profile` - Update profile
- `PATCH /api/auth/change-password` - Change password

### Dashboard
- `GET /api/dashboard/metrics` - Get dashboard metrics
- `GET /api/dashboard/alerts` - Get budget alerts
- `GET /api/dashboard/recent-transactions` - Recent transactions
- `GET /api/dashboard/pending-expenses` - Pending expenses

### Budgets
- `GET /api/budgets` - List budgets
- `POST /api/budgets` - Create budget
- `GET /api/budgets/:id` - Get budget
- `PATCH /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Expenses
- `GET /api/expenses` - List expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses/:id` - Get expense
- `PATCH /api/expenses/:id` - Update expense
- `PATCH /api/expenses/:id/approve` - Approve expense
- `PATCH /api/expenses/:id/reject` - Reject expense
- `DELETE /api/expenses/:id` - Delete expense

## 🔐 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Authentication**: JWT-based with secure token handling
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive validation using express-validator
- **Password Security**: bcrypt hashing with salt rounds
- **CORS**: Configured for specific origins
- **Security Headers**: Helmet middleware for security headers
- **SQL Injection Protection**: Mongoose ODM prevents injection attacks

## 🎯 User Roles & Permissions

### Admin
- Full system access
- User management
- All CRUD operations
- System settings

### Manager
- Department-level access
- Expense approval
- Budget management
- Team oversight

### User
- Personal expenses
- View own data
- Submit expense requests
- Basic reporting

## 📊 Database Schema

### Users
- Authentication and profile information
- Role-based permissions
- Department association

### Budgets
- Allocated amounts and spending tracking
- Period-based budgeting (monthly, quarterly, yearly)
- Automatic status calculation

### Expenses
- Full expense details with receipts
- Approval workflow
- Category and budget association

### Transactions
- Income and expense transactions
- Account tracking
- Status management

### Categories
- Hierarchical category structure
- Budget allocation per category
- Color coding and descriptions

## 🚀 Production Deployment

### Environment Variables
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-super-secure-jwt-secret
PORT=3001
FRONTEND_URL=https://your-domain.com
```

### Build Commands
```bash
# Build frontend
npm run build:client

# Build backend
npm run build:server

# Build both
npm run build
```

### Docker Production
```bash
docker build -t budgetbuddy-erp .
docker run -p 3001:3001 --env-file .env budgetbuddy-erp
```

## 🔧 Development

### Project Structure
```
/
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── context/           # React context
│   ├── services/          # API services
│   ├── hooks/             # Custom hooks
│   ├── types/             # TypeScript types
│   └── lib/               # Utilities
├── server/                # Backend source
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── config/        # Configuration
│   │   └── utils/         # Utilities
│   └── dist/              # Built backend
├── dist/                  # Built frontend
└── public/                # Static assets
```

### Scripts
- `npm run dev` - Start both frontend and backend
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with initial data
- `npm run server` - Start production server

## 🧪 Testing

The application includes comprehensive error handling and can run in offline mode with localStorage fallback when the backend is not available.

### Manual Testing
1. **Frontend Only**: Application works with localStorage
2. **Backend Health**: Check `/api/health` endpoint
3. **Database Connection**: Monitor connection status in UI
4. **API Integration**: Test CRUD operations through UI

## 📈 Monitoring & Logging

- **Health Checks**: `/api/health` endpoint
- **Connection Status**: Real-time UI indicator
- **Request Logging**: Morgan middleware
- **Error Tracking**: Comprehensive error boundaries
- **Performance**: Optimized queries and caching

## 🤝 Default Users

After seeding, you can login with:
- **Email**: john.doe@company.com
- **Password**: password123
- **Role**: Admin

## 📝 License

This project is licensed under the MIT License.

## 🙋‍♂️ Support

For issues and questions, please check the GitHub issues or create a new one.

---

**Status**: ✅ Production Ready with MongoDB Integration
