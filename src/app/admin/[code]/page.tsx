import { AdminAuthGate } from "@/components/admin-auth-gate";

import AdminClient from "./admin-client";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return (
    <AdminAuthGate>
      <AdminClient code={code} />
    </AdminAuthGate>
  );
}
