import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

export async function Footer() {
  const t = await getTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-1">
            <Image
              src="/images/snowflow-logo-inv.svg"
              alt="Snowflow"
              width={130}
              height={52}
              className="h-8 w-auto opacity-90"
            />
            <p className="mt-3 text-sm text-background/60">
              Ski- & Snowboardreisen aus Berlin.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-background/40">
              {t("footer.contact")}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-background/70">
              <li>
                <a
                  href="mailto:info@snowflow.de"
                  className="transition-colors hover:text-background"
                >
                  info@snowflow.de
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-background/40">
              {t("footer.followUs")}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-background/70">
              <li>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-background"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-background"
                >
                  Facebook
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-background/40">
              {t("footer.legal")}
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-background/70">
              <li>
                <Link
                  href="/impressum"
                  className="transition-colors hover:text-background"
                >
                  {t("nav.impressum")}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="transition-colors hover:text-background"
                >
                  {t("nav.privacy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-background/10 pt-8 text-center text-sm text-background/40">
          &copy; {year} Snowflow. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
