/**
 * Currency formatting utilities for Indian Rupees
 */

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatCurrencyWithSign = (amount: number, showSign = false): string => {
  const formatted = formatCurrency(Math.abs(amount));
  if (showSign) {
    return amount >= 0 ? `+${formatted}` : `-${formatted}`;
  }
  return formatted;
};

export const parseCurrency = (currencyString: string): number => {
  return parseFloat(currencyString.replace(/[₹,]/g, '')) || 0;
};