"use client"

import { useState } from "react"
import { User, Building2, Shield, CreditCard, Database, FileText, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type Tab = "profile" | "organization" | "security" | "billing" | "data" | "disclaimer"

const tabs: { key: Tab; label: string; icon: typeof User }[] = [
  { key: "profile", label: "Profile", icon: User },
  { key: "organization", label: "Organization", icon: Building2 },
  { key: "security", label: "Security", icon: Shield },
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "data", label: "Data Retention", icon: Database },
  { key: "disclaimer", label: "Disclaimers", icon: FileText },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile")
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-7">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage your account, security, and preferences.
          </p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-48 shrink-0">
            <nav className="rounded-lg border border-border bg-card overflow-hidden py-2">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                    activeTab === key
                      ? "bg-primary/8 text-primary font-medium"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="rounded-lg border border-border bg-card p-6">
              {activeTab === "profile" && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Profile</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Your personal account information.</p>
                  </div>
                  <Separator />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Full name</Label>
                      <Input defaultValue="Jane Doe" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Email address</Label>
                      <Input defaultValue="jane.doe@example.com" type="email" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Account type</Label>
                      <Input defaultValue="Consumer" disabled />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Phone (optional)</Label>
                      <Input placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                    {saved ? "Saved!" : "Save Changes"}
                  </Button>
                </div>
              )}

              {activeTab === "organization" && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Organization</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Business or practice information.</p>
                  </div>
                  <Separator />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-medium">Organization name</Label>
                      <Input placeholder="Doe Credit Consulting" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Business type</Label>
                      <Input placeholder="Credit Consulting Firm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">State</Label>
                      <Input placeholder="California" />
                    </div>
                  </div>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                    {saved ? "Saved!" : "Save Changes"}
                  </Button>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Security</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Password and two-factor authentication settings.</p>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Current password</Label>
                      <Input type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">New password</Label>
                      <Input type="password" placeholder="Min. 8 characters" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Confirm new password</Label>
                      <Input type="password" placeholder="Repeat new password" />
                    </div>
                    <Button size="sm" onClick={handleSave}>
                      {saved ? "Password Updated!" : "Update Password"}
                    </Button>
                  </div>
                  <Separator />
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Two-factor authentication</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Add an extra layer of security to your account.</p>
                      </div>
                      <Button size="sm" variant="outline">Enable 2FA</Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "billing" && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Billing</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Payment methods and invoices.</p>
                  </div>
                  <Separator />
                  <div className="rounded-md border border-border p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Visa ending in 4242</p>
                        <p className="text-xs text-muted-foreground">Expires 09/2028</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Replace</Button>
                  </div>
                  <Button size="sm" variant="outline">View Invoice History</Button>
                </div>
              )}

              {activeTab === "data" && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Data Retention</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Control how long your data is stored.</p>
                  </div>
                  <Separator />
                  {[
                    { label: "Bureau report files", value: "90 days after case closure" },
                    { label: "Generated documents", value: "2 years" },
                    { label: "Correspondence logs", value: "3 years" },
                    { label: "Account data", value: "Until account deletion" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between rounded-md border border-border px-4 py-3">
                      <p className="text-sm text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{value}</p>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive">
                    Request Account Deletion
                  </Button>
                </div>
              )}

              {activeTab === "disclaimer" && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Disclaimer Preferences</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Control how disclaimer language appears across generated documents.
                    </p>
                  </div>
                  <Separator />
                  {[
                    { label: "Show disclaimer on MY LEGAL REPORT™ cover page", enabled: true },
                    { label: "Include disclaimer footer on all dispute letters", enabled: true },
                    { label: "Show disclaimer on agency filing packets", enabled: true },
                    { label: "Display disclaimer reminder on case open", enabled: false },
                  ].map(({ label, enabled }, i) => (
                    <div key={i} className="flex items-center justify-between rounded-md border border-border px-4 py-3">
                      <p className="text-sm text-foreground">{label}</p>
                      <div
                        className={cn(
                          "flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer",
                          enabled ? "bg-accent justify-end" : "bg-border justify-start"
                        )}
                      >
                        <div className="mx-0.5 h-4 w-4 rounded-full bg-white shadow-sm" />
                      </div>
                    </div>
                  ))}
                  <div className="rounded-md bg-secondary/60 px-4 py-3">
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Note: Disabling disclaimers does not change the educational nature of this platform.
                      TurnKey Credit is not a law firm and does not provide legal advice.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
