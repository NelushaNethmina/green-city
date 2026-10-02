// Mock Authentication Service
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "driver";
  profilePic?: string;
}

export function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "; expires=" + date.toUTCString();
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
}

export const authService = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    // Check credentials (admin@greencity.lk / admin123)
    if (email === "admin@greencity.lk" && password === "admin123") {
      const mockToken = "mock-jwt-admin-token-xyz123";
      const mockUser: User = {
        id: "usr_admin_1",
        name: "Council Administrator",
        email: "admin@greencity.lk",
        role: "admin",
        profilePic: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80",
      };

      setCookie("auth_token", mockToken);
      setCookie("user_role", mockUser.role);
      
      // Store user details in localStorage
      localStorage.setItem("user_profile", JSON.stringify(mockUser));

      return { token: mockToken, user: mockUser };
    }

    throw new Error("Invalid administrator email or password.");
  },

  logout: async (): Promise<void> => {
    deleteCookie("auth_token");
    deleteCookie("user_role");
    localStorage.removeItem("user_profile");
  },

  getCurrentUser: async (): Promise<User | null> => {
    const token = getCookie("auth_token");
    if (!token) return null;

    const profileStr = localStorage.getItem("user_profile");
    if (profileStr) {
      try {
        return JSON.parse(profileStr);
      } catch {
        return null;
      }
    }
    return null;
  },
};
