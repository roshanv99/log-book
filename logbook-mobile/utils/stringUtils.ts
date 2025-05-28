/**
 * Trims a string value, handling null/undefined cases
 * @param value The string value to trim
 * @returns The trimmed string, or empty string if null/undefined
 */
export const trimString = (value: string | null | undefined): string => {
  if (value === null || value === undefined) return '';
  return value.trim();
};

/**
 * Trims all string values in an object
 * @param obj The object containing string values
 * @returns A new object with all string values trimmed
 */
export const trimObjectStrings = <T extends Record<string, any>>(obj: T): T => {
  const result = { ...obj };
  
  Object.keys(result).forEach(key => {
    if (typeof result[key as keyof T] === 'string') {
      (result as any)[key] = trimString(result[key as keyof T]);
    }
  });
  
  return result;
};

/**
 * Formats a number based on the selected currency
 * @param amount - The number to format
 * @param currencyId - The currency ID (1 for INR, 2 for USD, etc.)
 * @returns Formatted number string
 */
export const formatNumber = (amount: number, currencyId: number): string => {
  // Round the number to avoid floating point issues
  const roundedAmount = Math.round(amount);

  // For Indian Rupees (currencyId: 1)
  if (currencyId === 1) {
    const numStr = roundedAmount.toString();
    const lastThree = numStr.substring(numStr.length - 3);
    const otherNumbers = numStr.substring(0, numStr.length - 3);
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + (otherNumbers ? "," : "") + lastThree;
  }

  // For other currencies, use standard formatting with 2 decimal places
  return roundedAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}; 