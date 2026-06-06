import { AdminAuthGate } from "@/components/admin-auth-gate";

import PresentClient from "./present-client";

export default async function PresentPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return (
    <AdminAuthGate centerLogin>
      <PresentClient code={code} />
    </AdminAuthGate>
  );
}
