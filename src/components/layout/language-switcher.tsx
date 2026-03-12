"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={locale === "de" ? "default" : "ghost"}
        size="xs"
        onClick={() => switchLocale("de")}
      >
        DE
      </Button>
      <Button
        variant={locale === "en" ? "default" : "ghost"}
        size="xs"
        onClick={() => switchLocale("en")}
      >
        EN
      </Button>
    </div>
  );
}
