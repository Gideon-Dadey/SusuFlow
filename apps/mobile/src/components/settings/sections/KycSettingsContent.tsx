import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AppIcon } from "@/components/icons/AppIcon";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { homeChrome } from "@/components/home/homeChrome";
import { useAuthStore } from "@/stores/auth.store";
import { kycApi, type KycDocument, type KycStatusResponse } from "@/lib/api";
import {
  CUSTOMER_ID_OPTIONS,
  idTypeLabel,
  isKycPendingReview,
  isKycVerified,
  latestRejectionReason,
  normalizeIdNumber,
  validateIdNumber,
  type CustomerIdType,
} from "@/lib/kyc";
import {
  pickKycImage,
  presentKycImageActions,
  type KycImageSource,
} from "@/lib/kyc-image";
import { queryKeys } from "@/lib/query-keys";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

type Step = 1 | 2 | 3;

export function KycSettingsContent() {
  const { colors, isDark } = useTheme();
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  const statusQuery = useQuery({
    queryKey: queryKeys.kycStatus(userId ?? ""),
    queryFn: () => kycApi.getMyStatus(),
    enabled: !!userId,
  });

  const status = statusQuery.data;
  const verified = isKycVerified(status);
  const pending = isKycPendingReview(status);
  const rejected = status?.kycStatus === "rejected";
  const rejectionReason = latestRejectionReason(status?.documents);

  const [step, setStep] = useState<Step>(1);
  const [documentType, setDocumentType] =
    useState<CustomerIdType>("ghana_card");
  const [idNumber, setIdNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [frontUrl, setFrontUrl] = useState("");
  const [backUrl, setBackUrl] = useState("");
  const [selfieUrl, setSelfieUrl] = useState("");
  const [error, setError] = useState("");
  const [picking, setPicking] = useState(false);

  const needsBack =
    CUSTOMER_ID_OPTIONS.find((o) => o.type === documentType)?.needsBack ??
    false;

  useEffect(() => {
    if (!status) return;
    if (status.ghanaCardNumber) {
      setIdNumber((prev) => prev || status.ghanaCardNumber || "");
    }
    if (status.address) {
      setAddress((prev) => prev || status.address || "");
    }
    if (status.dateOfBirth) {
      setDateOfBirth((prev) => prev || String(status.dateOfBirth).slice(0, 10));
    }
  }, [status]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const normalized = normalizeIdNumber(documentType, idNumber);
      const documents: Array<{
        documentType: CustomerIdType | "selfie";
        fileUrl: string;
      }> = [{ documentType, fileUrl: frontUrl }];

      if (needsBack && backUrl) {
        documents.push({ documentType, fileUrl: backUrl });
      }
      documents.push({ documentType: "selfie", fileUrl: selfieUrl });

      return kycApi.submitBatch({
        idNumber: normalized,
        dateOfBirth: dateOfBirth || undefined,
        address: address.trim() || undefined,
        documents,
      });
    },
    onMutate: async () => {
      if (!userId)
        return { previous: undefined as KycStatusResponse | undefined };
      setError("");
      await queryClient.cancelQueries({
        queryKey: queryKeys.kycStatus(userId),
      });
      const previous = queryClient.getQueryData<KycStatusResponse>(
        queryKeys.kycStatus(userId),
      );

      const now = new Date().toISOString();
      const optimisticDocs: KycDocument[] = [
        {
          id: "optimistic-front",
          documentType,
          fileUrl: frontUrl,
          status: "pending",
          createdAt: now,
        },
      ];
      if (needsBack && backUrl) {
        optimisticDocs.push({
          id: "optimistic-back",
          documentType,
          fileUrl: backUrl,
          status: "pending",
          createdAt: now,
        });
      }
      optimisticDocs.push({
        id: "optimistic-selfie",
        documentType: "selfie",
        fileUrl: selfieUrl,
        status: "pending",
        createdAt: now,
      });

      queryClient.setQueryData<KycStatusResponse>(queryKeys.kycStatus(userId), {
        customerId: previous?.customerId ?? "local",
        kycLevel: previous?.kycLevel ?? 1,
        kycStatus: "pending",
        ghanaCardNumber: normalizeIdNumber(documentType, idNumber),
        dateOfBirth: dateOfBirth || previous?.dateOfBirth || null,
        address: address.trim() || previous?.address || null,
        documents: [...optimisticDocs, ...(previous?.documents ?? [])],
      });

      return { previous };
    },
    onSuccess: (result) => {
      setError("");
      setStep(1);
      setFrontUrl("");
      setBackUrl("");
      setSelfieUrl("");
      if (userId) {
        queryClient.setQueryData<KycStatusResponse>(
          queryKeys.kycStatus(userId),
          (prev) => ({
            customerId: result.customerId,
            kycLevel: prev?.kycLevel ?? 1,
            kycStatus: "pending",
            ghanaCardNumber: normalizeIdNumber(documentType, idNumber),
            dateOfBirth: dateOfBirth || prev?.dateOfBirth || null,
            address: address.trim() || prev?.address || null,
            documents: result.documents,
          }),
        );
        void queryClient.invalidateQueries({
          queryKey: queryKeys.userProfile(userId),
        });
      }
    },
    onError: (err: Error, _vars, context) => {
      if (userId && context?.previous) {
        queryClient.setQueryData(queryKeys.kycStatus(userId), context.previous);
      }
      setError(err.message || "Could not submit verification.");
    },
    onSettled: () => {
      if (userId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.kycStatus(userId),
        });
      }
    },
  });

  const capture = (
    field: "front" | "back" | "selfie",
    source: KycImageSource,
  ) => {
    void (async () => {
      try {
        setPicking(true);
        setError("");
        const uri = await pickKycImage(source, {
          square: field === "selfie",
          cameraType: field === "selfie" ? "front" : "back",
        });
        if (!uri) return;
        if (field === "front") setFrontUrl(uri);
        if (field === "back") setBackUrl(uri);
        if (field === "selfie") setSelfieUrl(uri);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not use photo.");
      } finally {
        setPicking(false);
      }
    })();
  };

  const openCapture = (field: "front" | "back" | "selfie") => {
    presentKycImageActions({
      title:
        field === "selfie"
          ? "Selfie"
          : field === "front"
            ? "ID front"
            : "ID back",
      message: "Use bright light. Keep text readable.",
      onCamera: () => capture(field, "camera"),
      onLibrary: () => capture(field, "library"),
    });
  };

  const goNextFromIdentity = () => {
    const idError = validateIdNumber(documentType, idNumber);
    if (idError) {
      setError(idError);
      return;
    }
    if (!dateOfBirth.trim()) {
      setError("Enter your date of birth (YYYY-MM-DD).");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim())) {
      setError("Date of birth must be YYYY-MM-DD.");
      return;
    }
    if (!address.trim()) {
      setError("Enter your residential address.");
      return;
    }
    if (!frontUrl) {
      setError("Upload the front of your ID.");
      return;
    }
    if (needsBack && !backUrl) {
      setError("Upload the back of your ID.");
      return;
    }
    setError("");
    setStep(2);
  };

  const goNextFromSelfie = () => {
    if (!selfieUrl) {
      setError("Add a clear selfie to match your ID.");
      return;
    }
    setError("");
    setStep(3);
  };

  if (statusQuery.isPending && !status) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (verified) {
    return (
      <View
        style={[
          styles.statusCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.statusIcon,
            { backgroundColor: homeChrome.growthSoft },
          ]}
        >
          <AppIcon name="badge-check" size={28} color={homeChrome.growthInk} />
        </View>
        <Text style={[styles.statusTitle, { color: colors.foreground }]}>
          You’re verified
        </Text>
        <Text style={[styles.statusBody, { color: colors.mutedForeground }]}>
          Your identity was approved. You can deposit and save with your group.
        </Text>
      </View>
    );
  }

  if (pending && !rejected) {
    return (
      <View
        style={[
          styles.statusCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.statusIcon,
            { backgroundColor: isDark ? "rgba(245,158,11,0.16)" : "#FFFBEB" },
          ]}
        >
          {submitMutation.isPending ? (
            <ActivityIndicator color="#D97706" size="large" />
          ) : (
            <AppIcon name="clock" size={26} color="#D97706" />
          )}
        </View>
        <Text style={[styles.statusTitle, { color: colors.foreground }]}>
          {submitMutation.isPending ? "Submitting…" : "Under review"}
        </Text>
        <Text style={[styles.statusBody, { color: colors.mutedForeground }]}>
          {submitMutation.isPending
            ? "Sending your documents securely. This only takes a moment."
            : "Your company admin is reviewing your documents. We’ll notify you when a decision is made."}
        </Text>
        {!submitMutation.isPending ? (
          <Button
            title="Refresh status"
            variant="outline"
            onPress={() => void statusQuery.refetch()}
          />
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      {rejected ? (
        <View
          style={[
            styles.banner,
            {
              backgroundColor: isDark ? "rgba(225,29,72,0.14)" : "#FFF1F2",
              borderColor: isDark ? "rgba(225,29,72,0.35)" : "#FECDD3",
            },
          ]}
        >
          <Text style={[styles.bannerTitle, { color: colors.destructive }]}>
            Verification was not approved
          </Text>
          <Text style={[styles.bannerBody, { color: colors.mutedForeground }]}>
            {rejectionReason ||
              "Please resubmit clearer photos of your ID and selfie."}
          </Text>
        </View>
      ) : null}

      <View style={styles.steps}>
        {[1, 2, 3].map((n) => {
          const active = step === n;
          const done = step > n;
          return (
            <View key={n} style={styles.stepItem}>
              <View
                style={[
                  styles.stepDot,
                  {
                    backgroundColor:
                      active || done
                        ? isDark
                          ? homeChrome.linkDark
                          : homeChrome.link
                        : colors.muted,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.stepDotText,
                    {
                      color: active || done ? "#fff" : colors.mutedForeground,
                    },
                  ]}
                >
                  {n}
                </Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  {
                    color: active ? colors.foreground : colors.mutedForeground,
                  },
                ]}
              >
                {n === 1 ? "ID" : n === 2 ? "Selfie" : "Review"}
              </Text>
            </View>
          );
        })}
      </View>

      {error ? (
        <Text style={[styles.error, { color: colors.destructive }]}>
          {error}
        </Text>
      ) : null}

      {step === 1 ? (
        <View style={styles.panel}>
          <Text style={[styles.panelTitle, { color: colors.foreground }]}>
            Choose your ID
          </Text>
          <View style={styles.docGrid}>
            {CUSTOMER_ID_OPTIONS.map((opt) => {
              const selected = documentType === opt.type;
              return (
                <Pressable
                  key={opt.type}
                  onPress={() => {
                    setDocumentType(opt.type);
                    setBackUrl("");
                  }}
                  style={[
                    styles.docTile,
                    {
                      backgroundColor: colors.card,
                      borderColor: selected
                        ? isDark
                          ? homeChrome.linkDark
                          : homeChrome.link
                        : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.docLabel, { color: colors.foreground }]}>
                    {opt.label}
                  </Text>
                  <Text
                    style={[styles.docHint, { color: colors.mutedForeground }]}
                  >
                    {opt.hint}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Input
            label="ID number"
            value={idNumber}
            onChangeText={setIdNumber}
            autoCapitalize="characters"
            placeholder={
              documentType === "ghana_card"
                ? "GHA-XXXXXXXXX-X"
                : "Enter ID number"
            }
          />
          <Input
            label="Date of birth"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            placeholder="YYYY-MM-DD"
            keyboardType="numbers-and-punctuation"
          />
          <Input
            label="Residential address"
            value={address}
            onChangeText={setAddress}
            placeholder="House / street, city"
          />

          <PhotoSlot
            label="Front of ID"
            uri={frontUrl}
            onPress={() => openCapture("front")}
            busy={picking}
          />
          {needsBack ? (
            <PhotoSlot
              label="Back of ID"
              uri={backUrl}
              onPress={() => openCapture("back")}
              busy={picking}
            />
          ) : null}

          <Button title="Continue" onPress={goNextFromIdentity} />
        </View>
      ) : null}

      {step === 2 ? (
        <View style={styles.panel}>
          <Text style={[styles.panelTitle, { color: colors.foreground }]}>
            Take a selfie
          </Text>
          <Text style={[styles.panelBody, { color: colors.mutedForeground }]}>
            Look straight at the camera in good light. No sunglasses or hat.
          </Text>
          <PhotoSlot
            label="Live selfie"
            uri={selfieUrl}
            onPress={() => openCapture("selfie")}
            busy={picking}
            tall
          />
          <View style={styles.rowActions}>
            <Button
              title="Back"
              variant="outline"
              onPress={() => setStep(1)}
              style={{ flex: 1 }}
            />
            <Button
              title="Continue"
              onPress={goNextFromSelfie}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      ) : null}

      {step === 3 ? (
        <View style={styles.panel}>
          <Text style={[styles.panelTitle, { color: colors.foreground }]}>
            Review & submit
          </Text>
          <View
            style={[
              styles.reviewCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <ReviewRow label="ID type" value={idTypeLabel(documentType)} />
            <ReviewRow
              label="ID number"
              value={normalizeIdNumber(documentType, idNumber)}
            />
            <ReviewRow label="Date of birth" value={dateOfBirth} />
            <ReviewRow label="Address" value={address} />
          </View>
          <View style={styles.previewRow}>
            {frontUrl ? (
              <Image source={{ uri: frontUrl }} style={styles.previewThumb} />
            ) : null}
            {backUrl ? (
              <Image source={{ uri: backUrl }} style={styles.previewThumb} />
            ) : null}
            {selfieUrl ? (
              <Image source={{ uri: selfieUrl }} style={styles.previewThumb} />
            ) : null}
          </View>
          <Text style={[styles.panelBody, { color: colors.mutedForeground }]}>
            Your company admin will review these documents. You’ll get a
            notification when they’re approved or if you need to resubmit.
          </Text>
          <View style={styles.rowActions}>
            <Button
              title="Back"
              variant="outline"
              onPress={() => setStep(2)}
              style={{ flex: 1 }}
            />
            <Button
              title="Submit for review"
              loading={submitMutation.isPending}
              onPress={() => submitMutation.mutate()}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.reviewRow}>
      <Text style={[styles.reviewLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      <Text style={[styles.reviewValue, { color: colors.foreground }]}>
        {value}
      </Text>
    </View>
  );
}

function PhotoSlot({
  label,
  uri,
  onPress,
  busy,
  tall,
}: {
  label: string;
  uri: string;
  onPress: () => void;
  busy?: boolean;
  tall?: boolean;
}) {
  const { colors, isDark } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      style={[
        styles.photoSlot,
        tall && styles.photoSlotTall,
        {
          backgroundColor: isDark ? colors.muted : "#F8FAFC",
          borderColor: colors.border,
        },
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={styles.photoPreview}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.photoEmpty}>
          {busy ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <AppIcon name="plus" size={22} color={colors.mutedForeground} />
              <Text
                style={[styles.photoLabel, { color: colors.mutedForeground }]}
              >
                {label}
              </Text>
            </>
          )}
        </View>
      )}
      {uri ? (
        <View style={styles.photoChange}>
          <Text style={styles.photoChangeText}>Change</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    paddingVertical: 48,
    alignItems: "center",
  },
  stack: {
    gap: spacing.md,
  },
  statusCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
  },
  statusIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  statusTitle: {
    fontFamily: typography.roles.headline,
    fontSize: typography.size.lg,
    textAlign: "center",
  },
  statusBody: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.sm,
    textAlign: "center",
    lineHeight: 20,
  },
  banner: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 6,
  },
  bannerTitle: {
    fontFamily: typography.roles.title,
    fontSize: typography.size.sm,
  },
  bannerBody: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
    lineHeight: 18,
  },
  steps: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  stepItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotText: {
    fontFamily: typography.roles.title,
    fontSize: 12,
  },
  stepLabel: {
    fontFamily: typography.roles.caption,
    fontSize: 11,
  },
  error: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
  },
  panel: {
    gap: spacing.md,
  },
  panelTitle: {
    fontFamily: typography.roles.headline,
    fontSize: typography.size.base,
  },
  panelBody: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
  docGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  docTile: {
    width: "48%",
    flexGrow: 1,
    borderWidth: 1.5,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 4,
    minWidth: 140,
  },
  docLabel: {
    fontFamily: typography.roles.title,
    fontSize: typography.size.sm,
  },
  docHint: {
    fontFamily: typography.roles.caption,
    fontSize: 11,
    lineHeight: 15,
  },
  photoSlot: {
    height: 148,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  photoSlotTall: {
    height: 220,
  },
  photoPreview: {
    width: "100%",
    height: "100%",
  },
  photoEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  photoLabel: {
    fontFamily: typography.roles.caption,
    fontSize: typography.size.xs,
  },
  photoChange: {
    position: "absolute",
    right: 10,
    bottom: 10,
    backgroundColor: "rgba(15,23,42,0.72)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  photoChangeText: {
    color: "#fff",
    fontFamily: typography.roles.title,
    fontSize: 11,
  },
  rowActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  reviewCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  reviewRow: {
    gap: 2,
  },
  reviewLabel: {
    fontFamily: typography.roles.caption,
    fontSize: 11,
  },
  reviewValue: {
    fontFamily: typography.roles.title,
    fontSize: typography.size.sm,
  },
  previewRow: {
    flexDirection: "row",
    gap: 8,
  },
  previewThumb: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
  },
});
