"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { Button, Card, Input, Label } from "@/components/ui";

function AdminLoginLayout({
  centered,
  children,
}: {
  centered: boolean;
  children: ReactNode;
}) {
  if (!centered) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mezi-cream px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

type AdminAuthContextValue = {
  authenticated: boolean | null;
  setAuthenticated: (value: boolean) => void;
  refreshStatus: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/status", {
        credentials: "include",
      });
      const data = await response.json();
      setAuthenticated(Boolean(data.authenticated));
    } catch {
      setAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  return (
    <AdminAuthContext.Provider
      value={{ authenticated, setAuthenticated, refreshStatus }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

function useAdminAuthState() {
  const context = useAdminAuth();
  const [localAuthenticated, setLocalAuthenticated] = useState<boolean | null>(null);
  const [localChecked, setLocalChecked] = useState(false);

  const checkLocalStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/status", {
        credentials: "include",
      });
      const data = await response.json();
      setLocalAuthenticated(Boolean(data.authenticated));
    } catch {
      setLocalAuthenticated(false);
    } finally {
      setLocalChecked(true);
    }
  }, []);

  useEffect(() => {
    if (!context) {
      void checkLocalStatus();
    }
  }, [context, checkLocalStatus]);

  if (context) {
    return {
      authenticated: context.authenticated,
      setAuthenticated: context.setAuthenticated,
      refreshStatus: context.refreshStatus,
    };
  }

  return {
    authenticated: localChecked ? localAuthenticated : null,
    setAuthenticated: setLocalAuthenticated,
    refreshStatus: checkLocalStatus,
  };
}

export function AdminAuthGate({
  children,
  centerLogin = false,
}: {
  children: ReactNode;
  centerLogin?: boolean;
}) {
  const { authenticated, setAuthenticated } = useAdminAuthState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function login() {
    if (!email.trim() || !password) {
      setError("Enter your admin email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Login failed");
      }

      setPassword("");
      setAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  if (authenticated === null) {
    return (
      <AdminLoginLayout centered={centerLogin}>
        <p className="text-center text-mezi-muted">Checking admin access...</p>
      </AdminLoginLayout>
    );
  }

  if (!authenticated) {
    return (
      <AdminLoginLayout centered={centerLogin}>
        <Card className={centerLogin ? "" : "mx-auto max-w-md"}>
          <h2 className="text-xl font-semibold text-mezi-primary">Admin login</h2>
          <p className="mt-2 text-sm text-mezi-muted">
            Sign in with your Supabase admin account to manage sessions and view
            confidential referrals.
          </p>
          <div className="mt-4">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@mezitouch.co.za"
              autoComplete="username"
            />
          </div>
          <div className="mt-4">
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>
          <Button className="mt-4 w-full" onClick={login} disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          {error ? <p className="mt-4 text-red-500">{error}</p> : null}
        </Card>
      </AdminLoginLayout>
    );
  }

  return <>{children}</>;
}
