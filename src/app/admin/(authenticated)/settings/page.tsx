import { auth } from "@/lib/auth";
import { AdminSettings } from "@/components/admin/admin-settings";

export default async function AdminSettingsPage() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Einstellungen</h1>
      <AdminSettings currentEmail={session?.user?.email ?? ""} />
    </div>
  );
}
