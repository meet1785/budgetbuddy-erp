# 💰 BudgetBuddy ERP

<div align="center">

![BudgetBuddy ERP Banner](https://img.shields.io/badge/BudgetBuddy-ERP%20System-blue?style=for-the-badge&logo=wallet&logoColor=white)

**A comprehensive Enterprise Resource Planning (ERP) system built with modern web technologies**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

[🚀 Live Demo](https://budgetbuddy-erp.vercel.app) • [📖 Documentation](./docs) • [🐛 Report Bug](https://github.com/meet1785/budgetbuddy-erp/issues) • [✨ Request Feature](https://github.com/meet1785/budgetbuddy-erp/issues)

</div>

---

## 🌟 Features Overview

<table>
<tr>
<td width="50%">

### 💼 **Core Business Features**
- 🇮🇳 **Indian Rupee Support** - Complete INR formatting
- 📊 **Dynamic Budget Management** - Real-time budget tracking
- 💸 **Expense Management** - Comprehensive expense tracking
- 📈 **Interactive Analytics** - Charts and visualizations
- 🏷️ **Category Management** - Organized expense categories
- 💳 **Transaction Tracking** - Complete transaction history

</td>
<td width="50%">

### 🔧 **Advanced Features**
- 👥 **User Management** - Role-based access control
- 🔐 **Permission System** - 23+ granular permissions
- 🔍 **Advanced Search** - Real-time filtering
- 📱 **Responsive Design** - Mobile-first approach
- 🌙 **Dark/Light Theme** - Customizable UI
- 📋 **Data Export** - Multiple export formats

</td>
</tr>
</table>

## 🎯 Key Highlights

### 🚀 **Recently Implemented**
- ✅ **Complete User Management System** with profile editing and permission management
- ✅ **Indian Rupee Integration** across all financial displays
- ✅ **Dynamic Budget-Expense Linking** with interactive charts
- ✅ **Advanced Search Functionality** with real-time filtering
- ✅ **Responsive Modal System** with URL parameter support

## 📱 Screenshots

<details>
<summary>🖼️ <strong>Click to view application screenshots</strong></summary>

### 🏠 Dashboard Overview
![Dashboard](https://via.placeholder.com/800x500/1f2937/ffffff?text=Dashboard+Screenshot+Coming+Soon)
*Real-time analytics with Indian Rupee formatting and interactive charts*

### 👥 User Management
![User Management](https://via.placeholder.com/800x500/1f2937/ffffff?text=User+Management+Screenshot+Coming+Soon)
*Comprehensive user management with role-based permissions*

### 💰 Budget Management
![Budget Management](https://via.placeholder.com/800x500/1f2937/ffffff?text=Budget+Management+Screenshot+Coming+Soon)
*Dynamic budget tracking with expense linking*

### 📊 Expense Tracking
![Expense Tracking](https://via.placeholder.com/800x500/1f2937/ffffff?text=Expense+Tracking+Screenshot+Coming+Soon)
*Advanced expense management with category filtering*

### 🔍 Search & Filtering
![Search Functionality](https://via.placeholder.com/800x500/1f2937/ffffff?text=Search+Functionality+Screenshot+Coming+Soon)
*Real-time search across all data tables*

</details>

## 🛠️ Tech Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-4.4.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-18.17.0-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18.2-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-9.0.2-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

### UI/UX
![Shadcn/UI](https://img.shields.io/badge/Shadcn/UI-Latest-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix%20UI-1.0-8B5CF6?style=for-the-badge&logo=radixui&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-2.8.0-FF6B6B?style=for-the-badge&logo=chartdotjs&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide-Icons-F56565?style=for-the-badge&logo=lucide&logoColor=white)

</div>

## 🚀 Quick Start

### 📋 Prerequisites
```bash
Node.js (v18+)
MongoDB (v6.0+)
npm or yarn or bun
Git
```

### ⚡ Installation

<details>
<summary><strong>🔽 Step-by-step installation guide</strong></summary>

1. **Clone the repository:**
```bash
git clone https://github.com/meet1785/budgetbuddy-erp.git
cd budgetbuddy-erp
```

2. **Install backend dependencies:**
```bash
cd backend
npm install
```

3. **Install frontend dependencies:**
```bash
cd ../frontend
npm install
# or using bun for faster installation
bun install
```

4. **Environment Setup:**
Create `.env` file in the backend directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/budgetbuddy-erp
# or use MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/budgetbuddy-erp

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173
```

5. **Database Setup:**
```bash
# Start MongoDB locally
mongod

# Or use the provided test connection
cd backend
npm run test-mongo
```

6. **Start Development Servers:**

**Backend** (Terminal 1):
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

</details>

### 🎉 You're Ready!
Visit `http://localhost:5173` to see the application in action!

## 📁 Project Architecture

```
budgetbuddy-erp/
├── 🗄️ backend/
│   ├── 📁 src/
│   │   ├── 🎮 controllers/     # API route handlers
│   │   ├── 🛡️ middleware/      # Auth, validation, error handling
│   │   ├── 📊 models/          # MongoDB schemas
│   │   ├── 🛣️ routes/          # API endpoints
│   │   ├── 🔧 config/          # Database configuration
│   │   ├── 🏷️ types/           # TypeScript types
│   │   └── 🛠️ utils/           # Helper functions
│   ├── 📄 server.ts            # Express server entry
│   └── 📦 package.json
│
├── 🎨 frontend/
│   ├── 📁 src/
│   │   ├── 🧩 components/      # Reusable UI components
│   │   │   ├── 📊 charts/      # Chart components
│   │   │   ├── 📝 forms/       # Form components
│   │   │   ├── 🏗️ layout/      # Layout components
│   │   │   ├── 🎭 ui/          # Base UI components
│   │   │   └── 📋 data-table/  # Table components
│   │   ├── 📄 pages/           # Route components
│   │   ├── 🎯 context/         # React context
│   │   ├── 🪝 hooks/           # Custom hooks
│   │   ├── 🌐 services/        # API services
│   │   ├── 🏷️ types/           # TypeScript types
│   │   └── 🛠️ utils/           # Helper functions
│   ├── 📄 index.html
│   └── 📦 package.json
│
├── 📚 Documentation/
│   ├── 📖 SEARCH_FUNCTIONALITY.md
│   ├── 📖 BUDGET_EXPENSE_LINKING.md
│   ├── 📖 USER_MANAGEMENT_IMPLEMENTATION.md
│   └── 📖 DEPLOYMENT.md
│
└── 📄 README.md (You are here!)
```

## 🎯 User Management System

<details>
<summary><strong>👥 Comprehensive User Management Features</strong></summary>

### 🔐 **Permission System**
Our advanced permission system includes **23+ granular permissions** across **5 categories**:

#### **📊 Budget Management**
- `create_budget` - Create new budgets
- `edit_budget` - Modify existing budgets
- `delete_budget` - Remove budgets
- `approve_budget` - Approve budget requests
- `view_all_budgets` - View all organizational budgets

#### **💸 Expense Management**
- `create_expense` - Add new expenses
- `edit_expense` - Modify expense records
- `delete_expense` - Remove expenses
- `approve_expense` - Approve expense claims
- `view_all_expenses` - View all expenses

#### **👥 User Management**
- `create_user` - Add new users
- `edit_user` - Modify user profiles
- `delete_user` - Remove user accounts
- `manage_permissions` - Assign permissions
- `view_all_users` - View all users

#### **📈 Reports & Analytics**
- `view_reports` - Access reports
- `export_data` - Export data
- `view_analytics` - View analytics
- `create_reports` - Generate reports

#### **⚙️ System Administration**
- `system_settings` - Modify system settings
- `backup_data` - Backup system data
- `audit_logs` - View audit trails
- `manage_integrations` - Manage integrations

### 🎭 **Role-Based Access**
- **👑 Admin** - Full system access
- **👔 Manager** - Department-level access
- **👤 User** - Basic access permissions

</details>

## 🌍 Internationalization

### 🇮🇳 **Indian Rupee Support**
- Complete INR formatting (`₹1,23,456.78`)
- Locale-aware number formatting (`'en-IN'`)
- Currency symbols in all financial displays
- Regional number formatting standards

## 📊 Data Visualization

### 📈 **Interactive Charts**
- Real-time budget vs expense tracking
- Dynamic data updates
- Responsive chart design
- Multiple chart types (Bar, Line, Pie, Area)
- Custom color schemes matching app theme

## 🔍 Advanced Search

### ⚡ **Real-time Filtering**
- Instant search results
- Multi-field searching
- Debounced input for performance
- Highlighted search matches
- Search history and suggestions

## 🚀 Performance

### ⚡ **Optimizations**
- **Code Splitting** - Lazy loading of components
- **Bundle Optimization** - Tree shaking and minification
- **Image Optimization** - WebP format with fallbacks
- **Caching Strategy** - Service worker implementation
- **Database Indexing** - Optimized MongoDB queries

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 🚀 Deployment

<details>
<summary><strong>🌐 Deployment Options</strong></summary>

### **Vercel (Recommended for Frontend)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

### **Railway (Recommended for Backend)**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy backend
cd backend
railway login
railway deploy
```

### **Docker Deployment**
```bash
# Build and run with Docker Compose
docker-compose up --build -d
```

### **Manual Deployment**
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

</details>

## 🤝 Contributing

We welcome contributions! Here's how you can help:

<details>
<summary><strong>📋 Contribution Guidelines</strong></summary>

### **🛠️ Development Process**
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Make** your changes
4. **Test** your changes thoroughly
5. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
6. **Push** to the branch (`git push origin feature/AmazingFeature`)
7. **Open** a Pull Request

### **📝 Commit Convention**
We use [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add new user management feature
fix: resolve chart rendering issue
docs: update README with screenshots
style: improve button component styling
refactor: optimize database queries
test: add user authentication tests
```

### **🐛 Bug Reports**
When reporting bugs, please include:
- Operating System and version
- Browser and version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable

### **✨ Feature Requests**
For feature requests, please include:
- Clear description of the feature
- Use case and benefits
- Possible implementation approach
- Screenshots or mockups if applicable

</details>

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

<div align="center">

**Meet Patel**

[![GitHub](https://img.shields.io/badge/GitHub-meet1785-181717?style=flat-square&logo=github)](https://github.com/meet1785)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-meetpatel-0077B5?style=flat-square&logo=linkedin)](https://linkedin.com/in/meetpatel)
[![Portfolio](https://img.shields.io/badge/Portfolio-meetpatel.dev-FF6B6B?style=flat-square&logo=firefox)](https://meetpatel.dev)

</div>

## 🙏 Acknowledgments

- [Shadcn/UI](https://ui.shadcn.com/) for the beautiful component library
- [Recharts](https://recharts.org/) for the amazing chart components
- [Lucide](https://lucide.dev/) for the clean, consistent icons
- [TailwindCSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) for the accessible primitives

---

<div align="center">

**⭐ Don't forget to star this repository if you found it helpful!**

Made with ❤️ by [Meet Patel](https://github.com/meet1785)

</div>