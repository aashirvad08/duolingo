"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, User, ShoppingBag, Palette } from "lucide-react";
import { MascotDuo } from "../ui/Icons";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

const navItems: NavItem[] = [
  { name: "Learn", href: "/learn", icon: Home },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Shop", href: "/shop", icon: ShoppingBag },
  { name: "Design System", href: "/design-system", icon: Palette },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar (visible on screens >= 1024px) */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-[256px] border-r-2 border-swan bg-white dark:bg-slate-800 p-6 z-30 transition-colors duration-300">
        {/* Logo / Mascot Brand */}
        <Link href="/learn" className="flex items-center gap-3 mb-8 select-none">
          <MascotDuo size={48} mood="happy" />
          <span className="text-2xl font-black text-feather-green tracking-wide">
            duolingo
          </span>
        </Link>

        {/* Navigation list */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-extrabold uppercase text-sm tracking-wider transition-all duration-100 ${
                  isActive
                    ? "bg-polar dark:bg-slate-700 text-macaw border-2 border-macaw/20"
                    : "text-wolf hover:bg-polar dark:hover:bg-slate-700 hover:text-eel dark:hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-macaw" : "text-wolf"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation (visible on screens < 1024px) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-t-2 border-swan flex justify-around items-center px-4 z-30 transition-colors duration-300">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-extrabold uppercase tracking-widest transition-all ${
                isActive
                  ? "text-macaw"
                  : "text-wolf hover:text-eel dark:hover:text-white"
              }`}
            >
              <Icon className={`w-6 h-6 mb-0.5 ${isActive ? "text-macaw" : "text-wolf"}`} />
              <span className="truncate max-w-[70px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};
