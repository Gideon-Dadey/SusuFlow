/**
 * Curated in-app support answers. Never invent account balances or
 * reveal sensitive data — escalate those to human channels.
 */

export type SupportTopicId =
  | "general"
  | "deposits"
  | "withdrawals"
  | "kyc"
  | "security"
  | "goals";

export interface SupportTopic {
  id: SupportTopicId;
  title: string;
  subtitle: string;
  starter: string;
}

export interface SupportFaqEntry {
  id: string;
  topic: SupportTopicId;
  keywords: string[];
  question: string;
  answer: string;
}

export const SUPPORT_TOPICS: SupportTopic[] = [
  {
    id: "general",
    title: "SusuFlow app",
    subtitle: "Get help navigating the app",
    starter: "How do I use SusuFlow?",
  },
  {
    id: "deposits",
    title: "Deposits",
    subtitle: "Mobile money and payment help",
    starter: "How do I make a deposit?",
  },
  {
    id: "withdrawals",
    title: "Withdrawals",
    subtitle: "Payouts and timing",
    starter: "When can I withdraw?",
  },
  {
    id: "kyc",
    title: "Verification (KYC)",
    subtitle: "ID checks and account limits",
    starter: "How do I verify my identity?",
  },
  {
    id: "security",
    title: "Security & privacy",
    subtitle: "Passwords, lock, and safety",
    starter: "How do I keep my account safe?",
  },
  {
    id: "goals",
    title: "Savings goals",
    subtitle: "Plans and progress",
    starter: "How do savings goals work?",
  },
];

export const SUPPORT_FAQ: SupportFaqEntry[] = [
  {
    id: "deposit-how",
    topic: "deposits",
    keywords: ["deposit", "pay in", "top up", "mobile money", "momo"],
    question: "How do I make a deposit?",
    answer:
      "Open Deposit from the tab bar or Home quick actions. Choose an amount, pick your payment method, confirm the details, then complete payment with your mobile money provider. You’ll see status updates in Activity.",
  },
  {
    id: "withdraw-when",
    topic: "withdrawals",
    keywords: ["withdraw", "payout", "cash out", "transfer out"],
    question: "When can I withdraw?",
    answer:
      "Open Withdraw from Home quick actions or More. Enter the amount and destination, then confirm. Processing times depend on your group’s rules and the payment network — track progress under Activity.",
  },
  {
    id: "kyc-how",
    topic: "kyc",
    keywords: [
      "kyc",
      "verify",
      "verification",
      "identity",
      "id card",
      "ghana card",
    ],
    question: "How do I verify my identity?",
    answer:
      "Go to My Profile → Identity verification (or the KYC banner on Home). Upload clear photos of your ID and selfie as prompted. Verification protects your account and may unlock higher limits.",
  },
  {
    id: "security-safe",
    topic: "security",
    keywords: [
      "safe",
      "security",
      "password",
      "biometric",
      "lock",
      "otp",
      "fraud",
    ],
    question: "How do I keep my account safe?",
    answer:
      "Use a strong unique password, enable app lock / biometrics in Security settings, and never share OTPs or your client code. SusuFlow will never ask for your password over chat or WhatsApp.",
  },
  {
    id: "goals-how",
    topic: "goals",
    keywords: ["goal", "savings plan", "target", "enroll"],
    question: "How do savings goals work?",
    answer:
      "Open Goals from the tab bar or More, pick a plan that fits you, and enroll. Track progress on the Goals screen. Contributions follow your group’s collection schedule.",
  },
  {
    id: "general-nav",
    topic: "general",
    keywords: ["use", "navigate", "where", "find", "menu", "more", "help"],
    question: "How do I use SusuFlow?",
    answer:
      "Home shows your balance and quick actions. Use Deposit / Withdraw for money movement, Goals for plans, Activity for history, and More for Chat, Contact us, and Legal.",
  },
  {
    id: "balance-ask",
    topic: "general",
    keywords: ["balance", "how much", "account number", "client code"],
    question: "Can you tell me my balance?",
    answer:
      "For your security I can’t read live balances or account numbers in chat. Open Home to view your available balance (tap the eye to show/hide), or check Account for your masked client code.",
  },
];

const ESCALATE =
  "I couldn’t find a confident answer for that. Tap Contact support below to reach our team by email or WhatsApp. Never share passwords or OTPs here.";

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function answerSupportQuestion(
  raw: string,
  topicHint?: SupportTopicId,
): { answer: string; matchedId?: string; escalate: boolean } {
  const q = normalize(raw);
  if (!q) {
    return {
      answer:
        "Ask anything about deposits, withdrawals, verification, goals, or using SusuFlow. For live balances or personal account changes, check the app screens or contact support.",
      escalate: false,
    };
  }

  let best: { entry: SupportFaqEntry; score: number } | null = null;

  for (const entry of SUPPORT_FAQ) {
    if (topicHint && entry.topic !== topicHint && entry.topic !== "general") {
      // Still allow general matches when a topic is selected
    }
    let score = 0;
    for (const kw of entry.keywords) {
      if (q.includes(kw)) score += kw.length > 4 ? 3 : 2;
    }
    if (
      normalize(entry.question).includes(q) ||
      q.includes(normalize(entry.question).slice(0, 24))
    ) {
      score += 5;
    }
    if (topicHint && entry.topic === topicHint) score += 2;
    if (!best || score > best.score) best = { entry, score };
  }

  if (!best || best.score < 2) {
    return { answer: ESCALATE, escalate: true };
  }

  return {
    answer: best.entry.answer,
    matchedId: best.entry.id,
    escalate: false,
  };
}

export function greetingForName(name?: string) {
  const first = name?.trim().split(/\s+/)[0];
  return first ? `Hello ${first}` : "Hello";
}
