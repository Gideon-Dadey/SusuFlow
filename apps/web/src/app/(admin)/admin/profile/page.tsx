"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { userApi, authApi, adminApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { getInitials } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faLock,
  faGear,
  faShieldHalved,
  faSpinner,
  faCircleCheck,
  faCircleExclamation,
  faEye,
  faEyeSlash,
  faCheck,
  faXmark,
  faUpload,
  faTrash,
  faCamera,
} from "@fortawesome/free-solid-svg-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { MIN_PASSWORD_LENGTH } from "@susuflow/shared";

export default function AdminProfilePage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "system">(
    "profile",
  );
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // 1. User Profile Queries & States
  const {
    data: userProfile,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: () => userApi.getMe(),
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || "");
      setLastName(userProfile.lastName || "");
      setProfileEmail(userProfile.email || "");
      setProfilePhone(userProfile.phone || "");
      if (userProfile.avatarUrl) setAvatarUrl(userProfile.avatarUrl);
    }
  }, [userProfile]);

  // MFA States & Handlers
  const [showMfaBox, setShowMfaBox] = useState(false);
  const [mfaBoxMode, setMfaBoxMode] = useState<"enable" | "disable">("enable");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaDisablePassword, setMfaDisablePassword] = useState("");
  const [isMfaLoading, setIsMfaLoading] = useState(false);

  const handleStartMfaSetup = async () => {
    setIsMfaLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const res = await authApi.mfaSetup();
      setShowMfaBox(true);
      setMfaBoxMode("enable");
      setMfaCode("");
      setSuccessMessage(
        res.message || "MFA code sent to your email. Enter code to enable.",
      );
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to initiate MFA setup.");
    } finally {
      setIsMfaLoading(false);
    }
  };

  const handleEnableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaCode || mfaCode.length < 4) {
      setErrorMessage("Please enter the 6-digit code sent to your email.");
      return;
    }
    setIsMfaLoading(true);
    setErrorMessage("");
    try {
      const res = await authApi.mfaEnable(mfaCode);
      setSuccessMessage(res.message);
      setShowMfaBox(false);
      setMfaCode("");
      refetchProfile();
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to enable MFA. Check code.");
    } finally {
      setIsMfaLoading(false);
    }
  };

  const handleStartMfaDisable = async () => {
    setIsMfaLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await authApi.mfaSetup();
      setShowMfaBox(true);
      setMfaBoxMode("disable");
      setMfaCode("");
      setMfaDisablePassword("");
      setSuccessMessage("Security verification code sent to your email.");
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Failed to initiate MFA disable request.",
      );
    } finally {
      setIsMfaLoading(false);
    }
  };

  const handleDisableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaDisablePassword || !mfaCode) {
      setErrorMessage(
        "Password and verification code are required to disable MFA.",
      );
      return;
    }
    setIsMfaLoading(true);
    setErrorMessage("");
    try {
      const res = await authApi.mfaDisable(mfaDisablePassword, mfaCode);
      setSuccessMessage(res.message);
      setShowMfaBox(false);
      setMfaCode("");
      setMfaDisablePassword("");
      refetchProfile();
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Failed to disable MFA. Check password & code.",
      );
    } finally {
      setIsMfaLoading(false);
    }
  };

  // 2. Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // 3. System Config States
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [globalRateLimit, setGlobalRateLimit] = useState<number>(100);
  const [backupSchedule, setBackupSchedule] = useState<string>("daily");
  const [systemEmail, setSystemEmail] = useState<string>("system@susuflow.com");

  const { data: adminSettings } = useQuery({
    queryKey: ["admin-global-settings"],
    queryFn: () => adminApi.getSettings(),
  });

  useEffect(() => {
    if (adminSettings) {
      setMaintenanceMode(adminSettings.maintenanceMode ?? false);
      setGlobalRateLimit(adminSettings.globalRateLimit ?? 100);
      setBackupSchedule(adminSettings.backupSchedule ?? "daily");
      setSystemEmail(adminSettings.systemEmail ?? "system@susuflow.com");
    }
  }, [adminSettings]);

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      avatarUrl?: string | null;
    }) => userApi.updateMe(data),
    onSuccess: () => {
      setSuccessMessage("Account profile updated successfully.");
      setErrorMessage("");
      refetchProfile();
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (err: any) => {
      setErrorMessage(err?.message || "Failed to update account profile.");
      setSuccessMessage("");
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: { oldPassword: string; newPassword: string }) =>
      userApi.updatePassword(data),
    onSuccess: () => {
      setSuccessMessage("Security password updated successfully.");
      setErrorMessage("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: any) => {
      setErrorMessage(err?.message || "Failed to change password.");
      setSuccessMessage("");
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateSettings(data),
    onSuccess: () => {
      setSuccessMessage("System configuration settings saved successfully.");
      setErrorMessage("");
      queryClient.invalidateQueries({ queryKey: ["admin-global-settings"] });
    },
    onError: (err: any) => {
      setErrorMessage(err?.message || "Failed to save system settings.");
      setSuccessMessage("");
    },
  });

  // Photo Upload Handler
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Avatar image must be smaller than 5 MB.");
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
            setAvatarUrl(canvas.toDataURL("image/png", 0.9));
          } else {
            setAvatarUrl(rawResult);
          }
          setErrorMessage("");
        };
        img.src = rawResult;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTabChange = (tab: "profile" | "security" | "system") => {
    setActiveTab(tab);
    setSuccessMessage("");
    setErrorMessage("");
    setShowMfaBox(false);
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    updateProfileMutation.mutate({
      firstName,
      lastName,
      phone: profilePhone || undefined,
      avatarUrl: avatarUrl || null,
    });
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!currentPassword) {
      setErrorMessage("Current password is required.");
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(
        `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    updatePasswordMutation.mutate({
      oldPassword: currentPassword,
      newPassword,
    });
  };

  const handleSystemSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    updateSettingsMutation.mutate({
      maintenanceMode,
      globalRateLimit,
      backupSchedule,
      systemEmail,
    });
  };

  if (isProfileLoading) {
    return (
      <div className="space-y-6 max-w-6xl">
        <div>
          <Skeleton className="h-8 w-48 rounded-none" />
          <Skeleton className="h-4 w-72 mt-2 rounded-none" />
        </div>

        <div className="flex flex-col md:flex-row gap-6 animate-pulse">
          <div className="w-full md:w-64 shrink-0 space-y-2">
            <Skeleton className="h-14 w-full rounded-none" />
            <Skeleton className="h-14 w-full rounded-none" />
            <Skeleton className="h-14 w-full rounded-none" />
          </div>
          <div className="flex-1 space-y-6">
            <Skeleton className="h-64 w-full rounded-none" />
          </div>
        </div>
      </div>
    );
  }

  const tabsList = [
    {
      id: "profile",
      title: "Account profile",
      subtitle: "Identity & credentials",
    },
    {
      id: "security",
      title: "Security & Password",
      subtitle: "Password, MFA & authentication",
    },
    {
      id: "system",
      title: "System Controls",
      subtitle: "Platform settings & maintenance",
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <Card className="rounded-none border border-border/60 bg-card shadow-sm p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-border/60 bg-muted/20">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Settings
              </h2>
            </div>
            <div className="p-2 space-y-1">
              {tabsList.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id as any)}
                    className={`w-full text-left p-3 rounded-none transition-colors border ${
                      isActive
                        ? "bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800 text-foreground shadow-xs"
                        : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-7 rounded-none flex items-center justify-center text-xs ${
                          isActive
                            ? "bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={
                            tab.id === "profile"
                              ? faUser
                              : tab.id === "security"
                                ? faLock
                                : faGear
                          }
                          className="h-3.5 w-3.5"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs font-bold truncate ${
                            isActive
                              ? "text-sky-700 dark:text-sky-300"
                              : "text-foreground"
                          }`}
                        >
                          {tab.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {tab.subtitle}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Content Panel */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Notification Banners */}
          {successMessage && (
            <div className="flex items-center gap-2 rounded-none border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
              <FontAwesomeIcon
                icon={faCircleCheck}
                className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0"
              />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-none border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
              <FontAwesomeIcon
                icon={faCircleExclamation}
                className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0"
              />
              <span className="font-semibold">{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: ACCOUNT PROFILE */}
          {activeTab === "profile" && (
            <Card className="rounded-none border border-border/60 bg-card shadow-sm p-6 sm:p-8 space-y-6">
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Account profile
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Manage your personal Super Admin information and profile
                  details.
                </p>
              </div>

              {/* Profile Photo Box */}
              <div className="border border-border/60 bg-muted/10 p-5 rounded-none space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative group shrink-0">
                    <div className="size-20 rounded-full border-2 border-border bg-card flex items-center justify-center overflow-hidden shadow-xs">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Super Admin Avatar"
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-foreground">
                          {getInitials(firstName, lastName)}
                        </span>
                      )}
                    </div>
                    <label
                      htmlFor="avatar-upload-file"
                      className="absolute bottom-0 right-0 size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md cursor-pointer hover:bg-primary/90 transition-transform active:scale-95"
                    >
                      <FontAwesomeIcon icon={faCamera} className="h-3 w-3" />
                    </label>
                  </div>

                  <div className="space-y-2 text-center sm:text-left min-w-0 flex-1">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        Profile Photo
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Shown on your Super Admin profile. Use a professional
                        headshot (PNG, JPG, or WEBP, max 5 MB).
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      <label htmlFor="avatar-upload-file">
                        <Button
                          type="button"
                          size="sm"
                          className="text-xs font-semibold rounded-none min-h-[36px] px-4 bg-sky-600 hover:bg-sky-700 text-white gap-2 pointer-events-none"
                        >
                          <FontAwesomeIcon
                            icon={faUpload}
                            className="h-3 w-3"
                          />
                          Upload
                        </Button>
                      </label>

                      {avatarUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setAvatarUrl("")}
                          className="text-xs font-semibold rounded-none min-h-[36px] px-4 border-red-200 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400 gap-2"
                        >
                          <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <input
                  type="file"
                  id="avatar-upload-file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleAvatarFileChange}
                />
              </div>

              {/* Form Fields */}
              <form onSubmit={handleProfileSave} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      First name *
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Gideon"
                      required
                      className="w-full rounded-none border border-border/60 bg-card px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-[42px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Last name *
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Dadey"
                      required
                      className="w-full rounded-none border border-border/60 bg-card px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-[42px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={profileEmail}
                      disabled
                      className="w-full rounded-none border border-border/60 bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground min-h-[42px] cursor-not-allowed"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      Email is used for Super Admin login and can't be changed
                      here.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Phone number
                    </label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="0551550530"
                      className="w-full rounded-none border border-border/60 bg-card px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-[42px]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="text-xs font-semibold rounded-none min-h-[38px] px-6 bg-primary text-primary-foreground hover:bg-primary/95 gap-2"
                  >
                    {updateProfileMutation.isPending && (
                      <FontAwesomeIcon
                        icon={faSpinner}
                        className="h-3.5 w-3.5 animate-spin"
                      />
                    )}
                    Save
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* TAB 2: SECURITY & PASSWORD */}
          {activeTab === "security" && (
            <Card className="rounded-none border border-border/60 bg-card shadow-sm p-6 sm:p-8 space-y-6">
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Security & Password
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Manage your security credentials and multi-factor
                  authentication preferences.
                </p>
              </div>

              <form
                onSubmit={handlePasswordSave}
                className="space-y-5 max-w-xl"
              >
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Current Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                      className="w-full rounded-none border border-border/60 bg-card px-3 py-2.5 pr-10 text-xs text-foreground outline-none focus:border-primary min-h-[42px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                    >
                      <FontAwesomeIcon
                        icon={showCurrentPass ? faEyeSlash : faEye}
                        className="h-3.5 w-3.5"
                      />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      className="w-full rounded-none border border-border/60 bg-card px-3 py-2.5 pr-10 text-xs text-foreground outline-none focus:border-primary min-h-[42px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                    >
                      <FontAwesomeIcon
                        icon={showNewPass ? faEyeSlash : faEye}
                        className="h-3.5 w-3.5"
                      />
                    </button>
                  </div>

                  {newPassword.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Password Strength:</span>
                        <span className="font-semibold">
                          {newPassword.length < 8
                            ? "Weak"
                            : newPassword.length < 12
                              ? "Medium"
                              : "Strong"}
                        </span>
                      </div>
                      <div className="h-1 w-full bg-muted overflow-hidden rounded-none">
                        <div
                          className={`h-full transition-all duration-300 ${
                            newPassword.length < 8
                              ? "bg-red-500 w-1/3"
                              : newPassword.length < 12
                                ? "bg-amber-500 w-2/3"
                                : "bg-emerald-500 w-full"
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      className="w-full rounded-none border border-border/60 bg-card px-3 py-2.5 pr-10 text-xs text-foreground outline-none focus:border-primary min-h-[42px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                    >
                      <FontAwesomeIcon
                        icon={showConfirmPass ? faEyeSlash : faEye}
                        className="h-3.5 w-3.5"
                      />
                    </button>
                  </div>

                  {confirmPassword.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs mt-1">
                      {newPassword === confirmPassword ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                          <FontAwesomeIcon icon={faCheck} className="h-3 w-3" />{" "}
                          Passwords match
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center gap-1 font-semibold text-[11px]">
                          <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />{" "}
                          Passwords do not match
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={
                      updatePasswordMutation.isPending ||
                      (confirmPassword.length > 0 &&
                        newPassword !== confirmPassword)
                    }
                    className="text-xs font-semibold rounded-none min-h-[38px] px-6 bg-primary text-primary-foreground hover:bg-primary/95 gap-2"
                  >
                    {updatePasswordMutation.isPending && (
                      <FontAwesomeIcon
                        icon={faSpinner}
                        className="h-3.5 w-3.5 animate-spin"
                      />
                    )}
                    Save
                  </Button>
                </div>
              </form>

              {/* MFA Protection Section */}
              <div className="pt-6 border-t border-border/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border/60 bg-muted/10 p-5 rounded-none">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground">
                        Two-Factor Authentication (MFA)
                      </h3>
                      {userProfile?.mfaEnabled ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-none bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                          MFA Protected
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-none bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {userProfile?.mfaEnabled
                        ? "Your Super Admin account is protected with 2-step 6-digit verification code challenges upon sign in."
                        : "Enhance your Super Admin account security by requiring a 6-digit verification code sent to your email when logging in."}
                    </p>
                  </div>

                  <div>
                    {userProfile?.mfaEnabled ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isMfaLoading}
                        onClick={handleStartMfaDisable}
                        className="text-xs font-semibold rounded-none min-h-[36px] px-4 border-red-200 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400"
                      >
                        {isMfaLoading ? "Sending Code..." : "Disable MFA"}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        disabled={isMfaLoading}
                        onClick={handleStartMfaSetup}
                        className="text-xs font-semibold rounded-none min-h-[36px] px-4 bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                      >
                        {isMfaLoading ? "Sending Code..." : "Enable MFA"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Inline MFA Setup / Disable Verification Box */}
                {showMfaBox && (
                  <Card className="rounded-none border border-primary/40 bg-primary/5 p-5 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                        {mfaBoxMode === "enable"
                          ? "Enter 6-Digit MFA Verification Code"
                          : "Disable MFA Security Confirmation"}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        A 6-digit verification code was sent to{" "}
                        <strong className="text-foreground">
                          {userProfile?.email}
                        </strong>
                        .
                      </p>
                    </div>

                    {mfaBoxMode === "enable" ? (
                      <form
                        onSubmit={handleEnableMfa}
                        className="space-y-4 max-w-sm"
                      >
                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1.5">
                            6-Digit Verification Code
                          </label>
                          <input
                            type="text"
                            maxLength={8}
                            value={mfaCode}
                            onChange={(e) => setMfaCode(e.target.value)}
                            placeholder="123456"
                            required
                            className="w-full rounded-none border border-border/60 bg-card px-3 py-2 text-sm font-mono font-bold tracking-widest text-center text-foreground outline-none focus:border-primary min-h-[42px]"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={isMfaLoading}
                            className="text-xs font-semibold rounded-none min-h-[36px] px-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            {isMfaLoading
                              ? "Verifying..."
                              : "Confirm & Enable MFA"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowMfaBox(false)}
                            className="text-xs font-semibold rounded-none min-h-[36px] px-4"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <form
                        onSubmit={handleDisableMfa}
                        className="space-y-4 max-w-sm"
                      >
                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1.5">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={mfaDisablePassword}
                            onChange={(e) =>
                              setMfaDisablePassword(e.target.value)
                            }
                            placeholder="Enter current password"
                            required
                            className="w-full rounded-none border border-border/60 bg-card px-3 py-2 text-xs text-foreground outline-none focus:border-primary min-h-[38px]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-foreground mb-1.5">
                            6-Digit Verification Code
                          </label>
                          <input
                            type="text"
                            maxLength={8}
                            value={mfaCode}
                            onChange={(e) => setMfaCode(e.target.value)}
                            placeholder="123456"
                            required
                            className="w-full rounded-none border border-border/60 bg-card px-3 py-2 text-sm font-mono font-bold tracking-widest text-center text-foreground outline-none focus:border-primary min-h-[42px]"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={isMfaLoading}
                            className="text-xs font-semibold rounded-none min-h-[36px] px-4 bg-red-600 hover:bg-red-700 text-white"
                          >
                            {isMfaLoading
                              ? "Verifying..."
                              : "Confirm & Disable MFA"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowMfaBox(false)}
                            className="text-xs font-semibold rounded-none min-h-[36px] px-4"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </Card>
                )}
              </div>
            </Card>
          )}

          {/* TAB 3: SYSTEM CONTROLS */}
          {activeTab === "system" && (
            <Card className="rounded-none border border-border/60 bg-card shadow-sm p-6 sm:p-8 space-y-6">
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  System Controls
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Configure global platform operational boundaries and system
                  parameters.
                </p>
              </div>

              <form onSubmit={handleSystemSave} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      System Notification Email
                    </label>
                    <input
                      type="email"
                      value={systemEmail}
                      onChange={(e) => setSystemEmail(e.target.value)}
                      placeholder="system@susuflow.com"
                      className="w-full rounded-none border border-border/60 bg-card px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-[42px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Global Rate Limit (requests / min)
                    </label>
                    <input
                      type="number"
                      value={globalRateLimit}
                      onChange={(e) =>
                        setGlobalRateLimit(Number(e.target.value))
                      }
                      placeholder="100"
                      min="1"
                      className="w-full rounded-none border border-border/60 bg-card px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-[42px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Automated Backup Schedule
                    </label>
                    <select
                      value={backupSchedule}
                      onChange={(e) => setBackupSchedule(e.target.value)}
                      className="w-full rounded-none border border-border/60 bg-card px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-[42px]"
                    >
                      <option value="daily">Daily Automated Backup</option>
                      <option value="weekly">Weekly Automated Backup</option>
                      <option value="realtime">Realtime Replication</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between border border-border/60 bg-muted/10 p-4 rounded-none sm:col-span-2">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        Platform Maintenance Mode
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Restrict API access during scheduled system upgrades.
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={maintenanceMode}
                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={updateSettingsMutation.isPending}
                    className="text-xs font-semibold rounded-none min-h-[38px] px-6 bg-primary text-primary-foreground hover:bg-primary/95 gap-2"
                  >
                    {updateSettingsMutation.isPending && (
                      <FontAwesomeIcon
                        icon={faSpinner}
                        className="h-3.5 w-3.5 animate-spin"
                      />
                    )}
                    Save
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
