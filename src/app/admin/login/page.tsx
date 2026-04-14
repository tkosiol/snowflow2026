"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
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

const RATE_LIMIT_THRESHOLD = 5;
const RATE_LIMIT_SECONDS = 60;

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);

  useEffect(() => {
    if (rateLimitSeconds <= 0) return;
    const timer = setInterval(() => {
      setRateLimitSeconds((s) => {
        if (s <= 1) {
          clearInterval(timer);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [rateLimitSeconds]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rateLimitSeconds > 0) return;
    setError("");
    setLoading(true);

    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: "/admin",
      });
    } catch {
      const next = failedAttempts + 1;
      setFailedAttempts(next);
      if (next >= RATE_LIMIT_THRESHOLD) {
        setRateLimitSeconds(RATE_LIMIT_SECONDS);
        setFailedAttempts(0);
      } else {
        setError("Ungültige Anmeldedaten");
      }
      setLoading(false);
    }
  }

  const isBlocked = rateLimitSeconds > 0;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>
            Melden Sie sich an, um das Admin-Panel zu nutzen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {isBlocked && (
              <p className="text-sm text-amber-600">
                Zu viele Versuche. Bitte warte noch {rateLimitSeconds} Sekunden.
              </p>
            )}
            {!isBlocked && error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading || isBlocked}
            >
              {loading ? "Anmelden..." : "Anmelden"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link
                href="/admin/forgot-password"
                className="underline hover:text-foreground"
              >
                Passwort vergessen?
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
