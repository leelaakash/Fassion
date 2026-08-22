"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "admin" | "user";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  tier: string;
}

export const DEMO_CREDENTIALS = {
  admin: {
    email: "admin@luminacouture.ai",
    password: "admin123",
    name: "Elena Vance",
    role: "admin" as UserRole,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    tier: "Haute Director",
  },
  user: {
    email: "vip@luminacouture.ai",
    password: "user123",
    name: "Camille Laurent",
    role: "user" as UserRole,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    tier: "VIP Stylist Client",
  },
};

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  fillDemo: (role: UserRole) => { email: string; pass: string };
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isAdmin: false,
  isAuthenticated: false,
  login: () => ({ success: false }),
  logout: () => {},
  fillDemo: () => ({ email: "", pass: "" }),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("lumina_user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Default to VIP User session for instant out-of-the-box convenience
        const defaultUser: AuthUser = {
          id: "usr_vip_001",
          name: DEMO_CREDENTIALS.user.name,
          email: DEMO_CREDENTIALS.user.email,
          role: "user",
          avatar: DEMO_CREDENTIALS.user.avatar,
          tier: DEMO_CREDENTIALS.user.tier,
        };
        setUser(defaultUser);
        localStorage.setItem("lumina_user", JSON.stringify(defaultUser));
      }
    } catch {
      // Ignore storage errors in SSR
    }
  }, []);

  const login = (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (
      cleanEmail === DEMO_CREDENTIALS.admin.email.toLowerCase() &&
      cleanPass === DEMO_CREDENTIALS.admin.password
    ) {
      const adminUser: AuthUser = {
        id: "adm_001",
        name: DEMO_CREDENTIALS.admin.name,
        email: DEMO_CREDENTIALS.admin.email,
        role: "admin",
        avatar: DEMO_CREDENTIALS.admin.avatar,
        tier: DEMO_CREDENTIALS.admin.tier,
      };
      setUser(adminUser);
      localStorage.setItem("lumina_user", JSON.stringify(adminUser));
      return { success: true };
    }

    if (
      (cleanEmail === DEMO_CREDENTIALS.user.email.toLowerCase() || cleanEmail === "user@luminacouture.ai") &&
      cleanPass === DEMO_CREDENTIALS.user.password
    ) {
      const vipUser: AuthUser = {
        id: "usr_vip_001",
        name: DEMO_CREDENTIALS.user.name,
        email: DEMO_CREDENTIALS.user.email,
        role: "user",
        avatar: DEMO_CREDENTIALS.user.avatar,
        tier: DEMO_CREDENTIALS.user.tier,
      };
      setUser(vipUser);
      localStorage.setItem("lumina_user", JSON.stringify(vipUser));
      return { success: true };
    }

    return {
      success: false,
      error: "Invalid email or password. Use demo credentials or click 1-Click Demo Fill.",
    };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("lumina_user");
  };

  const fillDemo = (role: UserRole) => {
    const creds = DEMO_CREDENTIALS[role];
    return { email: creds.email, pass: creds.password };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAdmin: user?.role === "admin",
        isAuthenticated: !!user,
        login,
        logout,
        fillDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
