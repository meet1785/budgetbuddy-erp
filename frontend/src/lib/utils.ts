import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const DEFAULT_CURRENCY_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | string | null | undefined,
  options?: Intl.NumberFormatOptions
): string {
  const numericAmount = typeof amount === 'number' ? amount : Number(amount ?? 0);
  if (Number.isNaN(numericAmount)) {
    return DEFAULT_CURRENCY_FORMATTER.format(0);
  }

  if (!options) {
    return DEFAULT_CURRENCY_FORMATTER.format(numericAmount);
  }

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  });

  return formatter.format(numericAmount);
}
