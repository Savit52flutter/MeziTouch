import { AdminAuthGate } from "@/components/admin-auth-gate";

import EventAdminClient from "./event-admin-client";

export default async function EventAdminPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return (
    <AdminAuthGate>
      <EventAdminClient eventId={eventId} />
    </AdminAuthGate>
  );
}
