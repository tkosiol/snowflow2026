"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const navLinks = [
  { href: "/", key: "home" },
  { href: "/trips", key: "trips" },
  { href: "/booking", key: "booking" },
  { href: "/about", key: "about" },
] as const;

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/snowflow-logo-inv.svg"
            alt="Snowflow"
            width={130}
            height={52}
            className="h-8 w-auto"
            style={{ filter: "brightness(0) saturate(100%) invert(21%) sepia(57%) saturate(1800%) hue-rotate(210deg) brightness(85%)" }}
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        {/* Desktop Language Switcher */}
        <div className="hidden items-center gap-4 md:flex">
          <LanguageSwitcher />
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon">
                  <MenuIcon className="size-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              }
            />
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <Image
                    src="/images/snowflow-logo-inv.svg"
                    alt="Snowflow"
                    width={110}
                    height={44}
                    className="h-7 w-auto"
                    style={{ filter: "brightness(0) saturate(100%) invert(21%) sepia(57%) saturate(1800%) hue-rotate(210deg) brightness(85%)" }}
                  />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {navLinks.map((link) => (
                  <SheetClose
                    key={link.key}
                    render={
                      <Link
                        href={link.href}
                        className={cn(
                          "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          pathname === link.href
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {t(link.key)}
                      </Link>
                    }
                  />
                ))}
              </nav>
              <div className="mt-6 px-7">
                <LanguageSwitcher />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
