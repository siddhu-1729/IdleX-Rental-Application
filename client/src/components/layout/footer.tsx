import Link from "next/link";
import { FOOTER_NAV, SITE_CONFIG } from "@/config/site";

export function Footer() {
  return (
    <footer className="mt-16 bg-foreground text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-white">
                iX
              </div>
              <span className="text-lg font-bold text-white">IdleX</span>
            </div>
            <p className="max-w-sm text-sm text-gray-400">{SITE_CONFIG.description}</p>
            <p className="mt-4 text-xs text-gray-500">
              Copyright 2026 {SITE_CONFIG.name}. All rights reserved.
            </p>
          </div>

          {Object.entries(FOOTER_NAV).map(([title, items]) => (
            <div key={title}>
              <h4 className="mb-3 text-sm font-semibold text-white">{title}</h4>
              <ul className="space-y-2 text-sm">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-gray-400 transition-colors hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
