import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as CryptoJS from 'crypto-js';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrentDate(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based, so add 1
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatDate(dateString?: string, timeDelta?: number): string | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (timeDelta) date.setMilliseconds(date.getMilliseconds() + timeDelta); // Adjust for the time delta
  return `${date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true})} ${date.getDate()}-${date.getMonth() + 1}-${String(date.getFullYear())}`;
}

export function formatDateWithOffset(dateString: string, offsetInSeconds: number, timeDelta?: number): string {
  const date = new Date(dateString);
  if (timeDelta) date.setMilliseconds(date.getMilliseconds() + timeDelta); // Adjust for the time delta
  date.setSeconds(date.getSeconds() - offsetInSeconds);
  return `${date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true})}`;
}

// export function stringToColor(str: string): string {
//   let hash = 0;
//   for (let i = 0; i < str.length; i++) {
//     hash = str.charCodeAt(i) + ((hash << 5) - hash); // This produces a unique hash
//   }
//   const r = (hash >> 16) & 0xff; // Extract the red channel
//   const g = (hash >> 8) & 0xff;  // Extract the green channel
//   const b = hash & 0xff;         // Extract the blue channel
//   return `rgb(${r}, ${g}, ${b})`;
// }

export function stringToColor(str: string): string {
  // Hash the string using SHA-256
  const hash = CryptoJS.SHA256(str).toString(CryptoJS.enc.Hex);

  // Take the first 6 characters from the hash and convert them into RGB
  const r = parseInt(hash.slice(0, 2), 16); // Red channel (first 2 hex digits)
  const g = parseInt(hash.slice(2, 4), 16); // Green channel (next 2 hex digits)
  const b = parseInt(hash.slice(4, 6), 16); // Blue channel (next 2 hex digits)

  // Return the color in RGB format
  return `rgb(${r}, ${g}, ${b})`;
}

export function base64UrlEncode(input: string): string {
    // Encode to Base64 using btoa
    const base64 = btoa(input);
    // Make it URL-safe by replacing characters and removing padding
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function base64UrlDecode(input: string): string {
    // Reverse URL-safe transformations
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding to ensure Base64 decoding works correctly
    const padding = '='.repeat((4 - base64.length % 4) % 4);
    const base64WithPadding = base64 + padding;
    // Decode the Base64 string using atob
    return atob(base64WithPadding);
}