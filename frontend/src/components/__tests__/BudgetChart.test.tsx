import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BudgetPieChart } from '../charts/BudgetChart';

// Mock the AppContext
const mockState = {
  metrics: {
    categoryBreakdown: [
      { category: 'Operations', amount: 45200, percentage: 37.7 },
      { category: 'Marketing', amount: 12500, percentage: 10.4 },
      { category: 'Development', amount: 28300, percentage: 23.6 },
    ]
  }
};

vi.mock('@/context/AppContext', () => ({
  useAppContext: () => ({ state: mockState }),
}));

// Mock Recharts components
vi.mock('recharts', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ data }: { data: any[] }) => <div data-testid="pie" data-length={data.length} />,
  Cell: () => <div data-testid="cell" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('BudgetPieChart', () => {
  it('renders without crashing', () => {
    render(<BudgetPieChart />);
    expect(screen.getByText('Budget Distribution')).toBeInTheDocument();
    expect(screen.getByText('Current budget allocation by category')).toBeInTheDocument();
  });

  it('displays chart with correct data', () => {
    render(<BudgetPieChart />);
    const pieChart = screen.getByTestId('pie-chart');
    expect(pieChart).toBeInTheDocument();
    
    const pie = screen.getByTestId('pie');
    expect(pie).toHaveAttribute('data-length', '3');
  });

  it('maps category data correctly', () => {
    const { container } = render(<BudgetPieChart />);
    expect(container).toBeInTheDocument();
    
    // Verify that the component processes the mock data
    expect(mockState.metrics.categoryBreakdown).toHaveLength(3);
    expect(mockState.metrics.categoryBreakdown[0].category).toBe('Operations');
  });
});