import connectDatabase from '../config/database';
import { User, Category, Budget, Expense, Transaction } from '../models';

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Budget.deleteMany({});
    await Expense.deleteMany({});
    await Transaction.deleteMany({});

    console.log('🧹 Cleared existing data');

    // Create categories
    const categories = await Category.create([
      { name: 'Operations', description: 'Day-to-day operational expenses', color: '#3B82F6', isActive: true },
      { name: 'Marketing', description: 'Marketing and advertising expenses', color: '#10B981', isActive: true },
      { name: 'Development', description: 'Software development costs', color: '#F59E0B', isActive: true },
      { name: 'Administration', description: 'Administrative expenses', color: '#8B5CF6', isActive: true },
      { name: 'Travel', description: 'Business travel expenses', color: '#EF4444', isActive: true },
      { name: 'Equipment', description: 'Office equipment and supplies', color: '#06B6D4', isActive: true }
    ]);

    console.log('📂 Created categories');

    // Create users
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'john.doe@company.com',
        password: 'password123',
        role: 'admin',
        department: 'Administration',
        permissions: ['view_all', 'edit_all', 'delete_all', 'approve_expenses', 'manage_users']
      },
      {
        name: 'Sarah Smith',
        email: 'sarah.smith@company.com',
        password: 'password123',
        role: 'manager',
        department: 'Marketing',
        permissions: ['view_department', 'edit_department', 'approve_expenses']
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@company.com',
        password: 'password123',
        role: 'user',
        department: 'Engineering',
        permissions: ['view_own', 'create_expenses']
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@company.com',
        password: 'password123',
        role: 'manager',
        department: 'Finance',
        permissions: ['view_all', 'edit_budgets', 'approve_expenses']
      }
    ]);

    console.log('👥 Created users');

    // Create budgets
    const budgets = await Budget.create([
      {
        name: 'Q4 Operations Budget',
        category: 'Operations',
        allocated: 50000,
        spent: 45200,
        period: 'quarterly'
      },
      {
        name: 'Marketing Campaign 2024',
        category: 'Marketing',
        allocated: 20000,
        spent: 12500,
        period: 'monthly'
      },
      {
        name: 'Development Sprint Budget',
        category: 'Development',
        allocated: 35000,
        spent: 28300,
        period: 'monthly'
      },
      {
        name: 'Administrative Expenses',
        category: 'Administration',
        allocated: 15000,
        spent: 8900,
        period: 'monthly'
      }
    ]);

    console.log('💰 Created budgets');

    // Create expenses
    const expenses = await Expense.create([
      {
        description: 'Office Rent - March 2024',
        amount: 8500,
        category: 'Operations',
        budgetId: budgets[0]._id,
        date: new Date('2024-03-01'),
        vendor: 'Property Management Co.',
        status: 'approved',
        approvedBy: 'John Doe',
        tags: ['recurring', 'rent'],
        department: 'Administration'
      },
      {
        description: 'Google Ads Campaign',
        amount: 2300,
        category: 'Marketing',
        budgetId: budgets[1]._id,
        date: new Date('2024-03-15'),
        vendor: 'Google LLC',
        status: 'approved',
        approvedBy: 'Sarah Smith',
        tags: ['advertising', 'digital'],
        department: 'Marketing'
      },
      {
        description: 'Software Development Tools',
        amount: 4200,
        category: 'Development',
        budgetId: budgets[2]._id,
        date: new Date('2024-03-10'),
        vendor: 'JetBrains',
        status: 'approved',
        approvedBy: 'Emily Davis',
        tags: ['software', 'tools'],
        department: 'Engineering'
      },
      {
        description: 'Business Travel - Client Meeting',
        amount: 1800,
        category: 'Travel',
        date: new Date('2024-03-20'),
        vendor: 'American Airlines',
        status: 'pending',
        tags: ['travel', 'client'],
        department: 'Sales'
      },
      {
        description: 'Office Supplies',
        amount: 450,
        category: 'Equipment',
        budgetId: budgets[3]._id,
        date: new Date('2024-03-18'),
        vendor: 'Staples',
        status: 'approved',
        approvedBy: 'John Doe',
        tags: ['supplies', 'office'],
        department: 'Administration'
      }
    ]);

    console.log('💸 Created expenses');

    // Create transactions
    const transactions = await Transaction.create([
      {
        type: 'expense',
        amount: 8500,
        description: 'Office Rent Payment',
        category: 'Operations',
        date: new Date('2024-03-01'),
        account: 'Business Checking',
        reference: 'CHK-001234',
        status: 'completed'
      },
      {
        type: 'income',
        amount: 25000,
        description: 'Client Payment - Project Alpha',
        category: 'Revenue',
        date: new Date('2024-03-15'),
        account: 'Business Checking',
        reference: 'DEP-005678',
        status: 'completed'
      },
      {
        type: 'expense',
        amount: 2300,
        description: 'Marketing Campaign',
        category: 'Marketing',
        date: new Date('2024-03-15'),
        account: 'Business Credit Card',
        reference: 'CC-009876',
        status: 'completed'
      },
      {
        type: 'expense',
        amount: 4200,
        description: 'Software Licenses',
        category: 'Development',
        date: new Date('2024-03-10'),
        account: 'Business Credit Card',
        reference: 'CC-009875',
        status: 'completed'
      },
      {
        type: 'expense',
        amount: 1800,
        description: 'Business Travel',
        category: 'Travel',
        date: new Date('2024-03-20'),
        account: 'Business Credit Card',
        reference: 'CC-009877',
        status: 'pending'
      }
    ]);

    console.log('💳 Created transactions');

    console.log('✅ Database seeding completed successfully!');
    console.log(`
    🎯 Seeded data summary:
    - Categories: ${categories.length}
    - Users: ${users.length}
    - Budgets: ${budgets.length}
    - Expenses: ${expenses.length}
    - Transactions: ${transactions.length}
    
    👤 Default admin user:
    Email: john.doe@company.com
    Password: password123
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  connectDatabase().then(() => {
    seedData().then(() => {
      process.exit(0);
    });
  });
}

export default seedData;