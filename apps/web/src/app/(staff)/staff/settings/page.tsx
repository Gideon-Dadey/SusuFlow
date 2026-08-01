"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { tenantApi, userApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faLock,
  faWandMagicSparkles,
  faSliders,
  faShieldHalved,
  faSpinner,
  faCircleCheck,
  faCircleExclamation,
  faEye,
  faEyeSlash,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { MIN_PASSWORD_LENGTH } from "@susuflow/shared";

function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace("#", "");
  let r = 0,
    g = 0,
    b = 0;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  } else {
    return `rgba(30, 64, 175, ${alpha})`;
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function StaffSettingsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    "profile" | "branding" | "operations" | "commissions"
  >("profile");
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

  // Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pass.length >= MIN_PASSWORD_LENGTH) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
    if (score === 2 || score === 3)
      return { score: 2, label: "Medium", color: "bg-amber-500" };
    return { score: 3, label: "Strong", color: "bg-emerald-500" };
  };

  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || "");
      setLastName(userProfile.lastName || "");
      setProfileEmail(userProfile.email || "");
      setProfilePhone(userProfile.phone || "");
    }
  }, [userProfile]);

  // 2. Tenant Settings Queries & States
  const isCompanyAdmin = user?.roles.includes("company_admin");

  const {
    data: tenant,
    isLoading: isTenantLoading,
    refetch: refetchTenant,
  } = useQuery({
    queryKey: ["tenant-settings", user?.tenantSlug],
    queryFn: () => tenantApi.getMe(),
    enabled: !!isCompanyAdmin,
  });

  // Branding states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#1E40AF");

  // Operations states
  const [currency, setCurrency] = useState("GHS");
  const [timezone, setTimezone] = useState("Africa/Accra");
  const [minDeposit, setMinDeposit] = useState("5");
  const [maxDeposit, setMaxDeposit] = useState("10000");
  const [minWithdrawal, setMinWithdrawal] = useState("10");
  const [maxWithdrawal, setMaxWithdrawal] = useState("5000");

  // Commissions & Fees states
  const [transactionFee, setTransactionFee] = useState("0.50");
  const [commissionRate, setCommissionRate] = useState("1.5");

  useEffect(() => {
    const resolvedName =
      tenant?.name ||
      (user?.tenantSlug
        ? user.tenantSlug === "adipa"
          ? "Adipa Microfinance"
          : user.tenantSlug.toUpperCase()
        : "Adipa Microfinance");
    const resolvedEmail =
      tenant?.email || user?.email || "admin@adipamicrofinance.com";
    const resolvedPhone =
      tenant?.phone || userProfile?.phone || "+233240000000";

    setName((prev) => prev || resolvedName);
    setEmail((prev) => prev || resolvedEmail);
    setPhone((prev) => prev || resolvedPhone);

    if (tenant) {
      if (tenant.name) setName(tenant.name);
      if (tenant.email) setEmail(tenant.email);
      if (tenant.phone) setPhone(tenant.phone);
      if (tenant.logoUrl) setLogoUrl(tenant.logoUrl);
      if (tenant.primaryColor) setPrimaryColor(tenant.primaryColor);

      const settings = (tenant.settings || {}) as Record<string, any>;
      setCurrency(settings.currency || "GHS");
      setTimezone(settings.timezone || "Africa/Accra");
      setMinDeposit(String(settings.min_deposit ?? "5"));
      setMaxDeposit(String(settings.max_deposit ?? "10000"));
      setMinWithdrawal(String(settings.min_withdrawal ?? "10"));
      setMaxWithdrawal(String(settings.max_withdrawal ?? "5000"));
      setTransactionFee(String(settings.transaction_fee ?? "0.50"));
      setCommissionRate(String((settings.commission_rate ?? 0.015) * 100));
    }
  }, [tenant, user, userProfile]);

  // Tab switcher
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setSuccessMessage("");
    setErrorMessage("");
  };

  // 3. Mutation Operations
  const updateProfileMutation = useMutation({
    mutationFn: () =>
      userApi.updateMe({
        firstName,
        lastName,
        email: profileEmail,
        phone: profilePhone,
      }),
    onSuccess: (updatedUser) => {
      setSuccessMessage("Profile updated successfully!");
      setErrorMessage("");
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
      refetchProfile();
    },
    onError: (err: any) => {
      setErrorMessage(err?.message || "Failed to update profile.");
      setSuccessMessage("");
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: () => userApi.updatePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      setSuccessMessage("Password changed successfully!");
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

  const updateTenantMutation = useMutation({
    mutationFn: (data: any) => tenantApi.updateMe(data),
    onSuccess: () => {
      setSuccessMessage("Tenant settings updated successfully!");
      setErrorMessage("");
      refetchTenant();
      queryClient.invalidateQueries({ queryKey: ["tenant-branding"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-settings"] });
    },
    onError: (err: any) => {
      setErrorMessage(err?.message || "Failed to update settings.");
      setSuccessMessage("");
    },
  });

  // 4. Form Handlers
  const isValidEmail = (emailStr: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    if (!firstName.trim() || !lastName.trim() || !profileEmail.trim()) {
      setErrorMessage("First Name, Last Name, and Email are required.");
      return;
    }
    if (!isValidEmail(profileEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    updateProfileMutation.mutate();
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage("All password fields are required.");
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(
        `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirm password do not match.");
      return;
    }
    updatePasswordMutation.mutate();
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Logo image must be smaller than 5MB.");
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
            setLogoUrl(compressed);
            setErrorMessage("");
          } else {
            setLogoUrl(rawResult);
            setErrorMessage("");
          }
        };
        img.onerror = () => {
          setLogoUrl(rawResult);
          setErrorMessage("");
        };
        img.src = rawResult;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBrandingSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    const targetName =
      name.trim() ||
      tenant?.name ||
      (user?.tenantSlug
        ? user.tenantSlug === "adipa"
          ? "Adipa Microfinance"
          : user.tenantSlug.toUpperCase()
        : "Adipa Microfinance");
    const targetEmail =
      email.trim() ||
      tenant?.email ||
      user?.email ||
      "admin@adipamicrofinance.com";
    const targetPhone =
      phone.trim() || tenant?.phone || userProfile?.phone || "+233240000000";

    if (!isValidEmail(targetEmail)) {
      setErrorMessage("Please enter a valid support email address.");
      return;
    }

    setName(targetName);
    setEmail(targetEmail);
    setPhone(targetPhone);

    updateTenantMutation.mutate({
      name: targetName,
      email: targetEmail,
      phone: targetPhone,
      logoUrl: logoUrl ? logoUrl : null,
      primaryColor,
      settings: tenant?.settings || {},
    });
  };

  const handleOperationsSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    const parsedMinDep = parseFloat(minDeposit);
    const parsedMaxDep = parseFloat(maxDeposit);
    const parsedMinWd = parseFloat(minWithdrawal);
    const parsedMaxWd = parseFloat(maxWithdrawal);

    if (isNaN(parsedMinDep) || parsedMinDep <= 0) {
      setErrorMessage("Minimum deposit must be greater than 0.");
      return;
    }
    if (isNaN(parsedMaxDep) || parsedMaxDep < parsedMinDep) {
      setErrorMessage(
        "Maximum deposit must be greater than or equal to minimum deposit.",
      );
      return;
    }
    if (isNaN(parsedMinWd) || parsedMinWd <= 0) {
      setErrorMessage("Minimum withdrawal must be greater than 0.");
      return;
    }
    if (isNaN(parsedMaxWd) || parsedMaxWd < parsedMinWd) {
      setErrorMessage(
        "Maximum withdrawal must be greater than or equal to minimum withdrawal.",
      );
      return;
    }

    const currentSettings = (tenant?.settings || {}) as Record<string, any>;

    updateTenantMutation.mutate({
      name,
      email,
      phone,
      logoUrl: logoUrl || null,
      primaryColor,
      settings: {
        ...currentSettings,
        currency,
        timezone,
        min_deposit: parsedMinDep,
        max_deposit: parsedMaxDep,
        min_withdrawal: parsedMinWd,
        max_withdrawal: parsedMaxWd,
      },
    });
  };

  const handleCommissionsSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    const parsedFee = parseFloat(transactionFee);
    const parsedComm = parseFloat(commissionRate);

    if (isNaN(parsedFee) || parsedFee < 0) {
      setErrorMessage("Transaction fee must be 0 or greater.");
      return;
    }
    if (isNaN(parsedComm) || parsedComm < 0 || parsedComm > 100) {
      setErrorMessage("Commission rate must be between 0% and 100%.");
      return;
    }

    const currentSettings = (tenant?.settings || {}) as Record<string, any>;

    updateTenantMutation.mutate({
      name,
      email,
      phone,
      logoUrl: logoUrl || null,
      primaryColor,
      settings: {
        ...currentSettings,
        transaction_fee: parsedFee,
        commission_rate: parsedComm / 100,
      },
    });
  };

  if (isProfileLoading || (isCompanyAdmin && isTenantLoading)) {
    return (
      <div className="space-y-6 max-w-6xl">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>

        <div className="flex flex-col md:flex-row gap-6 animate-pulse">
          {/* Navigation Sidebar Skeleton */}
          <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
            <Skeleton className="h-11 w-full" />
            {isCompanyAdmin && (
              <>
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
              </>
            )}
          </div>

          {/* Content Panel Skeleton */}
          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4 border border-border/50 bg-card p-6">
                <Skeleton className="h-6 w-32 animate-pulse" />
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
              </div>
              <div className="space-y-4 border border-border/50 bg-card p-6">
                <Skeleton className="h-6 w-32 animate-pulse" />
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="dashboard-title">Profile & Settings</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
          <button
            onClick={() => handleTabChange("profile")}
            className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === "profile"
                ? "bg-primary text-white font-bold"
                : "bg-card text-foreground hover:bg-muted/50 border border-border/50"
            }`}
          >
            <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
            My Profile
          </button>
          {isCompanyAdmin && (
            <>
              <button
                onClick={() => handleTabChange("branding")}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === "branding"
                    ? "bg-primary text-white font-bold"
                    : "bg-card text-foreground hover:bg-muted/50 border border-border/50"
                }`}
              >
                <FontAwesomeIcon
                  icon={faWandMagicSparkles}
                  className="h-4 w-4"
                />
                Branding & Company
              </button>
              <button
                onClick={() => handleTabChange("operations")}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === "operations"
                    ? "bg-primary text-white font-bold"
                    : "bg-card text-foreground hover:bg-muted/50 border border-border/50"
                }`}
              >
                <FontAwesomeIcon icon={faSliders} className="h-4 w-4" />
                Operations & Limits
              </button>
              <button
                onClick={() => handleTabChange("commissions")}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === "commissions"
                    ? "bg-primary text-white font-bold"
                    : "bg-card text-foreground hover:bg-muted/50 border border-border/50"
                }`}
              >
                <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4" />
                Commissions & Fees
              </button>
            </>
          )}
        </div>

        {/* Content Form Panel */}
        <div className="flex-1 space-y-6">
          {successMessage && (
            <div className="flex items-center gap-2 p-3 text-xs bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/50">
              <FontAwesomeIcon
                icon={faCircleCheck}
                className="h-4 w-4 shrink-0"
              />
              <span>{successMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 text-xs bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/50">
              <FontAwesomeIcon
                icon={faCircleExclamation}
                className="h-4 w-4 shrink-0"
              />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Details */}
              <Card className="shadow-sm border-none bg-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="h-4 w-4 text-primary"
                    />
                    Personal Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSave} className="space-y-4">
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
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      placeholder="Enter email address"
                      required
                    />
                    <Input
                      label="Phone Number"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="Enter phone number"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="w-full flex items-center justify-center gap-2 text-xs font-semibold px-4 min-h-[36px] bg-primary text-white hover:bg-primary/95"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending && (
                        <FontAwesomeIcon
                          icon={faSpinner}
                          className="h-4 w-4 animate-spin"
                        />
                      )}
                      Save Profile Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Password Card */}
              <Card className="shadow-sm border-none bg-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faLock}
                      className="h-4 w-4 text-primary"
                    />
                    Security & Password
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSave} className="space-y-4">
                    {/* Current Password */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-foreground">
                        Current Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showCurrentPass ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                        >
                          <FontAwesomeIcon
                            icon={showCurrentPass ? faEyeSlash : faEye}
                            className="h-3.5 w-3.5"
                          />
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-foreground">
                        New Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showNewPass ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder={`Minimum ${MIN_PASSWORD_LENGTH} characters`}
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                        >
                          <FontAwesomeIcon
                            icon={showNewPass ? faEyeSlash : faEye}
                            className="h-3.5 w-3.5"
                          />
                        </button>
                      </div>

                      {/* Password Strength Meter */}
                      {newPassword.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-muted-foreground">
                              Strength:
                            </span>
                            <span className="font-semibold text-foreground">
                              {getPasswordStrength(newPassword).label}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                getPasswordStrength(newPassword).color
                              }`}
                              style={{
                                width: `${
                                  (getPasswordStrength(newPassword).score / 3) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-foreground">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showConfirmPass ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                        >
                          <FontAwesomeIcon
                            icon={showConfirmPass ? faEyeSlash : faEye}
                            className="h-3.5 w-3.5"
                          />
                        </button>
                      </div>

                      {/* Live Password Match Feedback */}
                      {confirmPassword.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs mt-1">
                          {newPassword === confirmPassword ? (
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium text-[11px]">
                              <FontAwesomeIcon
                                icon={faCheck}
                                className="h-3 w-3"
                              />{" "}
                              Passwords match
                            </span>
                          ) : (
                            <span className="text-red-500 flex items-center gap-1 font-medium text-[11px]">
                              <FontAwesomeIcon
                                icon={faXmark}
                                className="h-3 w-3"
                              />{" "}
                              Passwords do not match
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      size="sm"
                      className="w-full flex items-center justify-center gap-2 text-xs font-semibold px-4 min-h-[36px] bg-primary text-white hover:bg-primary/95"
                      disabled={
                        updatePasswordMutation.isPending ||
                        (confirmPassword.length > 0 &&
                          newPassword !== confirmPassword)
                      }
                    >
                      {updatePasswordMutation.isPending && (
                        <FontAwesomeIcon
                          icon={faSpinner}
                          className="h-4 w-4 animate-spin"
                        />
                      )}
                      Update Password
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {isCompanyAdmin && activeTab === "branding" && (
            <Card className="shadow-sm border-none bg-card">
              <CardHeader>
                <CardTitle className="text-lg">General & Branding</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Update your company details and logo for organization
                  branding.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBrandingSave} className="space-y-4">
                  <Input
                    label="Company Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Adipa Microfinance"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Support Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@adipamicrofinance.com"
                    />
                    <Input
                      label="Support Phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+233..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-foreground">
                      Company Logo
                    </label>
                    <div className="flex items-center gap-4">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt="Logo preview"
                          className="h-16 w-16 object-contain bg-muted border border-border"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center bg-muted text-xs text-muted-foreground font-semibold border border-border">
                          No Logo
                        </div>
                      )}
                      <div className="flex flex-col gap-1.5">
                        <input
                          type="file"
                          accept="image/*"
                          id="settings-logo-file"
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
                                .getElementById("settings-logo-file")
                                ?.click()
                            }
                          >
                            Upload Image File
                          </Button>
                          {logoUrl && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => setLogoUrl("")}
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

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      size="sm"
                      className="w-full sm:w-auto text-xs font-semibold px-4 min-h-[36px] bg-primary text-white hover:bg-primary/95 flex items-center justify-center gap-1.5"
                      disabled={updateTenantMutation.isPending}
                    >
                      {updateTenantMutation.isPending && (
                        <FontAwesomeIcon
                          icon={faSpinner}
                          className="h-4 w-4 animate-spin"
                        />
                      )}
                      Save Branding Settings
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {isCompanyAdmin && activeTab === "operations" && (
            <Card className="shadow-sm border-none bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Operations & Limits</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Configure transactional requirements and operating boundaries.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleOperationsSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-foreground">
                        Currency
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="flex h-11 w-full border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
                      >
                        <option value="GHS">GHS (Ghana Cedi)</option>
                        <option value="USD">USD (US Dollar)</option>
                        <option value="EUR">EUR (Euro)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-foreground">
                        Timezone
                      </label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="flex h-11 w-full border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
                      >
                        <option value="Africa/Accra">Africa/Accra (GMT)</option>
                        <option value="UTC">
                          UTC (Coordinated Universal Time)
                        </option>
                        <option value="Europe/London">Europe/London</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <Input
                      label={`Minimum Deposit (${currency})`}
                      type="number"
                      value={minDeposit}
                      onChange={(e) => setMinDeposit(e.target.value)}
                      placeholder="5"
                      min="1"
                    />
                    <Input
                      label={`Maximum Deposit (${currency})`}
                      type="number"
                      value={maxDeposit}
                      onChange={(e) => setMaxDeposit(e.target.value)}
                      placeholder="10000"
                      min="1"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label={`Minimum Withdrawal (${currency})`}
                      type="number"
                      value={minWithdrawal}
                      onChange={(e) => setMinWithdrawal(e.target.value)}
                      placeholder="10"
                      min="1"
                    />
                    <Input
                      label={`Maximum Daily Withdrawal (${currency})`}
                      type="number"
                      value={maxWithdrawal}
                      onChange={(e) => setMaxWithdrawal(e.target.value)}
                      placeholder="5000"
                      min="1"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      size="sm"
                      className="w-full sm:w-auto text-xs font-semibold px-4 min-h-[36px] bg-primary text-white hover:bg-primary/95 flex items-center justify-center gap-1.5"
                      disabled={updateTenantMutation.isPending}
                    >
                      {updateTenantMutation.isPending && (
                        <FontAwesomeIcon
                          icon={faSpinner}
                          className="h-4 w-4 animate-spin"
                        />
                      )}
                      Save Operations Settings
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {isCompanyAdmin && activeTab === "commissions" && (
            <Card className="shadow-sm border-none bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Commissions & Fees</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Adjust transaction-level fees and internal agent commission
                  rates.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCommissionsSave} className="space-y-4">
                  <Input
                    label={`Flat Transaction Fee (${currency})`}
                    type="number"
                    step="0.01"
                    value={transactionFee}
                    onChange={(e) => setTransactionFee(e.target.value)}
                    placeholder="0.50"
                    min="0"
                  />

                  <Input
                    label="Collector Commission Rate (%)"
                    type="number"
                    step="0.1"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    placeholder="1.5"
                    min="0"
                    max="100"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    This percentage is paid out directly to field agent
                    collectors from deposit volumes collected.
                  </p>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      size="sm"
                      className="w-full sm:w-auto text-xs font-semibold px-4 min-h-[36px] bg-primary text-white hover:bg-primary/95 flex items-center justify-center gap-1.5"
                      disabled={updateTenantMutation.isPending}
                    >
                      {updateTenantMutation.isPending && (
                        <FontAwesomeIcon
                          icon={faSpinner}
                          className="h-4 w-4 animate-spin"
                        />
                      )}
                      Save Fees Settings
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
