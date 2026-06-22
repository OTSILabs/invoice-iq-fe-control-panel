import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { getSession } from "./auth-store"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join('')
    )

    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}

export function getDecodedToken(): any {
  try {
    const session = getSession()
    if (session) {
      const actualToken = session.access_token || session.token
      if (actualToken) return decodeJWT(actualToken)
    }
  } catch (e) {
    console.error(e)
  }
  return null
}

export function formatRole(role?: string | string[]): string {
  if (!role) return "User"
  const roleStr = Array.isArray(role) ? role[0] : role
  if (!roleStr) return "User"
  return roleStr
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

export function getInitials(name: string): string {
  if (!name) return ""
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatDate(dateStr?: string | number): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    const day = String(d.getDate()).padStart(2, '0');
    const allMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = allMonths[d.getMonth()];
    const year = d.getFullYear();
    
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hourStr = String(hours).padStart(2, '0');
    
    return `${day} ${month} ${year}, ${hourStr}:${minutes} ${ampm}`;
  } catch {
    return "N/A";
  }
}

export function humanizeDateTime(
  date: string | number | Date | null | undefined,
  dateFormat = "dd MMM yy, h:mm a",
): string | null {
  if (!date) return null;
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return format(d, dateFormat);
  } catch {
    return null;
  }
}
