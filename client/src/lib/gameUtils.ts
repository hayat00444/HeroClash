import { NUMBER_COLOR_MAP } from "@shared/schema";

// Format time as MM:SS
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Generate a full stroke dash array for circle timer
export function getStrokeDashArray(radius: number): number {
  return 2 * Math.PI * radius;
}

// Calculate stroke dash offset for timer circle
export function getStrokeDashOffset(radius: number, timeRemaining: number, totalTime: number): number {
  const circumference = getStrokeDashArray(radius);
  return circumference * (1 - timeRemaining / totalTime);
}

// Get bet multiplier based on bet type and value
export function getBetMultiplier(betType: string, betValue: string): number {
  switch (betType) {
    case 'color':
      return betValue === 'violet' ? 4.5 : 2;
    case 'number':
      return 9;
    case 'bigSmall':
      return 2;
    default:
      return 1;
  }
}

// Format currency
export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

// Get color for a number
export function getNumberColor(number: number): string {
  return NUMBER_COLOR_MAP[number];
}

// Check if a number is big (5-9) or small (0-4)
export function getBigSmall(number: number): string {
  return number >= 5 ? 'big' : 'small';
}

// Generate a unique period ID
export function generatePeriod(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hour}${minute}${second}`;
}
