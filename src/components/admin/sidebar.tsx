"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/trips", label: "Reisen" },
  { href: "/admin/pages", label: "Seiten" },
  { href: "/admin/gallery", label: "Galerie" },
  { href: "/admin/inquiries", label: "Anfragen" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 p-6">
      <div className="mb-8">
        <Link href="/admin" className="text-xl font-bold">
          Snowflow Admin
        </Link>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive(item.href)
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-8 pt-8 border-t border-gray-200">
        <Link
          href="/"
          className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          &larr; Zur Website
        </Link>
      </div>
    </aside>
  );
}
