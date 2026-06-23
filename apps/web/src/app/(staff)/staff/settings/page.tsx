'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { tenantApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { Loader2, CheckCircle, AlertCircle, Sparkles, Sliders, ShieldCheck } from 'lucide-react';

export default function StaffSettingsPage() {
  const { user } = useAuthStore();
  const { data: tenant, isLoading, refetch } = useQuery({
    queryKey: ['tenant-settings', user?.tenantSlug],
    queryFn: () => tenantApi.getMe(),
  });

  // Settings states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#1E40AF');

  // JSON settings states
  const [currency, setCurrency] = useState('GHS');
  const [timezone, setTimezone] = useState('Africa/Accra');
  const [minDeposit, setMinDeposit] = useState('5');
  const [maxDeposit, setMaxDeposit] = useState('10000');
  const [minWithdrawal, setMinWithdrawal] = useState('10');
  const [maxWithdrawal, setMaxWithdrawal] = useState('5000');
  const [transactionFee, setTransactionFee] = useState('0.50');
  const [commissionRate, setCommissionRate] = useState('1.5');

  const [activeTab, setActiveTab] = useState<'branding' | 'operations' | 'commissions'>('branding');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (tenant) {
      setName(tenant.name || '');
      setEmail(tenant.email || '');
      setPhone(tenant.phone || '');
      setLogoUrl(tenant.logoUrl || '');
      setPrimaryColor(tenant.primaryColor || '#1E40AF');

      const settings = (tenant.settings || {}) as Record<string, any>;
      setCurrency(settings.currency || 'GHS');
      setTimezone(settings.timezone || 'Africa/Accra');
      setMinDeposit(String(settings.min_deposit ?? '5'));
      setMaxDeposit(String(settings.max_deposit ?? '10000'));
      setMinWithdrawal(String(settings.min_withdrawal ?? '10'));
      setMaxWithdrawal(String(settings.max_withdrawal ?? '5000'));
      setTransactionFee(String(settings.transaction_fee ?? '0.50'));
      setCommissionRate(String((settings.commission_rate ?? 0.015) * 100)); // convert e.g. 0.015 to 1.5
    }
  }, [tenant]);

  const queryClient = useQueryClient();

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('Logo image must be smaller than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
        setErrorMessage('');
      };
      reader.readAsDataURL(file);
    }
  };

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => tenantApi.updateMe(data),
    onSuccess: () => {
      setSuccessMessage('Tenant settings updated successfully!');
      setErrorMessage('');
      refetch();
      queryClient.invalidateQueries({ queryKey: ['tenant-branding'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-settings'] });
    },
    onError: (err: any) => {
      setErrorMessage(err?.message || 'Failed to update settings.');
      setSuccessMessage('');
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    // Validations
    if (!name || !email) {
      setErrorMessage('Company Name and Support Email are required.');
      return;
    }

    const parsedMinDep = parseFloat(minDeposit);
    const parsedMaxDep = parseFloat(maxDeposit);
    const parsedMinWd = parseFloat(minWithdrawal);
    const parsedMaxWd = parseFloat(maxWithdrawal);
    const parsedFee = parseFloat(transactionFee);
    const parsedComm = parseFloat(commissionRate);

    if (isNaN(parsedMinDep) || parsedMinDep <= 0) {
      setErrorMessage('Minimum deposit must be greater than 0.');
      return;
    }
    if (isNaN(parsedMaxDep) || parsedMaxDep < parsedMinDep) {
      setErrorMessage('Maximum deposit must be greater than or equal to minimum deposit.');
      return;
    }
    if (isNaN(parsedMinWd) || parsedMinWd <= 0) {
      setErrorMessage('Minimum withdrawal must be greater than 0.');
      return;
    }
    if (isNaN(parsedMaxWd) || parsedMaxWd < parsedMinWd) {
      setErrorMessage('Maximum withdrawal must be greater than or equal to minimum withdrawal.');
      return;
    }
    if (isNaN(parsedFee) || parsedFee < 0) {
      setErrorMessage('Transaction fee must be 0 or greater.');
      return;
    }
    if (isNaN(parsedComm) || parsedComm < 0 || parsedComm > 100) {
      setErrorMessage('Commission rate must be between 0% and 100%.');
      return;
    }

    const payload = {
      name,
      email,
      phone,
      logoUrl: logoUrl || null,
      primaryColor,
      settings: {
        currency,
        timezone,
        min_deposit: parsedMinDep,
        max_deposit: parsedMaxDep,
        min_withdrawal: parsedMinWd,
        max_withdrawal: parsedMaxWd,
        transaction_fee: parsedFee,
        commission_rate: parsedComm / 100, // convert e.g. 1.5 back to 0.015
      },
    };

    updateSettingsMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="dashboard-title">Company Settings</h1>
        <p className="text-xs text-muted-foreground">Customize your organization, operating limits, and transaction commissions</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
          <button
            onClick={() => setActiveTab('branding')}
            className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'branding'
                ? 'bg-primary text-white'
                : 'bg-card text-foreground hover:bg-muted/50 border border-border/50'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            General & Branding
          </button>
          <button
            onClick={() => setActiveTab('operations')}
            className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'operations'
                ? 'bg-primary text-white'
                : 'bg-card text-foreground hover:bg-muted/50 border border-border/50'
            }`}
          >
            <Sliders className="h-4 w-4" />
            Operations & Limits
          </button>
          <button
            onClick={() => setActiveTab('commissions')}
            className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'commissions'
                ? 'bg-primary text-white'
                : 'bg-card text-foreground hover:bg-muted/50 border border-border/50'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Commissions & Fees
          </button>
        </div>

        {/* Content Form */}
        <div className="flex-1">
          <form onSubmit={handleSave} className="space-y-6">
            {successMessage && (
              <div className="flex items-center gap-2 p-3 text-xs bg-green-50 text-green-700 rounded-lg border border-green-200">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 text-xs bg-red-50 text-red-700 rounded-lg border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {activeTab === 'branding' && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">General & Branding</CardTitle>
                  <p className="text-xs text-muted-foreground">Update your company details and accent colors.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Company Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter company name"
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Support Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@yourcompany.com"
                      required
                    />
                    <Input
                      label="Support Phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+233..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-foreground">Company Logo</label>
                    <div className="flex items-center gap-4">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
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
                          id="settings-logo-file"
                          className="hidden"
                          onChange={handleLogoFileChange}
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('settings-logo-file')?.click()}
                          >
                            Upload Image File
                          </Button>
                          {logoUrl && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => setLogoUrl('')}
                            >
                              Remove Logo
                            </Button>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground">Supported format: PNG, JPG, WebP. Max 2MB.</span>
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
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="h-10 w-20 cursor-pointer rounded-lg border border-border bg-card"
                      />
                      <Input
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        placeholder="#1E40AF"
                        className="flex-1 max-w-[150px]"
                        maxLength={7}
                      />
                    </div>
                  </div>

                  {/* Brand Color Preview */}
                  <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Live Component Preview</h4>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        style={{ backgroundColor: primaryColor }}
                        className="px-4 py-2 text-xs font-bold text-white rounded-lg shadow-sm hover:opacity-90 transition-opacity"
                      >
                        Accent Button
                      </button>
                      <span
                        style={{ color: primaryColor, borderColor: `${primaryColor}30`, backgroundColor: `${primaryColor}10` }}
                        className="px-2.5 py-1 text-xs font-semibold rounded-full border"
                      >
                        Accent Tag
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'operations' && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Operations & Limits</CardTitle>
                  <p className="text-xs text-muted-foreground">Configure base rules for deposits and withdrawals.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-foreground">Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="flex h-11 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
                      >
                        <option value="GHS">GHS (Ghana Cedi)</option>
                        <option value="USD">USD (US Dollar)</option>
                        <option value="EUR">EUR (Euro)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-foreground">Timezone</label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="flex h-11 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
                      >
                        <option value="Africa/Accra">Africa/Accra (GMT)</option>
                        <option value="UTC">UTC (Coordinated Universal Time)</option>
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
                </CardContent>
              </Card>
            )}

            {activeTab === 'commissions' && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Commissions & Fees</CardTitle>
                  <p className="text-xs text-muted-foreground">Adjust operational fees charged on user savings plans.</p>
                </CardHeader>
                <CardContent className="space-y-4">
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
                  <p className="text-[11px] text-muted-foreground">This percentage is paid out directly to field agent collectors from deposit volumes collected.</p>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                className="w-full sm:w-auto flex items-center gap-2 font-bold px-6"
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Settings
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
