import "@/app/globals.css";

export const metadata = {
  title: "Snowflow Admin",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
