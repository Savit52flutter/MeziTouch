import {
  createAuthServerClient,
  getAuthenticatedAdmin,
  isAdminUser,
} from "./supabase/auth-server";

export async function isAdminAuthenticated(request?: Request): Promise<boolean> {
  const admin = await getAuthenticatedAdmin(request);
  return admin !== null;
}

export async function requireAdminAuth(): Promise<boolean> {
  return isAdminAuthenticated();
}

export { isAdminUser, getAuthenticatedAdmin };
