"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "首页" },
  { href: "/jobs", label: "校招信息表" },
  { href: "/civil", label: "事业编国企表" },
  { href: "/materials", label: "面试资料" },
  { href: "/workspace", label: "工作台" },
  { href: "/me", label: "个人中心" },
];

export default function CSiteNav() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold text-slate-800">
          OfferAI
        </Link>
        <nav className="flex items-center gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm ${
                pathname === href || (href !== "/" && pathname?.startsWith(href))
                  ? "font-medium text-primary"
                  : "text-slate-600 hover:text-primary"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
