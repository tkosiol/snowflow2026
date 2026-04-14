"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/admin/auth/reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } finally {
      setSubmitted(true);
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>E-Mail gesendet</CardTitle>
            <CardDescription>
              Falls ein Admin-Account mit dieser E-Mail existiert, wurde eine Nachricht mit einem Reset-Link verschickt. Der Link ist 1 Stunde gültig.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/login"
              className="text-sm text-muted-foreground underline hover:text-foreground"
            >
              Zurück zum Login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Passwort vergessen</CardTitle>
          <CardDescription>
            Gib deine Admin-E-Mail-Adresse ein. Wir schicken dir einen Link zum Zurücksetzen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Wird gesendet..." : "Reset-Link anfordern"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link href="/admin/login" className="underline hover:text-foreground">
                Zurück zum Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
