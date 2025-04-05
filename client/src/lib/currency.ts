export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Remove currency symbol for inputs
export const formatAmountForInput = (amount: number): string => {
  return amount.toFixed(2);
};

// Parse amount from string (handles both INR format and plain numbers)
export const parseAmount = (amount: string): number => {
  // Remove currency symbol, commas and other non-numeric characters except decimal point
  const cleanAmount = amount.replace(/[^0-9.-]/g, '');
  return parseFloat(cleanAmount);
};
