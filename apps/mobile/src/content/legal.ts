export interface LegalSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalDocument {
  title: string;
  updated: string;
  sections: LegalSection[];
  contactEmail: string;
}

export const TERMS_OF_SERVICE: LegalDocument = {
  title: "Terms of Service",
  updated: "June 2026",
  contactEmail: "hello@susuflow.com",
  sections: [
    {
      title: "1. Acceptance",
      paragraphs: [
        'By accessing or using Credo ("the Platform"), you agree to these Terms of Service. If you do not agree, do not use the Platform.',
      ],
    },
    {
      title: "2. Services",
      paragraphs: [
        "Credo provides software for digital susu savings management, including customer wallets, collector tools, staff dashboards, and payment gateway integrations. We do not hold customer funds. Deposits are processed through licensed payment providers.",
      ],
    },
    {
      title: "3. Accounts",
      paragraphs: [
        "You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. Susu companies are responsible for staff and collector access they grant within their tenant.",
      ],
    },
    {
      title: "4. Acceptable use",
      paragraphs: ["You may not use the Platform to:"],
      bullets: [
        "Commit fraud, money laundering, or illegal activity",
        "Attempt to bypass payment verification or ledger controls",
        "Interfere with Platform security or availability",
      ],
    },
    {
      title: "5. Fees",
      paragraphs: [
        "Subscription fees for susu companies are described on our Pricing page. Payment gateway fees may apply separately per your provider agreement.",
      ],
    },
    {
      title: "6. Limitation of liability",
      paragraphs: [
        'The Platform is provided "as is." To the extent permitted by law, Credo is not liable for indirect damages arising from use of the service or third-party payment failures.',
      ],
    },
    {
      title: "7. Contact",
      paragraphs: ["Questions about these terms:"],
    },
  ],
};

export const PRIVACY_POLICY: LegalDocument = {
  title: "Privacy Policy",
  updated: "June 2026",
  contactEmail: "hello@susuflow.com",
  sections: [
    {
      title: "1. Overview",
      paragraphs: [
        'Credo ("we") respects your privacy. This policy explains what data we collect when you use our website and application, and how we use it.',
      ],
    },
    {
      title: "2. Data we collect",
      bullets: [
        "Account information: name, email, phone, tenant affiliation",
        "Transaction data: deposit amounts, references, timestamps",
        "Technical data: IP address, device type, logs for security",
      ],
    },
    {
      title: "3. How we use data",
      paragraphs: ["We use your information to:"],
      bullets: [
        "Provide and improve the Platform",
        "Process and verify Mobile Money deposits",
        "Support customers and susu companies",
        "Meet legal and regulatory obligations",
      ],
    },
    {
      title: "4. Sharing",
      paragraphs: [
        "We share data with payment gateways (e.g. Hubtel) as needed to complete transactions. We do not sell personal data. We may disclose information when required by law.",
      ],
    },
    {
      title: "5. Security",
      paragraphs: [
        "We use encryption in transit, access controls, and audit logging. No system is 100% secure. Report concerns to hello@susuflow.com.",
      ],
    },
    {
      title: "6. Your rights",
      paragraphs: [
        "You may request access, correction, or deletion of your personal data subject to applicable law and our retention requirements for financial records.",
      ],
    },
    {
      title: "7. Changes",
      paragraphs: [
        "We may update this policy. Material changes will be posted on this page with an updated date.",
      ],
    },
  ],
};
