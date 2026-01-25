'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { API_BASE_URL } from '@/lib/api-config';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Bell, Lock, Globe } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your admin account and preferences</p>
        </div>

        {/* Admin Profile */}
        <Card className="p-6 bg-secondary/50 border-border/50">
          <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Admin Account
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs">First Name</Label>
                <p className="text-foreground font-medium mt-1">{user?.first_name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Last Name</Label>
                <p className="text-foreground font-medium mt-1">{user?.last_name}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs">Telegram ID</Label>
                <p className="text-foreground font-medium mt-1">{user?.telegram_id}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Phone Number</Label>
                <p className="text-foreground font-medium mt-1">{user?.phone_number}</p>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Role</Label>
              <div className="mt-1">
                <Badge className="bg-primary/20 text-primary">{user?.role}</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6 bg-secondary/50 border-border/50">
          <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium text-foreground">Pending Transactions</p>
                <p className="text-xs text-muted-foreground">Get notified when new transactions await approval</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded border-border"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium text-foreground">User Registration</p>
                <p className="text-xs text-muted-foreground">Get notified when new users register</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded border-border"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium text-foreground">System Alerts</p>
                <p className="text-xs text-muted-foreground">Get notified about system issues</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded border-border"
              />
            </div>
          </div>
          <Button
            onClick={handleSave}
            className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Save Notification Settings
          </Button>
        </Card>

        {/* API Settings */}
        <Card className="p-6 bg-secondary/50 border-border/50">
          <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            API Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-foreground">API Endpoint</Label>
              <Input
                type="text"
                defaultValue={`${API_BASE_URL}/api/v1`}
                disabled
                className="mt-2 bg-secondary border-border/50"
              />
            </div>
            <div>
              <Label className="text-sm text-foreground">Current Token Status</Label>
              <div className="mt-2 flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">Valid Token</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6 bg-secondary/50 border-border/50">
          <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Security
          </h2>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-400">Session Active</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your admin session is active. Keep your credentials secure.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full border-destructive/20 text-destructive hover:text-destructive bg-transparent"
            >
              Change Password
            </Button>
          </div>
        </Card>

        {/* Success Message */}
        {saved && (
          <div className="fixed bottom-8 right-8 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-sm text-green-400">Settings saved successfully</span>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
