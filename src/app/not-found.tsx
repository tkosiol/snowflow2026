import Link from "next/link";
import { Mountain, Snowflake } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="relative">
        <Snowflake className="absolute -top-8 -left-6 size-5 text-primary/30 animate-pulse" />
        <Snowflake className="absolute -top-4 right-0 size-3 text-primary/20 animate-pulse delay-300" />
        <Mountain className="mx-auto size-16 text-primary/60" />
      </div>

      <h1 className="mt-8 text-7xl font-bold tracking-tighter text-primary">
        404
      </h1>

      <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
        Falsche Abfahrt genommen
      </p>

      <p className="mt-2 max-w-md text-muted-foreground">
        Diese Piste gibt es leider nicht. Vielleicht hat der Schnee sie
        verschluckt&nbsp;&mdash; oder sie war nie da.
      </p>

      <div className="mt-10">
        <Button size="lg" render={<Link href="/" />}>
          Zur Startseite
        </Button>
      </div>

      <p className="mt-16 text-xs text-muted-foreground/60">
        Snowflow &middot; Ski- &amp; Snowboardreisen aus Berlin seit 2000
      </p>
    </div>
  );
}
