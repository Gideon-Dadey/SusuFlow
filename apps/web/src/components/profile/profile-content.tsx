"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth.store";
import { getInitials } from "@/lib/utils";
import { userApi, tenantApi } from "@/lib/api";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
import { MIN_PASSWORD_LENGTH } from "@susuflow/shared";

export function ProfileContent({ title = "Profile" }: { title?: string }) {
  const { user: authUser } = useAuthStore();

  const { data: user, refetch } = useQuery({
    queryKey: ["user-profile", authUser?.id],
    queryFn: () => userApi.getMe(),
  });

  // Profile Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Company settings & branding states (for company_admin)
  const queryClient = useQueryClient();
  const { data: tenant, refetch: refetchTenant } = useQuery({
    queryKey: ["tenant-settings", authUser?.tenantSlug],
    queryFn: () => tenantApi.getMe(),
    enabled: !!authUser?.roles.includes("company_admin"),
  });

  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const [companyPrimaryColor, setCompanyPrimaryColor] = useState("#1E40AF");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companySuccess, setCompanySuccess] = useState("");
  const [companyError, setCompanyError] = useState("");

  useEffect(() => {
    if (tenant) {
      setCompanyName(tenant.name || "");
      setCompanyLogo(tenant.logoUrl || "");
      setCompanyPrimaryColor(tenant.primaryColor || "#1E40AF");
      setCompanyPhone(tenant.phone || "");
      setCompanyEmail(tenant.email || "");
    }
  }, [tenant]);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setCompanyError("Logo image must be smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string);
        setCompanyError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setProfileError("Avatar image must be smaller than 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const rawResult = reader.result as string;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL("image/png", 0.9);
            setAvatarUrl(compressed);
            setProfileError("");
          } else {
            setAvatarUrl(rawResult);
            setProfileError("");
          }
        };
        img.onerror = () => {
          setAvatarUrl(rawResult);
          setProfileError("");
        };
        img.src = rawResult;
      };
      reader.readAsDataURL(file);
    }
  };

  const updateCompanyMutation = useMutation({
    mutationFn: () =>
      tenantApi.updateMe({
        name: companyName,
        logoUrl: companyLogo ? companyLogo : null,
        primaryColor: companyPrimaryColor,
        phone: companyPhone || undefined,
        email: companyEmail || undefined,
        settings: tenant?.settings || {},
      }),
    onSuccess: () => {
      setCompanySuccess("Company branding settings updated successfully!");
      setCompanyError("");
      refetchTenant();
      queryClient.invalidateQueries({ queryKey: ["tenant-branding"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-settings"] });
    },
    onError: (err: any) => {
      setCompanyError(err?.message || "Failed to update company settings.");
      setCompanySuccess("");
    },
  });

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: () =>
      userApi.updateMe({
        firstName,
        lastName,
        email,
        phone,
        avatarUrl: avatarUrl ? avatarUrl : null,
      }),
    onSuccess: (updatedUser) => {
      setProfileSuccess("Profile updated successfully!");
      setProfileError("");
      useAuthStore.setState((state) => ({
        user: state.user
          ? {
              ...state.user,
              firstName: updatedUser.firstName,
              lastName: updatedUser.lastName,
              email: updatedUser.email,
              avatarUrl: updatedUser.avatarUrl,
            }
          : null,
      }));
      refetch();
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile-me"] });
    },
    onError: (err: any) => {
      setProfileError(err?.message || "Failed to update profile.");
      setProfileSuccess("");
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: () => userApi.updatePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      setPasswordSuccess("Password updated successfully!");
      setPasswordError("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: any) => {
      setPasswordError(err?.message || "Failed to update password.");
      setPasswordSuccess("");
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      setProfileError("First name, last name, and email are required.");
      return;
    }
    updateProfileMutation.mutate();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(
        `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }
    updatePasswordMutation.mutate();
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !companyEmail) {
      setCompanyError("Company display name and support email are required.");
      return;
    }
    updateCompanyMutation.mutate();
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="dashboard-title">{title}</h1>
        <Badge
          variant={user?.status === "active" ? "success" : "warning"}
          className="capitalize"
        >
          Status: {user?.status || "Pending"}
        </Badge>
      </div>

      {/* Header card */}
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-r from-primary-600 to-indigo-700 text-white">
        <CardContent className="flex flex-col sm:flex-row items-center gap-6 p-6">
          <div className="relative group">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/25 text-white border-2 border-white/40 text-3xl font-bold backdrop-blur-md shadow-inner">
              {avatarUrl || user?.avatarUrl ? (
                <img
                  src={avatarUrl || user?.avatarUrl || ""}
                  alt="Profile Avatar"
                  className="size-full object-cover"
                />
              ) : tenant?.logoUrl ? (
                <img
                  src={tenant.logoUrl}
                  alt={tenant.name || "Company Logo"}
                  className="size-full object-cover"
                />
              ) : (
                getInitials(user?.firstName, user?.lastName)
              )}
            </div>
            <button
              type="button"
              onClick={() =>
                document.getElementById("profile-avatar-file-input")?.click()
              }
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center bg-white text-gray-900 shadow-md transition-transform group-hover:scale-110 hover:bg-gray-100"
              title="Upload avatar"
            >
              <FontAwesomeIcon
                icon={faCamera}
                className="h-4 w-4 text-primary"
              />
            </button>
          </div>

          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold tracking-tight">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm text-white/80 mt-1">{user?.email}</p>
            <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
              {authUser?.roles.map((r) => (
                <Badge
                  key={r}
                  className="bg-white/20 hover:bg-white/30 text-white border-none capitalize text-xs px-2.5 py-0.5"
                >
                  {r.replace("_", " ")}
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

              {/* Avatar Uploader Section */}
              <div className="space-y-2 pb-3 border-b border-border/40">
                <label className="block text-sm font-semibold text-foreground">
                  Profile Avatar
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted border border-border text-lg font-bold text-muted-foreground">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar Preview"
                        className="size-full object-cover"
                      />
                    ) : (
                      getInitials(firstName, lastName)
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      id="profile-avatar-file-input"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={handleAvatarFileChange}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 text-xs font-semibold"
                        onClick={() =>
                          document
                            .getElementById("profile-avatar-file-input")
                            ?.click()
                        }
                      >
                        <FontAwesomeIcon
                          icon={faUpload}
                          className="h-3.5 w-3.5 text-primary"
                        />
                        {avatarUrl ? "Change Photo" : "Upload Photo"}
                      </Button>
                      {avatarUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                          onClick={() => setAvatarUrl("")}
                        >
                          <FontAwesomeIcon
                            icon={faTrash}
                            className="h-3.5 w-3.5"
                          />
                          Remove Photo
                        </Button>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      PNG, JPG or WebP up to 5MB. Auto-optimized to 400x400.
                    </span>
                  </div>
                </div>
              </div>

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
                {updateProfileMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
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
                placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
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
                {updatePasswordMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {authUser?.roles.includes("company_admin") && (
          <Card className="shadow-sm md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">
                Company Settings & Branding
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Manage your organization's display name, support contacts, logo,
                and brand color.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCompanySubmit} className="space-y-4">
                {companySuccess && (
                  <div className="flex items-center gap-2 p-3 text-xs bg-green-50 text-green-700 rounded-lg border border-green-200">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>{companySuccess}</span>
                  </div>
                )}
                {companyError && (
                  <div className="flex items-center gap-2 p-3 text-xs bg-red-50 text-red-700 rounded-lg border border-red-200">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{companyError}</span>
                  </div>
                )}

                <Input
                  label="Company Display Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Support Email"
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    placeholder="admin@yourcompany.com"
                    required
                  />
                  <Input
                    label="Support Phone"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    placeholder="+233..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground">
                    Company Logo
                  </label>
                  <div className="flex items-center gap-4">
                    {companyLogo ? (
                      <img
                        src={companyLogo}
                        alt="Logo preview"
                        className="h-16 w-16 rounded-lg object-contain bg-muted border border-border"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground font-semibold border border-border">
                        No Logo
                      </div>
                    )}
                    <div className="flex flex-col gap-1.5">
                      <input
                        type="file"
                        accept="image/*"
                        id="company-logo-file"
                        className="hidden"
                        onChange={handleLogoFileChange}
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document
                              .getElementById("company-logo-file")
                              ?.click()
                          }
                        >
                          Upload Image File
                        </Button>
                        {companyLogo && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => setCompanyLogo("")}
                          >
                            Remove Logo
                          </Button>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        Supported format: PNG, JPG, WebP. Max 2MB.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={companyPrimaryColor}
                      onChange={(e) => setCompanyPrimaryColor(e.target.value)}
                      className="h-10 w-20 cursor-pointer rounded-lg border border-border bg-card"
                    />
                    <Input
                      value={companyPrimaryColor}
                      onChange={(e) => setCompanyPrimaryColor(e.target.value)}
                      placeholder="#1E40AF"
                      className="flex-1 max-w-[150px]"
                      maxLength={7}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full md:w-auto flex items-center justify-center gap-2 font-bold px-6"
                  disabled={updateCompanyMutation.isPending}
                >
                  {updateCompanyMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Save Company Settings
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
