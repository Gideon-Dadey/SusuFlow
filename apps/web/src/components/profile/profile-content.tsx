'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth.store';
import { getInitials } from '@/lib/utils';
import { userApi } from '@/lib/api';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export function ProfileContent() {
  const { user: authUser } = useAuthStore();

  const { data: user, refetch } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => userApi.getMe(),
  });

  // Profile Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: () => userApi.updateMe({ firstName, lastName, email, phone }),
    onSuccess: (updatedUser) => {
      setProfileSuccess('Profile updated successfully!');
      setProfileError('');
      // Update state in Zustand store
      useAuthStore.setState((state) => ({
        user: state.user
          ? {
              ...state.user,
              firstName: updatedUser.firstName,
              lastName: updatedUser.lastName,
              email: updatedUser.email,
            }
          : null,
      }));
      refetch();
    },
    onError: (err: any) => {
      setProfileError(err?.message || 'Failed to update profile.');
      setProfileSuccess('');
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: () => userApi.updatePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      setPasswordSuccess('Password updated successfully!');
      setPasswordError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err: any) => {
      setPasswordError(err?.message || 'Failed to update password.');
      setPasswordSuccess('');
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      setProfileError('First name, last name, and email are required.');
      return;
    }
    updateProfileMutation.mutate();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required.');
      return;
    }
    if (newPassword.length < 10) {
      setPasswordError('New password must be at least 10 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }
    updatePasswordMutation.mutate();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="dashboard-title">Profile</h1>
        <Badge variant={user?.status === 'active' ? 'success' : 'warning'} className="capitalize">
          Status: {user?.status || 'Pending'}
        </Badge>
      </div>

      {/* Header card */}
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-r from-primary-600 to-indigo-700 text-white">
        <CardContent className="flex items-center gap-6 p-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/25 text-white border-2 border-white/40 text-2xl font-bold backdrop-blur-md">
            {getInitials(user?.firstName, user?.lastName)}
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm text-white/80 mt-1">{user?.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {authUser?.roles.map((r) => (
                <Badge key={r} className="bg-white/20 hover:bg-white/30 text-white border-none capitalize text-xs">
                  {r.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Personal Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {profileSuccess && (
                <div className="flex items-center gap-2 p-3 text-xs bg-green-50 text-green-700 rounded-lg border border-green-200">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}
              {profileError && (
                <div className="flex items-center gap-2 p-3 text-xs bg-red-50 text-red-700 rounded-lg border border-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <Input
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
                required
              />

              <Input
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
                required
              />

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
              />

              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
              />

              <Button
                type="submit"
                className="w-full flex items-center justify-center gap-2"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Security & Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordSuccess && (
                <div className="flex items-center gap-2 p-3 text-xs bg-green-50 text-green-700 rounded-lg border border-green-200">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}
              {passwordError && (
                <div className="flex items-center gap-2 p-3 text-xs bg-red-50 text-red-700 rounded-lg border border-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />

              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 10 characters"
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
              />

              <Button
                type="submit"
                className="w-full flex items-center justify-center gap-2"
                disabled={updatePasswordMutation.isPending}
              >
                {updatePasswordMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
