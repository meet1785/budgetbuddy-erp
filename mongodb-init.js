// MongoDB initialization script for Docker
db = db.getSiblingDB('budgetbuddy_erp');

// Create collections with indexes for better performance
db.createCollection('budgets');
db.budgets.createIndex({ "category": 1 });
db.budgets.createIndex({ "status": 1 });
db.budgets.createIndex({ "createdAt": -1 });

db.createCollection('expenses');
db.expenses.createIndex({ "status": 1 });
db.expenses.createIndex({ "category": 1 });
db.expenses.createIndex({ "date": -1 });
db.expenses.createIndex({ "budgetId": 1 });

db.createCollection('transactions');
db.transactions.createIndex({ "type": 1 });
db.transactions.createIndex({ "date": -1 });
db.transactions.createIndex({ "status": 1 });

db.createCollection('users');
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });

db.createCollection('categories');
db.categories.createIndex({ "name": 1 }, { unique: true });

print('Database initialized with indexes');