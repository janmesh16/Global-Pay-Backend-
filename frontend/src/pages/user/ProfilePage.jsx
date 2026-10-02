import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUiStore } from '@/store/ui.store';
import { useFcm } from '@/hooks/useFcm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SUPPORTED_COUNTRIES } from '@/lib/constants';
import { User, Bell, Sun, Moon, LogOut, ShieldCheck, Check } from 'lucide-react';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useUiStore();
  const { permission, enableNotifications } = useFcm();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [country, setCountry] = useState(user?.country || 'US');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      updateUser({ name, phone, country });
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Account & Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your personal details, push notifications, and visual settings.
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Profile</CardTitle>
          <CardDescription>Update your contact details and home country.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={user?.email || ''}
              disabled
              helperText="Email address cannot be changed."
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                {SUPPORTED_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </Select>

              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0199"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preferences & Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>App Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Push Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-brand-500" />
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Web Push Notifications</p>
                <p className="text-xs text-slate-500">
                  {permission === 'granted' ? 'Push notifications enabled.' : 'Enable push alerts for live transfer updates.'}
                </p>
              </div>
            </div>

            {permission === 'granted' ? (
              <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                <Check className="w-4 h-4" /> Enabled
              </span>
            ) : (
              <Button variant="outline" size="sm" onClick={enableNotifications}>
                Enable Push
              </Button>
            )}
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-slate-600" />}
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Appearance Mode</p>
                <p className="text-xs text-slate-500">Current mode: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={toggleTheme}>
              Switch Theme
            </Button>
          </div>

          {/* Logout Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="danger" className="w-full justify-center" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" /> Log Out of Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
