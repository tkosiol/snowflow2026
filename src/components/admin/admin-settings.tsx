"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Admin {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export function AdminSettings({ currentEmail }: { currentEmail: string }) {
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Admin list state
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  // New admin form state
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");
  const [adminError, setAdminError] = useState(false);

  const fetchAdmins = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingAdmins(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage("");
    setPasswordError(false);

    if (newPassword !== confirmPassword) {
      setPasswordMessage("Die Passwörter stimmen nicht überein.");
      setPasswordError(true);
      return;
    }

    if (newPassword.length < 10) {
      setPasswordMessage("Das neue Passwort muss mindestens 10 Zeichen lang sein.");
      setPasswordError(true);
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/admin/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setPasswordMessage("Passwort erfolgreich geändert.");
        setPasswordError(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMessage(data.error || "Fehler beim Ändern des Passworts.");
        setPasswordError(true);
      }
    } catch {
      setPasswordMessage("Fehler beim Ändern des Passworts.");
      setPasswordError(true);
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    setAdminMessage("");
    setAdminError(false);
    setAddingAdmin(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newAdminEmail,
          name: newAdminName,
          password: newAdminPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAdminMessage("Admin erfolgreich erstellt.");
        setAdminError(false);
        setNewAdminEmail("");
        setNewAdminName("");
        setNewAdminPassword("");
        fetchAdmins();
      } else {
        setAdminMessage(data.error || "Fehler beim Erstellen des Admins.");
        setAdminError(true);
      }
    } catch {
      setAdminMessage("Fehler beim Erstellen des Admins.");
      setAdminError(true);
    } finally {
      setAddingAdmin(false);
    }
  }

  async function handleDeleteAdmin(id: string) {
    if (!confirm("Admin wirklich löschen?")) return;

    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchAdmins();
      } else {
        const data = await res.json();
        alert(data.error || "Fehler beim Löschen.");
      }
    } catch {
      alert("Fehler beim Löschen.");
    }
  }

  return (
    <div className="space-y-8">
      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle>Passwort ändern</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Neues Passwort</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Neues Passwort bestätigen</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            {passwordMessage && (
              <p
                className={`text-sm ${
                  passwordError ? "text-red-600" : "text-green-600"
                }`}
              >
                {passwordMessage}
              </p>
            )}
            <Button type="submit" disabled={changingPassword}>
              {changingPassword ? "Wird geändert..." : "Passwort ändern"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Admin Users */}
      <Card>
        <CardHeader>
          <CardTitle>Admin-Benutzer</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAdmins ? (
            <p className="text-sm text-muted-foreground">Laden...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Erstellt am</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.name}</TableCell>
                    <TableCell>
                      {new Date(admin.createdAt).toLocaleDateString("de-DE")}
                    </TableCell>
                    <TableCell>
                      {admin.email !== currentEmail && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteAdmin(admin.id)}
                        >
                          Löschen
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Add new admin form */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-sm font-medium mb-4">Neuen Admin hinzufügen</h3>
            <form onSubmit={handleAddAdmin} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="adminEmail">E-Mail</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminName">Name</Label>
                <Input
                  id="adminName"
                  type="text"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Passwort</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              {adminMessage && (
                <p
                  className={`text-sm ${
                    adminError ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {adminMessage}
                </p>
              )}
              <Button type="submit" disabled={addingAdmin}>
                {addingAdmin ? "Wird erstellt..." : "Admin hinzufügen"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
