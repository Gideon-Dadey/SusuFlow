import { useState } from "react";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  AddressIllustration,
  CaptureIllustration,
  EmergencyContactIllustration,
  IdDocumentIllustration,
} from "@/components/auth/OnboardingIllustrations";
import { OnboardingStepLayout } from "@/components/auth/OnboardingStepLayout";

const STEPS = [
  {
    title: "Prepare your profile",
    description:
      "Have your full legal name, mobile number, and email ready. Use the same details your susu operator already has on file for you.",
    Illustration: IdDocumentIllustration,
  },
  {
    title: "Choose your susu company",
    description:
      "Every member belongs to one susu company on SusuFlow. Enter the company name from your invite or your group’s login details.",
    Illustration: AddressIllustration,
  },
  {
    title: "Review before you submit",
    description:
      "On the next screen you will set a password and send your details. Double-check spelling and phone digits so we can link the right wallet to you.",
    Illustration: CaptureIllustration,
  },
  {
    title: "Activate your account",
    description:
      "After signup, open the confirmation link we send to your email. Your wallet is created once verification is complete and you can sign in.",
    Illustration: EmergencyContactIllustration,
  },
] as const;

export default function RegisterIntroScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleBack = () => {
    if (step === 0) {
      router.replace("/(auth)/welcome");
      return;
    }
    setStep((value) => value - 1);
  };

  const handleNext = () => {
    if (isLast) {
      router.replace("/(auth)/register");
      return;
    }
    setStep((value) => value + 1);
  };

  return (
    <>
      <StatusBar style="light" />
      <OnboardingStepLayout
        title={current.title}
        description={current.description}
        illustration={<current.Illustration />}
        stepIndex={step}
        totalSteps={STEPS.length}
        actionLabel={isLast ? "Continue to signup" : "Continue"}
        onBack={handleBack}
        onNext={handleNext}
      />
    </>
  );
}
