"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { tenantApi, userApi, authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { getTenantSlug, getInitials } from "@/lib/utils";
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
  faUpload,
  faTrash,
  faCamera,
} from "@fortawesome/free-solid-svg-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { MIN_PASSWORD_LENGTH } from "@susuflow/shared";

export default function StaffSettingsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "branding" | "operations" | "commissions"
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
  const [avatarUrl, setAvatarUrl] = useState("");

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

  // 2. Tenant Settings Queries & States
  const isCompanyAdmin = user?.roles.includes("company_admin");
  const tenantSlug = user?.tenantSlug || getTenantSlug();

  const {
    data: tenant,
    isLoading: isTenantLoading,
    refetch: refetchTenant,
  } = useQuery({
    queryKey: ["tenant-settings", tenantSlug],
    queryFn: () => tenantApi.getMe(),
    enabled: !!isCompanyAdmin,
  });

  const { data: tenantBranding } = useQuery({
    queryKey: ["tenant-branding", tenantSlug],
    queryFn: () => tenantApi.getBySlug(tenantSlug),
    enabled: !!tenantSlug,
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
    const activeTenant = (tenant || tenantBranding) as any;
    const resolvedName =
      activeTenant?.name ||
      (tenantSlug
        ? tenantSlug === "adipa" || tenantSlug === "susuflow"
          ? "SusuFlow"
          : tenantSlug.toUpperCase()
        : "SusuFlow");
    const resolvedEmail =
      activeTenant?.email || user?.email || "support@susuflow.com";
    const resolvedPhone =
      activeTenant?.phone || userProfile?.phone || "+233240000000";
    const resolvedLogo = tenant?.logoUrl || tenantBranding?.logoUrl || "";

    setName((prev) => prev || resolvedName);
    setEmail((prev) => prev || resolvedEmail);
    setPhone((prev) => prev || resolvedPhone);
    if (resolvedLogo) setLogoUrl(resolvedLogo);

    if (activeTenant) {
      if (activeTenant.name) setName(activeTenant.name);
      if (activeTenant.email) setEmail(activeTenant.email);
      if (activeTenant.phone) setPhone(activeTenant.phone);
      if (activeTenant.logoUrl) setLogoUrl(activeTenant.logoUrl);
      if (activeTenant.primaryColor) setPrimaryColor(activeTenant.primaryColor);

      const settings = (activeTenant.settings || {}) as Record<string, any>;
      setCurrency(settings.currency || "GHS");
      setTimezone(settings.timezone || "Africa/Accra");
      setMinDeposit(String(settings.min_deposit ?? "5"));
      setMaxDeposit(String(settings.max_deposit ?? "10000"));
      setMinWithdrawal(String(settings.min_withdrawal ?? "10"));
      setMaxWithdrawal(String(settings.max_withdrawal ?? "5000"));
      setTransactionFee(String(settings.transaction_fee ?? "0.50"));
      setCommissionRate(String((settings.commission_rate ?? 0.015) * 100));
    }
  }, [tenant, tenantBranding, user, userProfile, tenantSlug]);

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
        avatarUrl: avatarUrl || undefined,
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
              avatarUrl: updatedUser.avatarUrl,
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

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Avatar image must be smaller than 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const rawResult = reader.result as string;
        setAvatarUrl(rawResult);
        setErrorMessage("");
      };
      reader.readAsDataURL(file);
    }
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
        setLogoUrl(rawResult);
        setErrorMessage("");
      };
      reader.readAsDataURL(file);
    }
  };

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

  const handleBrandingSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    const targetName =
      name.trim() ||
      tenant?.name ||
      (user?.tenantSlug
        ? user.tenantSlug === "adipa" || user.tenantSlug === "susuflow"
          ? "SusuFlow"
          : user.tenantSlug.toUpperCase()
        : "SusuFlow");
    const targetEmail =
      email.trim() || tenant?.email || user?.email || "support@susuflow.com";
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
      subtitle: "Password & authentication",
    },
    ...(isCompanyAdmin
      ? [
          {
            id: "branding",
            title: "Branding",
            subtitle: "Logo, color & public name",
          },
          {
            id: "operations",
            title: "Operations",
            subtitle: "Currency, timezone & limits",
          },
          {
            id: "commissions",
            title: "Commissions",
            subtitle: "Transaction fee & agent rates",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Navigation Sidebar matching screenshot */}
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
                        ? "bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-100"
                        : "bg-transparent border-transparent hover:bg-muted/30 text-foreground"
                    }`}
                  >
                    <p
                      className={`text-xs font-bold ${
                        isActive
                          ? "text-sky-700 dark:text-sky-300 font-bold"
                          : "text-foreground font-semibold"
                      }`}
                    >
                      {tab.title}
                    </p>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        isActive
                          ? "text-sky-600/80 dark:text-sky-400/80 font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {tab.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Content Panel */}
        <div className="flex-1 space-y-6">
          {successMessage && (
            <div className="flex items-center gap-2 p-3 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-medium">
              <FontAwesomeIcon
                icon={faCircleCheck}
                className="h-4 w-4 shrink-0"
              />
              <span>{successMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 text-xs bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 font-medium">
              <FontAwesomeIcon
                icon={faCircleExclamation}
                className="h-4 w-4 shrink-0"
              />
              <span>{errorMessage}</span>
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
                  Manage your identity and professional credentials.
                </p>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-6">
                {/* Profile Photo Box */}
                <div className="border border-border/60 bg-muted/10 p-5 rounded-none flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative shrink-0">
                    <div className="size-20 rounded-full bg-primary/10 text-primary flex items-center justify-center overflow-hidden font-bold text-lg border border-border/60">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Profile Avatar"
                          className="size-full object-cover"
                        />
                      ) : (
                        getInitials(firstName, lastName)
                      )}
                    </div>
                    <label
                      htmlFor="avatar-upload-file"
                      className="absolute bottom-0 right-0 size-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer shadow-md hover:bg-primary/90 transition-colors"
                      title="Upload new headshot"
                    >
                      <FontAwesomeIcon icon={faCamera} className="h-3 w-3" />
                    </label>
                    <input
                      type="file"
                      id="avatar-upload-file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarFileChange}
                    />
                  </div>

                  <div className="space-y-2 flex-1 text-center sm:text-left">
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        Profile photo
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Shown on your public staff profile and practitioner
                        directory. Use a professional headshot (PNG, JPG, or
                        WEBP, max 5 MB).
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
                          Replace photo
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

                {/* Form Fields Grid matching screenshot 1-to-1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      First name *
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name"
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
                      placeholder="Enter last name"
                      required
                      className="w-full rounded-none border border-border/60 bg-card px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-[42px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileEmail}
                      disabled
                      className="w-full rounded-none border border-border/60 bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground min-h-[42px] cursor-not-allowed"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      Email is used for login and can't be changed here.
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
                    Save Profile Changes
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
                  Manage your security credentials and password preferences.
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
                      placeholder={`Minimum ${MIN_PASSWORD_LENGTH} characters`}
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
                    <div className="space-y-1 pt-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Strength:</span>
                        <span className="font-semibold text-foreground">
                          {getPasswordStrength(newPassword).label}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-none overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            getPasswordStrength(newPassword).color
                          }`}
                          style={{
                            width: `${
                              (getPasswordStrength(newPassword).score / 3) * 100
                            }%`,
                          }}
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
                    Update Password
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
                        ? "Your Company Admin account is protected with 2-step 6-digit verification code challenges upon sign in."
                        : "Enhance your Company Admin account security by requiring a 6-digit verification code sent to your email when logging in."}
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
                        className="text-xs font-semibold rounded-none min-h-[36px] px-4 bg-emerald-600 hover:bg-emerald-700 text-white border-none gap-2"
                      >
                        <FontAwesomeIcon
                          icon={faShieldHalved}
                          className="h-3.5 w-3.5"
                        />
                        {isMfaLoading
                          ? "Sending Code..."
                          : "Enable MFA Security"}
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

          {/* TAB 3: BRANDING */}
          {isCompanyAdmin && activeTab === "branding" && (
            <Card className="rounded-none border border-border/60 bg-card shadow-sm p-6 sm:p-8 space-y-6">
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Branding & Company
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Update your organization details and logo for member branding.
                </p>
              </div>

              <form onSubmit={handleBrandingSave} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. SusuFlow"
                      className="w-full rounded-none border border-border/60 bg-card px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-[42px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="support@susuflow.com"
                      className="w-full rounded-none border border-border/60 bg-card px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-[42px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Support Phone
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+233..."
                      className="w-full rounded-none border border-border/60 bg-card px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-[42px]"
                    />
                  </div>
                </div>

                <div className="border border-border/60 bg-muted/10 p-5 rounded-none space-y-3">
                  <label className="block text-xs font-bold text-foreground">
                    Company Logo
                  </label>
                  <div className="flex items-center gap-4">
                    {logoUrl || tenant?.logoUrl || tenantBranding?.logoUrl ? (
                      <img
                        src={
                          logoUrl ||
                          tenant?.logoUrl ||
                          tenantBranding?.logoUrl ||
                          ""
                        }
                        alt="Company Logo preview"
                        className="h-16 w-16 object-contain rounded-none bg-card border border-border/60 p-1"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-none bg-muted/50 text-xs text-muted-foreground font-semibold border border-border/60">
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
                        <label htmlFor="settings-logo-file">
                          <Button
                            type="button"
                            size="sm"
                            className="text-xs font-semibold rounded-none min-h-[36px] px-4 bg-sky-600 hover:bg-sky-700 text-white gap-2 pointer-events-none"
                          >
                            <FontAwesomeIcon
                              icon={faUpload}
                              className="h-3 w-3"
                            />
                            Upload Logo
                          </Button>
                        </label>
                        {logoUrl && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setLogoUrl("")}
                            className="text-xs font-semibold rounded-none min-h-[36px] px-4 border-red-200 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400 gap-2"
                          >
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="h-3 w-3"
                            />
                            Remove
                          </Button>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        Supported format: PNG, JPG, WebP. Max 5MB.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={updateTenantMutation.isPending}
                    className="text-xs font-semibold rounded-none min-h-[38px] px-6 bg-primary text-primary-foreground hover:bg-primary/95 gap-2"
                  >
                    {updateTenantMutation.isPending && (
                      <FontAwesomeIcon
                        icon={faSpinner}
                        className="h-3.5 w-3.5 animate-spin"
                      />
                    )}
                    Save Branding Settings
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* TAB 4: OPERATIONS */}
          {isCompanyAdmin && activeTab === "operations" && (
            <Card className="rounded-none border border-border/60 bg-card shadow-sm p-6 sm:p-8 space-y-6">
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Operations & Limits
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Configure transactional requirements and operating boundaries.
                </p>
              </div>

              <form onSubmit={handleOperationsSave} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full rounded-none border border-border/60 bg-card px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-[42px]"
                    >
                      <option value="GHS">GHS (Ghana Cedi)</option>
                      <option value="USD">USD (US Dollar)</option>
                      <option value="EUR">EUR (Euro)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full rounded-none border border-border/60 bg-card px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-[42px]"
                    >
                      <option value="Africa/Accra">Africa/Accra (GMT)</option>
                      <option value="UTC">
                        UTC (Coordinated Universal Time)
                      </option>
                      <option value="Europe/London">Europe/London</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Minimum Deposit ({currency})
                    </label>
                    <input
                      type="number"
                      value={minDeposit}
                      onChange={(e) => setMinDeposit(e.target.value)}
                      placeholder="5"
                      min="1"
                      className="w-full rounded-none border border-border/60 bg-card px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-[42px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Maximum Deposit ({currency})
                    </label>
                    <input
                      type="number"
                      value={maxDeposit}
                      onChange={(e) => setMaxDeposit(e.target.value)}
                      placeholder="10000"
                      min="1"
                      className="w-full rounded-none border border-border/60 bg-card px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-[42px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Minimum Withdrawal ({currency})
                    </label>
                    <input
                      type="number"
                      value={minWithdrawal}
                      onChange={(e) => setMinWithdrawal(e.target.value)}
                      placeholder="10"
                      min="1"
                      className="w-full rounded-none border border-border/60 bg-card px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-[42px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Maximum Daily Withdrawal ({currency})
                    </label>
                    <input
                      type="number"
                      value={maxWithdrawal}
                      onChange={(e) => setMaxWithdrawal(e.target.value)}
                      placeholder="5000"
                      min="1"
                      className="w-full rounded-none border border-border/60 bg-card px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-[42px]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={updateTenantMutation.isPending}
                    className="text-xs font-semibold rounded-none min-h-[38px] px-6 bg-primary text-primary-foreground hover:bg-primary/95 gap-2"
                  >
                    {updateTenantMutation.isPending && (
                      <FontAwesomeIcon
                        icon={faSpinner}
                        className="h-3.5 w-3.5 animate-spin"
                      />
                    )}
                    Save Operations Settings
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* TAB 5: COMMISSIONS */}
          {isCompanyAdmin && activeTab === "commissions" && (
            <Card className="rounded-none border border-border/60 bg-card shadow-sm p-6 sm:p-8 space-y-6">
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Commissions & Fees
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Adjust transaction-level fees and internal agent commission
                  rates.
                </p>
              </div>

              <form onSubmit={handleCommissionsSave} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Flat Transaction Fee ({currency})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={transactionFee}
                      onChange={(e) => setTransactionFee(e.target.value)}
                      placeholder="0.50"
                      min="0"
                      className="w-full rounded-none border border-border/60 bg-card px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-[42px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Collector Commission Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(e.target.value)}
                      placeholder="1.5"
                      min="0"
                      max="100"
                      className="w-full rounded-none border border-border/60 bg-card px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary min-h-[42px]"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      Paid out directly to field collectors from deposit volume.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={updateTenantMutation.isPending}
                    className="text-xs font-semibold rounded-none min-h-[38px] px-6 bg-primary text-primary-foreground hover:bg-primary/95 gap-2"
                  >
                    {updateTenantMutation.isPending && (
                      <FontAwesomeIcon
                        icon={faSpinner}
                        className="h-3.5 w-3.5 animate-spin"
                      />
                    )}
                    Save Fees Settings
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
