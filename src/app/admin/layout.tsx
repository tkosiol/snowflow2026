import "@/app/globals.css";
import { AdminSidebar } from "@/components/admin/sidebar";

export const metadata = {
  title: "Snowflow Admin",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-gray-50">{children}</main>
    </div>
  );
}
