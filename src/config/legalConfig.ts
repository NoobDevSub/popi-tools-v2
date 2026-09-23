/**
 * Legal & Policy Configuration for POPI Tools
 *
 * NOTE FOR WEBSITE OPERATOR / DEVELOPER:
 * Replace placeholders marked with [ADD ...] before launching in production.
 * Do not invent fake registration numbers, GST numbers, or licenses.
 */

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export const LEGAL_CONFIG = {
  brandName: "POPI Tools",
  tagline: "AI-powered tools built for modern gamers",
  websiteUrl: "https://popitools.ai",
  lastUpdatedDate: "March 2025",
  effectiveDate: "March 15, 2025",

  // Business & Contact Placeholders (To be customized by business owner)
  businessOperator: {
    legalEntityName: "[ADD LEGAL BUSINESS NAME]",
    supportEmail: "[ADD SUPPORT EMAIL]",
    legalInquiryEmail: "[ADD LEGAL/PRIVACY EMAIL OR USE SUPPORT EMAIL]",
    grievanceOfficerName: "[ADD GRIEVANCE OFFICER NAME IF APPLICABLE]",
    registeredAddress: "[ADD BUSINESS ADDRESS IF REQUIRED]",
    country: "India",
    jurisdictionStateCity: "[ADD CITY/STATE, e.g., Bengaluru, Karnataka, India]",
    operatingHours: "Monday to Friday, 10:00 AM – 6:00 PM IST",
    responseTimeEstimate: "48 to 72 business hours",
  },

  // Operational Flags
  operations: {
    minimumAge: 18,
    minimumAgeWithParentalConsent: 13,
    supportsAutoRenewal: false, // Set to true if automatic recurring billing is enabled
    autoRenewalDetails:
      "Subscriptions do NOT currently auto-renew. Access expires at the end of the paid billing cycle unless manually repurchased by the user.",
    primaryCurrency: "INR (₹)",
    acceptedPaymentMethods: [
      "UPI (Google Pay, PhonePe, Paytm, BHIM)",
      "Indian & International Debit/Credit Cards via Gateway",
      "Net Banking",
      "Official Google Play In-App Billing (for mobile app versions)",
    ],
    thirdPartyProcessors: [
      "Authorized Payment Gateway (e.g., Razorpay / Cashfree / Stripe)",
      "Google Play Billing System (for Android app downloads)",
    ],
    aiServiceProviders: [
      "Google Gemini Cloud APIs (for natural language and smart gaming companion logic)",
    ],
    cloudHostingProviders: [
      "Google Cloud Platform (GCP)",
      "Firebase Firestore & Cloud Infrastructure",
    ],
  },

  // Pricing Plans (Dynamic source for Legal & Policy documentation)
  samplePricingPlans: [
    {
      id: "free",
      name: "Free Community",
      price: "₹0",
      period: "Forever",
      description: "Basic gaming AI assistance, companion moods, and community tips.",
      features: [
        "Core POPI Companion Face & Emotions",
        "Public community strategies",
        "Basic tactical notes",
        "Community Telegram access",
      ],
    },
    {
      id: "weekly",
      name: "Weekly Tactical Pass",
      price: "₹199",
      period: "per week",
      description: "Short-term competitive boost for tournaments and ranked weekends.",
      features: [
        "Full 38+ POPI companion moods & audio chimes",
        "Real-time game tactical callouts",
        "Priority AI response latency",
        "Direct Telegram support channel",
      ],
    },
    {
      id: "monthly",
      name: "Monthly Pro",
      price: "₹499",
      period: "per month",
      popular: true,
      description: "Our most popular tier for daily ranked players and streamers.",
      features: [
        "Everything in Weekly Tactical",
        "Custom mood presets & auto-switcher engine",
        "Advanced match analytics & predictions utility",
        "Cloud strategy synchronization",
        "Exclusive discord & early tool beta access",
      ],
    },
    {
      id: "yearly",
      name: "Annual Champion",
      price: "₹5,999",
      period: "per year",
      description: "Comprehensive annual subscription with maximum savings.",
      features: [
        "Everything in Monthly Pro",
        "Save over 20% compared to monthly renewal",
        "Dedicated VIP support escalation",
        "Unlimited custom strategy profiles",
      ],
    },
  ] as PricingPlan[],

  // Pre-Launch / Production Checklist for Developer & Admin
  adminChecklist: [
    {
      key: "business_name",
      label: "Legal Business Name",
      description: "Replace '[ADD LEGAL BUSINESS NAME]' with registered entity, proprietor, or LLP name.",
      status: "pending",
    },
    {
      key: "support_email",
      label: "Official Support & Grievance Email",
      description: "Set up a monitored email inbox for '[ADD SUPPORT EMAIL]' (e.g., support@popitools.ai).",
      status: "pending",
    },
    {
      key: "business_address",
      label: "Registered Business Address",
      description: "Add operational or registered office location for legal correspondence in India.",
      status: "pending",
    },
    {
      key: "payment_provider",
      label: "Third-Party Payment Gateway Integration",
      description: "Confirm integrated gateway (Razorpay, Cashfree, Google Play Billing) and verify merchant terms.",
      status: "pending",
    },
    {
      key: "subscription_model",
      label: "Actual Subscription & Auto-Renewal Model",
      description: "Verify if subscriptions are one-time fixed duration passes or recurring automatic subscriptions.",
      status: "verified",
    },
    {
      key: "cookie_providers",
      label: "Actual Cookie & Analytics Providers",
      description: "Ensure cookie disclosure accurately reflects cookies used (e.g. Firebase Auth, essential session).",
      status: "verified",
    },
    {
      key: "ai_providers",
      label: "Actual AI Engine Disclosures",
      description: "Disclose LLM / API providers (e.g. Google Gemini Cloud) and confirm no unauthorized training on user data.",
      status: "verified",
    },
    {
      key: "age_requirement",
      label: "Applicable Age Requirement",
      description: "Enforce 18+ requirement (or 13+ with guardian consent under applicable Indian laws).",
      status: "verified",
    },
    {
      key: "refund_process",
      label: "Refund Escalation Handling",
      description: "Confirm team escalation workflow for duplicate transactions or payment processing errors.",
      status: "verified",
    },
    {
      key: "dispute_jurisdiction",
      label: "Jurisdiction & Dispute Resolution",
      description: "Identify Indian city/state court jurisdiction for governing law terms.",
      status: "pending",
    },
  ],
};
