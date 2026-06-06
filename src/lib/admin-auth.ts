import {
  createAuthServerClient,
  getAuthenticatedAdmin,
  isAdminUser,
} from "./supabase/auth-server";

export async function isAdminAuthenticated(): Promise<boolean> {
  const admin = await getAuthenticatedAdmin();
  return admin !== null;
}

export async function requireAdminAuth(): Promise<boolean> {
  return isAdminAuthenticated();
}

export { isAdminUser, getAuthenticatedAdmin };
