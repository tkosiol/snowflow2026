import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });

  const page = await prisma.page.findUnique({
    where: { slug: "privacy" },
    include: {
      translations: { where: { locale } },
    },
  });

  const translation = page?.translations[0];

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">
        {translation?.title || t("privacy")}
      </h1>
      {translation?.content ? (
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: translation.content }}
        />
      ) : (
        <p className="text-muted-foreground">
          {locale === "de"
            ? "Inhalt wird bald hinzugefügt."
            : "Content coming soon."}
        </p>
      )}
    </div>
  );
}
