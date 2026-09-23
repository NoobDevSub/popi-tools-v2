import { LEGAL_CONFIG } from "../config/legalConfig";

export interface PolicySection {
  id: string;
  title: string;
  content: string;
  highlight?: boolean;
  warning?: boolean;
  subsections?: {
    id: string;
    subtitle: string;
    body: string;
    highlight?: boolean;
    warning?: boolean;
  }[];
}

export interface LegalPolicy {
  id: string;
  slug: string;
  name: string;
  shortTitle: string;
  iconClass: string;
  badge: string;
  summary: string;
  lastUpdated: string;
  keyHighlights: string[];
  sections: PolicySection[];
}

export const LEGAL_POLICIES: Record<string, LegalPolicy> = {
  privacy: {
    id: "privacy",
    slug: "privacy-policy",
    name: "Privacy Policy",
    shortTitle: "Privacy",
    iconClass: "fi fi-rr-shield-check",
    badge: "Data Protection",
    summary:
      "Explains how POPI Tools collects, uses, handles, safeguards, and respects your personal and technical data when using our gaming utilities and AI companion.",
    lastUpdated: LEGAL_CONFIG.lastUpdatedDate,
    keyHighlights: [
      "We never store sensitive payment information such as debit/credit card CVVs, full card numbers, or UPI PINs.",
      "AI processing occurs strictly to fulfill feature requests; your data is not sold to third-party advertisers.",
      "You maintain user rights regarding your account data, correction, and account closure under applicable laws.",
    ],
    sections: [
      {
        id: "privacy-introduction",
        title: "1. Introduction & Scope",
        content: `Welcome to POPI Tools ("we", "our", "us", or "${LEGAL_CONFIG.brandName}"). This Privacy Policy describes how we collect, store, use, disclose, and protect your information when you access our website (${LEGAL_CONFIG.websiteUrl}), mobile applications, interactive companion services, utilities, and related digital gaming tools (collectively, the "Services").

By accessing or using our Services, you acknowledge that you have read and understood this Privacy Policy. If you do not agree with our practices, please refrain from using or accessing POPI Tools. We operate in compliance with applicable Indian information technology and data protection regulations, including the Information Technology Act, 2000, and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and the Digital Personal Data Protection framework to the extent applicable.`,
      },
      {
        id: "privacy-info-we-collect",
        title: "2. Information We Collect",
        content: `We collect information necessary to provide, optimize, and protect our gaming utility platform. This information falls into the following categories:`,
        subsections: [
          {
            id: "privacy-personal-info",
            subtitle: "A. Information Voluntarily Provided by You",
            body: `• Account Details: When you register or authenticate (e.g., using Google Sign-In or manual account creation), we may receive your full name, email address, profile photo URL, and user identifier.
• User Preferences & Customization: Custom settings such as chosen POPI companion emotions, auto-switch timers, tactical audio chime preferences, and favorite game titles (e.g., Free Fire MAX, BGMI, PUBG Mobile, COD Mobile).
• User-Generated Input: Custom gaming notes, tactical voice/text prompt logs, strategies, feedback submissions, and communications sent to our support channels or community bots.`,
          },
          {
            id: "privacy-tech-info",
            subtitle: "B. Automatically Collected Technical & Usage Information",
            body: `• Device & Network Data: IP address, device model, operating system version, browser type, language preferences, and approximate geographical region (determined at the city or state level solely where technically necessary for latency reduction and regulatory compliance).
• Service Interaction & Telemetry: Access timestamps, features used, button interactions, tool execution durations, error logs, and crash traces necessary for platform reliability and debugging.
• Authentication Tokens: Secure Firebase Authentication session tokens used to maintain your active login status safely without transmitting passwords.`,
          },
          {
            id: "privacy-payment-info",
            subtitle: "C. Payment & Subscription Records",
            highlight: true,
            body: `POPI Tools DOES NOT collect, process, or store complete credit card numbers, debit card numbers, CVVs, net banking credentials, or UPI PINs. All monetary transactions are processed directly by certified third-party payment gateways (e.g., Razorpay, Cashfree, Stripe, or Google Play Billing). We receive only anonymized confirmation identifiers, subscription status, plan tier, transaction date, and currency amounts required to activate your digital access.`,
          },
        ],
      },
      {
        id: "privacy-how-we-use",
        title: "3. How We Use Your Information",
        content: `We process your data strictly for legitimate operational, security, and service delivery purposes, including:
• Providing, maintaining, and enhancing the POPI Tools digital features and companion animations.
• Processing your premium subscriptions, verifying payment confirmations, and provisioning tactical utility tiers.
• Authenticating account access and preventing duplicate or unauthorized logins.
• Providing responsive customer support, addressing bug reports, and sending critical service or security notices.
• Detecting, preventing, and combating fraudulent activities, reverse-engineering attempts, platform abuse, or malicious bot behavior.
• Analyzing aggregate, non-personally identifiable usage trends to optimize system performance, server capacity, and app responsiveness.
• Complying with applicable legal processes, law enforcement requests, and statutory requirements in India.`,
      },
      {
        id: "privacy-ai-processing",
        title: "4. Artificial Intelligence (AI) & Automated Processing",
        content: `POPI Tools integrates artificial intelligence and algorithmic models (such as cloud-hosted generative AI APIs) to provide real-time game assistance, contextual tactical tips, and companion dialogue responses.

• Purpose-Bound Processing: Content, prompts, and tactical queries submitted to our AI features are processed transiently to generate the immediate requested output.
• No Sale for Advertising: We do not sell your personal prompts or profile data to third-party data brokers or advertisers.
• Model Training: Unless explicitly disclosed and consented to by you in writing, POPI Tools does not use your private user documents or personal messages to train public AI foundation models.`,
      },
      {
        id: "privacy-data-sharing",
        title: "5. Data Sharing & Third-Party Disclosures",
        content: `We do not sell, rent, or trade your personal information. We may share technical or account data only in the following restricted circumstances:
• Cloud & Infrastructure Providers: Secure hosting, database, and authentication services provided by Google Cloud Platform (GCP) and Firebase.
• Payment Processors: Regulated banking partners and payment gateways for billing validation and fraud detection.
• AI Engine Providers: Enterprise AI inference infrastructure (e.g., Google Cloud Gemini APIs) strictly for generating requested gaming responses.
• Legal Obligations & Protection: When required by an applicable court order, subpoena, government agency, or statutory mandate under Indian law, or when necessary to protect the rights, property, and safety of POPI Tools, our users, or the general public.`,
      },
      {
        id: "privacy-security",
        title: "6. Data Security Safeguards",
        content: `We employ industry-standard technical and organizational security measures, including HTTPS/TLS encryption in transit, strict Firestore security rules, access control limitations, and tokenized authorization headers.

Important Security Acknowledgment: While we implement robust safeguards to protect your personal information, no method of transmission over the Internet or electronic storage is 100% immune from security breaches. We cannot warrant or guarantee absolute, invulnerable security.`,
      },
      {
        id: "privacy-retention",
        title: "7. Data Retention & Account Deletion",
        content: `We retain your personal information only for as long as reasonably necessary to fulfill the purposes outlined in this Privacy Policy, maintain active service subscriptions, comply with statutory tax and accounting requirements, and resolve potential legal disputes.

When an account is deleted or closed by the user, we permanently remove or anonymize associated personal identifiers within 30 to 45 business days, except where retention of specific transaction records is mandated by financial or regulatory law.`,
      },
      {
        id: "privacy-user-rights",
        title: "8. User Rights & Data Choices",
        content: `Subject to applicable Indian data protection legislation, you have the following rights regarding your personal information:
• Right of Access: You may view your registered account details directly inside the POPI Tools interface.
• Right to Rectification: You may update or correct inaccurate profile details at any time.
• Right to Erasure / Deletion: You may request the deletion of your account and personal data by contacting our legal desk.
• Right to Withdraw Consent: Where processing is based on consent, you may withdraw your consent at any time without affecting past lawful processing.
• Opt-Out of Marketing: You can opt out of non-essential promotional announcements through provided settings or Telegram preferences.`,
      },
      {
        id: "privacy-children",
        title: "9. Children's Online Privacy",
        content: `POPI Tools is not designed or directed to children under the age of 18 (or the applicable age of digital majority in your jurisdiction). Users between 13 and 18 years of age may access the platform only under the direct supervision and consent of a parent or legal guardian. We do not knowingly collect personal data from individuals under 13 years of age. If we learn that we have unintentionally collected information from a child without verified parental consent, we will promptly delete that data.`,
      },
      {
        id: "privacy-international",
        title: "10. Cross-Border Data Processing",
        content: `Our cloud servers, authentication pipelines, and AI processing nodes may be hosted on distributed infrastructure across India, the Asia-Pacific region, and global cloud data centers operated by tier-one providers like Google Cloud. By using our Services, you consent to the cross-border transfer and processing of your technical data in accordance with this Privacy Policy.`,
      },
      {
        id: "privacy-updates",
        title: "11. Updates to this Policy",
        content: `We reserve the right to revise or amend this Privacy Policy at our discretion to reflect technical enhancements, service changes, or regulatory developments. Any updates will be posted directly on this page with an updated "Last Updated" timestamp. Continued use of POPI Tools after modifications take effect constitutes acceptance of the revised policy.`,
      },
    ],
  },

  terms: {
    id: "terms",
    slug: "terms-and-conditions",
    name: "Terms & Conditions",
    shortTitle: "Terms",
    iconClass: "fi fi-rr-document-signed",
    badge: "User Agreement",
    summary:
      "The legally binding contract governing your access, account registration, acceptable conduct, and usage of POPI Tools digital features and subscriptions.",
    lastUpdated: LEGAL_CONFIG.lastUpdatedDate,
    keyHighlights: [
      "Accessing POPI Tools constitutes unconditional agreement to these terms and operational guidelines.",
      "POPI Tools does not guarantee gaming victories, ranked tier increases, or prediction accuracy.",
      "Unauthorized reverse-engineering, system scraping, or sharing of premium credentials is strictly prohibited.",
    ],
    sections: [
      {
        id: "terms-acceptance",
        title: "1. Acceptance of Terms",
        content: `These Terms & Conditions ("Terms") constitute a legally binding agreement between you ("User", "you", or "your") and ${LEGAL_CONFIG.brandName} (operated by ${LEGAL_CONFIG.businessOperator.legalEntityName}, "we", "us", or "our").

By browsing, downloading, registering for, accessing, or using POPI Tools and its associated websites, utilities, companion tools, and digital features, you confirm that you have read, understood, and agreed to be bound by these Terms. If you do not agree to all terms and conditions, you must immediately terminate your use of the Services.`,
      },
      {
        id: "terms-eligibility",
        title: "2. Eligibility & Legal Capacity",
        content: `To access or use POPI Tools, you represent and warrant that:
• You are at least ${LEGAL_CONFIG.operations.minimumAge} years of age, or if you are between ${LEGAL_CONFIG.operations.minimumAgeWithParentalConsent} and ${LEGAL_CONFIG.operations.minimumAge}, you are accessing the Services with the verified consent and active supervision of your parent or legal guardian.
• You possess the full legal capacity and competence to enter into a valid, binding contract under the Indian Contract Act, 1872.
• You are not barred or restricted from using our Services under any applicable laws or regulatory sanctions in your jurisdiction.`,
      },
      {
        id: "terms-account-responsibility",
        title: "3. Account Registration & User Obligations",
        content: `When you create an account or sign in using third-party providers (such as Google OAuth):
• You agree to provide true, accurate, current, and complete information.
• You are solely responsible for maintaining the confidentiality of your authentication credentials, session tokens, and connected devices.
• You assume full responsibility for all activities, tool executions, and communications that take place under your account.
• You must notify our support team immediately at ${LEGAL_CONFIG.businessOperator.supportEmail} if you suspect any unauthorized access, breach, or compromise of your account.`,
      },
      {
        id: "terms-service-description",
        title: "4. Scope of Digital Services & Feature Modifications",
        content: `POPI Tools provides digital gaming utilities, AI-assisted tactical information, predictive analytics calculations, interactive companion moods, and companion overlays designed to assist players in competitive titles (including Free Fire MAX, BGMI, PUBG Mobile, and Call of Duty Mobile).

We reserve the right, at any time and without prior notice or liability, to modify, update, enhance, suspend, limit, or discontinue any feature, tool, mood, or subscription offering to adapt to game client updates, technical requirements, or regulatory changes.`,
      },
      {
        id: "terms-ai-disclaimer",
        title: "5. AI-Generated Output & Prediction Notice",
        highlight: true,
        content: `POPI Tools utilizes computational logic and generative artificial intelligence models to synthesize gaming recommendations, sensitivity advice, tactical callouts, and strategy estimates.

• Probabilistic & Informational Nature: All AI-generated suggestions, callouts, and analytical predictions are provided strictly for entertainment, informational, and recreational purposes.
• No Guarantee of Accuracy: AI models may generate incomplete, delayed, outdated, or inaccurate advice. Users are solely responsible for independently verifying all gameplay decisions.
• Gaming Independence: POPI Tools does NOT guarantee any specific match result, winning streak, tournament qualification, headshot ratio, or financial gain.`,
      },
      {
        id: "terms-prohibited",
        title: "6. Prohibited Activities & Platform Abuse",
        warning: true,
        content: `You agree not to engage in any of the following unauthorized activities while using POPI Tools:
• Reverse Engineering: Decompiling, reverse engineering, disassembling, or extracting the underlying source code, algorithms, or proprietary face-tracking animations of POPI Tools.
• Automation & Scraping: Utilizing bots, spiders, automated scrapers, or programmatic routines to access, collect, or monitor our servers, APIs, or database records.
• Security Circumvention: Bypassing, disabling, tampering with, or probing our authentication gateways, rate limits, paywalls, or Firestore security rules.
• Credential Sharing: Sharing, renting, leasing, reselling, or distributing premium account credentials or subscription passes to unauthorized third parties.
• Malicious Code: Uploading or transmitting viruses, worms, Trojan horses, spyware, or harmful technical payloads.
• Unlawful Exploitation: Using the platform for any illegal purpose, money-laundering, unauthorized betting coordination, or in violation of local Indian state regulations regarding gaming.`,
      },
      {
        id: "terms-availability",
        title: "7. Service Availability & Scheduled Maintenance",
        content: `We strive to maintain high uptime and responsive performance; however, we do not guarantee uninterrupted, error-free, or continuous availability. Access to POPI Tools may be temporarily suspended or throttled due to scheduled maintenance, cloud infrastructure outages, upstream API changes, network failures, DDoS attacks, or events of force majeure outside our reasonable control. We bear no liability for any loss or inconvenience resulting from downtime.`,
      },
      {
        id: "terms-third-party",
        title: "8. Third-Party Platforms & Game Trademarks",
        content: `POPI Tools may integrate with, link to, or reference third-party platforms, APIs, and gaming ecosystems (including Google Play, Telegram, Discord, and third-party game titles).

All trademarks, game titles, logos, and character designs (e.g., Free Fire, Battlegrounds Mobile India, PUBG, Call of Duty) remain the exclusive intellectual property of their respective owners (e.g., Garena, Krafton, Tencent, Activision). The mention of third-party games on POPI Tools is solely for nominative fair-use identification and compatibility description, and does not imply sponsorship, affiliation, or endorsement.`,
      },
      {
        id: "terms-limitation",
        title: "9. Limitation of Liability",
        content: `To the fullest extent permitted by applicable law, neither ${LEGAL_CONFIG.brandName}, its founders, operators, employees, nor agents shall be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, gameplay ranking, in-game assets, data loss, device malfunction, or goodwill, arising out of or related to your use of or inability to use POPI Tools.

In any event, our total aggregate liability arising out of any claim shall not exceed the actual amount paid by you to POPI Tools for the specific subscription tier during the thirty (30) days preceding the incident.`,
      },
      {
        id: "terms-governing-law",
        title: "10. Governing Law & Dispute Resolution",
        content: `These Terms shall be governed by and construed in accordance with the substantive laws of India, without giving effect to any principles of conflicts of law.

Any dispute, controversy, or claim arising out of or relating to these Terms, including validity, interpretation, or breach, shall be subject to the exclusive jurisdiction of the competent courts located in ${LEGAL_CONFIG.businessOperator.jurisdictionStateCity}.`,
      },
    ],
  },

  refunds: {
    id: "refunds",
    slug: "refund-and-cancellation-policy",
    name: "Refund & Cancellation Policy",
    shortTitle: "Refunds",
    iconClass: "fi fi-rr-undo",
    badge: "Consumer Policy",
    summary:
      "Important disclosure regarding the non-refundable nature of digital passes, premium features, duplicate charge reporting, and subscription cancellations.",
    lastUpdated: LEGAL_CONFIG.lastUpdatedDate,
    keyHighlights: [
      "Payments for digital products, premium features, and subscriptions are non-refundable once digital access is provisioned.",
      "Subscriptions do not qualify for refunds due to change of mind, lack of usage, or subjective gaming results.",
      "Legitimate billing errors or duplicate transactions are investigated and resolved within 5 to 7 business days.",
    ],
    sections: [
      {
        id: "refunds-core-policy",
        title: "1. Core Digital Product Refund Policy",
        highlight: true,
        content: `PLEASE READ THIS CAREFULLY PRIOR TO COMPLETING ANY PURCHASE:

PAYMENTS FOR DIGITAL PRODUCTS, PREMIUM FEATURES, AND SUBSCRIPTIONS ARE NON-REFUNDABLE EXCEPT WHERE A REFUND IS MANDATED BY APPLICABLE LAW OR EXPRESSLY APPROVED IN WRITING BY POPI TOOLS.

Because POPI Tools delivers instant, intangible digital utility access, computational AI processing, and proprietary software features immediately upon payment confirmation, the digital performance begins immediately. Once digital credentials, companion moods, or premium utilities have been provisioned to your account, the transaction is deemed fully consumed and final.`,
      },
      {
        id: "refunds-non-eligible",
        title: "2. Ineligible Refund Scenarios",
        warning: true,
        content: `Under our operational policy and industry standards for digital software, refunds WILL NOT be granted for any of the following reasons:
• Change of Mind: Deciding you no longer wish to use POPI Tools after purchasing.
• Non-Usage: Failing to log in, launch, or actively use the purchased tools or companion features during the subscription period.
• Subjective Gaming Expectations: Dissatisfaction with in-game match results, personal rank progression, or subjective gaming performance.
• AI Output Disappointment: Expectations that AI predictions or tactical suggestions would guarantee specific competitive outcomes.
• Forgot to Cancel: Claiming that you forgot your subscription validity period or forgot to cancel prior to renewal (where auto-renewal is activated).
• Game Client Updates: Temporary maintenance or meta balance updates introduced by third-party game publishers (e.g., Garena, Krafton).
• Device Incompatibility: Purchasing a plan without verifying device, OS, or internet connection requirements clearly detailed on our platform.`,
      },
      {
        id: "refunds-duplicate-charges",
        title: "3. Duplicate Charges & Technical Billing Errors",
        content: `If you believe you have experienced a technical billing anomaly or duplicate charge for the same transaction:
1. Gather Evidence: Locate the transaction IDs, payment gateway receipts (Razorpay/Stripe/UPI reference numbers), and timestamp of the transaction.
2. Contact Support Promptly: Send an email to ${LEGAL_CONFIG.businessOperator.supportEmail} within forty-eight (48) hours of the incident with the subject line "URGENT: Duplicate Billing Investigation".
3. Verification & Resolution: Our financial audit desk will review the gateway logs. If a confirmed double-charge occurred due to a gateway timeout or network failure, the surplus charge will be credited back to your original payment source within 5 to 7 business days, subject to your banking institution's standard clearance timelines.`,
      },
      {
        id: "refunds-unauthorized",
        title: "4. Suspected Unauthorized Transactions",
        content: `If you observe an unauthorized charge originating from POPI Tools on your bank statement:
• Immediately contact your issuing bank or UPI application to freeze any compromised payment instrument.
• Notify us at ${LEGAL_CONFIG.businessOperator.supportEmail} with transaction identifiers and time stamps so our fraud prevention team can immediately blacklist and suspend the fraudulent session.
• Fraudulent claims are investigated in accordance with Indian banking norms and Reserve Bank of India (RBI) guidelines on digital payment transactions.`,
      },
      {
        id: "refunds-cancellation",
        title: "5. Subscription Cancellation Procedure",
        content: `• Fixed Duration Passes: If you purchased a fixed-term pass (such as a 7-day or 30-day access pass that does not auto-renew), your access will automatically terminate at the conclusion of that period without requiring manual cancellation.
• Recurring Subscriptions (If Activated): Where automatic recurring renewal is explicitly enabled, you may cancel future renewals at any time via your account settings dashboard or through your Google Play subscription management console.
• Effect of Cancellation: Cancellation stops future billing charges from being levied. Cancellation does NOT generate a retroactive refund for the days remaining in your current paid cycle; your premium features remain accessible until the end of your active billing period.`,
      },
      {
        id: "refunds-statutory",
        title: "6. Statutory Consumer Protection Rights",
        content: `Nothing in this Refund & Cancellation Policy is intended to exclude, limit, or modify any statutory rights or guarantees that cannot be lawfully excluded under applicable Indian consumer protection laws. Where an applicable statute mandates a refund under specific circumstances, POPI Tools will comply fully with that statutory mandate.`,
      },
    ],
  },

  payments: {
    id: "payments",
    slug: "payment-and-subscription-policy",
    name: "Payment & Subscription Policy",
    shortTitle: "Payments",
    iconClass: "fi fi-rr-credit-card",
    badge: "Billing Terms",
    summary:
      "Details pricing structures, accepted payment channels (UPI, Cards, Net Banking), billing schedules, auto-renewal terms, and payment processor disclosures.",
    lastUpdated: LEGAL_CONFIG.lastUpdatedDate,
    keyHighlights: [
      "All pricing is clearly displayed in Indian Rupees (INR) with applicable taxes disclosed before checkout.",
      "Subscriptions currently operate on a fixed-pass model and do NOT auto-renew without explicit affirmative consent.",
      "Transactions are processed securely via RBI-compliant payment gateways; sensitive card data is never stored by POPI.",
    ],
    sections: [
      {
        id: "payments-pricing-plans",
        title: "1. Transparent Pricing & Tier Structure",
        content: `POPI Tools provides tiered access options to cater to casual gamers, competitive ranked grinders, and esports creators. Pricing is displayed transparently on our platform prior to purchase confirmation.

Current Sample Subscription Tiers (Configurable):
• ${LEGAL_CONFIG.samplePricingPlans[0].name}: ${LEGAL_CONFIG.samplePricingPlans[0].price} (${LEGAL_CONFIG.samplePricingPlans[0].period}) — ${LEGAL_CONFIG.samplePricingPlans[0].description}
• ${LEGAL_CONFIG.samplePricingPlans[1].name}: ${LEGAL_CONFIG.samplePricingPlans[1].price} (${LEGAL_CONFIG.samplePricingPlans[1].period}) — ${LEGAL_CONFIG.samplePricingPlans[1].description}
• ${LEGAL_CONFIG.samplePricingPlans[2].name}: ${LEGAL_CONFIG.samplePricingPlans[2].price} (${LEGAL_CONFIG.samplePricingPlans[2].period}) — ${LEGAL_CONFIG.samplePricingPlans[2].description}
• ${LEGAL_CONFIG.samplePricingPlans[3].name}: ${LEGAL_CONFIG.samplePricingPlans[3].price} (${LEGAL_CONFIG.samplePricingPlans[3].period}) — ${LEGAL_CONFIG.samplePricingPlans[3].description}

We reserve the right to modify subscription fees or introduce promotional discounts at any time. Any fee adjustments will only apply to subsequent purchases or renewal cycles, never retroactively to an already-paid period.`,
      },
      {
        id: "payments-methods",
        title: "2. Accepted Payment Methods & Gateways",
        content: `We support multiple certified payment instruments through our integrated payment aggregators:
• Unified Payments Interface (UPI): Seamless instant payments via Google Pay, PhonePe, Paytm, BHIM, and bank UPI apps.
• Credit & Debit Cards: Visa, MasterCard, RuPay, and American Express processed via tokenized PCI-DSS Level 1 compliant gateway partners.
• Net Banking: Major Indian commercial and nationalized banks.
• Official App Store Billing: When downloading POPI Tools through the Google Play Store, purchases are handled directly through Google Play In-App Billing.

Under no circumstances does POPI Tools collect, view, or store complete credit card numbers, CVVs, or UPI PINs on our servers.`,
      },
      {
        id: "payments-auto-renewal",
        title: "3. Auto-Renewal Terms & Status",
        highlight: true,
        content: `STATUS OF AUTO-RENEWAL ON POPI TOOLS:
${LEGAL_CONFIG.operations.autoRenewalDetails}

• Manual Repurchase Model: Unless explicitly designated as a recurring subscription at the point of checkout, subscription passes function as one-time prepaid packages for the selected duration (e.g., 7 days, 30 days, or 365 days).
• Notification of Expiry: Your interface will display remaining days of validity. Once the duration concludes, your account gracefully reverts to the Free Community Tier until you voluntarily initiate a new purchase.
• If Auto-Renewal is Enabled in Future: If an automatic recurring billing model is introduced, we will clearly state the billing frequency, renewal price, cancellation method, and send an advance notification before charging your payment method.`,
      },
      {
        id: "payments-failed",
        title: "4. Failed & Incomplete Payments",
        content: `If a payment fails due to insufficient funds, banking downtime, expired cards, or gateway timeouts:
• Digital premium privileges will not be provisioned or will be placed on hold until successful transaction settlement.
• Any temporary authorization holds placed by your bank will automatically reverse within your bank's normal settlement window (typically 24 to 72 hours).
• POPI Tools is not liable for overdraft fees or foreign exchange conversion fees levied by your financial institution.`,
      },
      {
        id: "payments-taxes",
        title: "5. Taxes & Invoicing",
        content: `Prices displayed on POPI Tools are inclusive or exclusive of applicable Goods and Services Tax (GST) as specified during the checkout summary screen. A digital tax invoice or payment acknowledgment receipt is generated electronically and made available to your registered email upon request.`,
      },
    ],
  },

  disclaimer: {
    id: "disclaimer",
    slug: "disclaimer",
    name: "Disclaimer & Risk Notice",
    shortTitle: "Disclaimer",
    iconClass: "fi fi-rr-triangle-warning",
    badge: "Risk Notice",
    summary:
      "Essential disclosures confirming that POPI Tools does not guarantee gaming outcomes, financial profits, or tournament wins, and complies with Indian skill gaming laws.",
    lastUpdated: LEGAL_CONFIG.lastUpdatedDate,
    keyHighlights: [
      "POPI Tools provides informational, analytical, and entertaining utilities; it is NOT financial advice or a win guarantee.",
      "Gameplay outcomes involve randomness, player skill, and external game balance outside of our control.",
      "Users must comply with all local, state, and national laws regarding gaming and digital applications.",
    ],
    sections: [
      {
        id: "disclaimer-general",
        title: "1. General Informational Nature",
        highlight: true,
        content: `The information, utilities, companion reactions, predictive estimates, and tactical callouts provided on POPI Tools are provided strictly on an "AS IS" and "AS AVAILABLE" basis for informational, recreational, and entertainment purposes only.

Nothing provided by or through POPI Tools should ever be construed as:
• Guaranteed winning techniques or guaranteed competitive success.
• Financial, investment, gambling, or legal advice.
• Certified tournament coaching or officially sanctioned publisher tools.
• Infallible predictions of real-time server actions, player actions, or random number generator (RNG) loot outcomes.`,
      },
      {
        id: "disclaimer-gaming-outcomes",
        title: "2. No Guarantee of Gaming Outcomes",
        content: `Competitive mobile titles (including Free Fire MAX, BGMI, PUBG Mobile, and COD Mobile) are multifaceted environments determined by individual player reflexes, device latency, ping, internet stability, teammate coordination, game server tick-rates, and frequent publisher patch updates.

POPI Tools explicitly disclaims any representation or warranty that:
• Using our companion will increase your kill-to-death (K/D) ratio, tier ranking, or tournament performance.
• AI predictions will predict opponent positions or circle movements with 100% precision.
• Gaming scripts, macros, or illegal mods are provided (POPI Tools does NOT provide hacks, aimbots, or memory modifiers that violate game publisher terms of service).`,
      },
      {
        id: "disclaimer-legal-compliance",
        title: "3. Compliance with Local Laws & Gambling Prohibition",
        warning: true,
        content: `POPI Tools is a gaming companion platform and DOES NOT conduct, promote, facilitate, or host real-money wagering, sports betting, or unlawful gambling.

• User Responsibility: You are exclusively responsible for verifying that your use of gaming tools and competitive video games complies with the local laws of your jurisdiction.
• State-Specific Regulations in India: Certain Indian states (including Assam, Odisha, Telangana, Nagaland, Andhra Pradesh, and Sikkim) have enacted distinct statutory frameworks governing games of skill, digital gaming, or prize competitions. You must refrain from utilizing our platform if doing so contradicts the local laws applicable in your state or territory.`,
      },
      {
        id: "disclaimer-third-party-endorsement",
        title: "4. No Publisher Affiliation",
        content: `POPI Tools is an independent project. It is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Garena, Krafton, Tencent Games, Activision Blizzard, Google LLC, or any of their subsidiaries or affiliates.

The official websites and trademarks of respective game titles belong entirely to their registered proprietors. Mention of specific games on POPI Tools is solely for functional context and compatibility reference.`,
      },
    ],
  },

  cookies: {
    id: "cookies",
    slug: "cookie-policy",
    name: "Cookie Policy",
    shortTitle: "Cookies",
    iconClass: "fi fi-rr-cookie",
    badge: "Web Storage",
    summary:
      "Explains our usage of essential cookies, local storage, session state, and analytics tokens required to keep you signed in and maintain your companion settings.",
    lastUpdated: LEGAL_CONFIG.lastUpdatedDate,
    keyHighlights: [
      "We use strictly essential cookies and local storage tokens to keep you securely signed in via Firebase Auth.",
      "Preferences like companion volume, audio chimes, and active moods are saved locally in your browser storage.",
      "We do NOT use intrusive cross-site third-party advertising cookies that track your browsing on other websites.",
    ],
    sections: [
      {
        id: "cookies-what-are-they",
        title: "1. What are Cookies and Local Storage?",
        content: `Cookies are small text files stored on your device (computer, tablet, or smartphone) when you visit websites. Local storage and session storage are modern web browser mechanisms that permit web applications to store data locally within the user's browser securely and efficiently.

In this policy, the term "Cookies" collectively refers to standard browser cookies, HTML5 local storage, session storage, and similar web storage technologies used by POPI Tools.`,
      },
      {
        id: "cookies-categories",
        title: "2. Categories of Storage We Use",
        content: `POPI Tools utilizes only limited, purposeful categories of storage:`,
        subsections: [
          {
            id: "cookies-essential",
            subtitle: "A. Strictly Necessary & Authentication Cookies",
            highlight: true,
            body: `These tokens are essential for the operation of POPI Tools. They include Firebase Authentication session state, security anti-CSRF headers, and login tokens. Without these, you would be unable to log in, customize moods, or access your paid subscription features.`,
          },
          {
            id: "cookies-preferences",
            subtitle: "B. User Preference & Companion State Storage",
            body: `We store your active POPI companion emotion (e.g., Happy, Angry, Focus, Chill), auto-switch interval settings, chime sound preferences, and visual theme choices locally in your browser's localStorage. This ensures your customized companion setup remains active between browser reloads.`,
          },
          {
            id: "cookies-analytics",
            subtitle: "C. Performance & Diagnostic Storage",
            body: `Anonymous diagnostic telemetry and error crash logs used to identify browser rendering issues, mobile viewport clipping, or API latency spikes. These metrics are strictly aggregated and do not identify you as a unique individual.`,
          },
        ],
      },
      {
        id: "cookies-no-ads",
        title: "3. No Third-Party Advertising Cookies",
        content: `POPI Tools does not employ intrusive third-party behavioral advertising networks or retargeting pixels (such as Facebook Pixel or cross-domain ad brokers). We do not monetize your browsing history across the web.`,
      },
      {
        id: "cookies-management",
        title: "4. How You Can Manage Cookies",
        content: `Most modern web browsers allow you to manage, block, or clear cookies and local storage through browser settings:
• Chrome: Settings > Privacy and Security > Third-Party Cookies / Site Data
• Firefox: Preferences > Privacy & Security > Cookies and Site Data
• Safari: Preferences > Privacy > Manage Website Data
• Edge: Settings > Cookies and site permissions

Please Note: If you completely disable or delete strictly necessary cookies and local storage, key features of POPI Tools (including Google OAuth sign-in, cloud mood saving, and subscription validation) will cease to function properly.`,
      },
    ],
  },

  acceptable_use: {
    id: "acceptable_use",
    slug: "acceptable-use-policy",
    name: "Acceptable Use Policy",
    shortTitle: "Acceptable Use",
    iconClass: "fi fi-rr-shield-exclamation",
    badge: "Community Rules",
    summary:
      "Outlines strict rules of conduct, prohibitions against cheating software, security attacks, hate speech, and outlines penalties for violation.",
    lastUpdated: LEGAL_CONFIG.lastUpdatedDate,
    keyHighlights: [
      "Zero tolerance for game memory hacking, distributing game exploits, malware, or illicit botting software.",
      "Strict prohibition against harassment, hate speech, or abuse towards fellow community members and developers.",
      "Violations result in immediate subscription termination and permanent account blacklisting without refund.",
    ],
    sections: [
      {
        id: "aup-purpose",
        title: "1. Purpose & Core Philosophy",
        content: `POPI Tools is built to empower competitive gamers with intelligent tactical companions, statistical insights, and an enthusiastic community. This Acceptable Use Policy ("AUP") defines the boundaries of permissible conduct when using our website, tools, Discord/Telegram community hubs, and application programming interfaces (APIs).`,
      },
      {
        id: "aup-prohibited-conduct",
        title: "2. Prohibited Conduct & Unlawful Actions",
        warning: true,
        content: `When accessing or using POPI Tools, you must NOT directly or indirectly:
• Illegal Acts: Engage in, coordinate, or promote any activity that violates the Indian Penal Code, Information Technology Act, 2000, or any applicable municipal, state, or federal law.
• Harmful Exploits & Memory Modification: Distribute, promote, or request malicious game modifications (such as aimbots, wallhacks, APK memory injections, or network lag switches) designed to bypass anti-cheat systems of games like Free Fire or BGMI.
• System Interference: Launch Denial of Service (DoS/DDoS) attacks, flood our API endpoints, inject SQL/NoSQL payload exploits, or overload server capacity.
• Impersonation & Fraud: Impersonate POPI Tools staff, moderators, or another user, or engage in social engineering schemes to extract personal information or UPI payments.
• Harassment & Abusive Content: Broadcast hate speech, threats of physical harm, harassment, defamation, obscenity, or non-consensual personal information (doxxing).
• Unauthorized Reselling: Resell access tokens, bulk scrape proprietary companion assets, or repackage our UI inside unauthorized clone websites.`,
      },
      {
        id: "aup-enforcement",
        title: "3. Monitoring, Suspension & Penalties",
        content: `We actively monitor platform logs and telemetry for anomalous activity patterns, credential stuffing, and abusive automated requests.

If a User is found to have violated this Acceptable Use Policy:
• Immediate Suspension: We may instantly revoke API tokens and suspend account access without prior warning.
• Permanent Blacklisting: Egregious violations (including hacking attempts, fraud, or hate speech) will result in permanent hardware, IP, and account bans.
• Forfeiture of Fees: Any active subscription or prepaid pass associated with a banned account is immediately forfeited without entitlement to any refund.
• Legal Action: We reserve the right to report unlawful cybercrimes to law enforcement authorities in India (including the Cyber Crime Cell and CERT-In).`,
      },
    ],
  },

  intellectual_property: {
    id: "intellectual_property",
    slug: "intellectual-property-policy",
    name: "Intellectual Property Policy",
    shortTitle: "Intellectual Property",
    iconClass: "fi fi-rr-copyright",
    badge: "Copyright & IP",
    summary:
      "Clarifies ownership of POPI Tools brand assets, source code, interactive face designs, user-generated content, and third-party fair use trademarks.",
    lastUpdated: LEGAL_CONFIG.lastUpdatedDate,
    keyHighlights: [
      "POPI Tools, the robot companion visual designs, UI layouts, and animations are proprietary property.",
      "Users are granted a limited, personal, non-transferable, revocable license to access the platform.",
      "All third-party video game trademarks mentioned remain the exclusive property of their respective holders.",
    ],
    sections: [
      {
        id: "ip-ownership",
        title: "1. Proprietary Assets of POPI Tools",
        content: `All elements comprising POPI Tools—including but not limited to the brand name "${LEGAL_CONFIG.brandName}", logos, interactive vector companion face designs, custom animations, website copy, audio chimes, software source code, compiled binaries, and user interfaces—are the proprietary intellectual property of ${LEGAL_CONFIG.businessOperator.legalEntityName} and are protected under Indian and international copyright, trademark, trade dress, and intellectual property laws.`,
      },
      {
        id: "ip-license",
        title: "2. Limited License Granted to Users",
        content: `Subject to your continuous compliance with our Terms & Conditions, POPI Tools grants you a revocable, non-exclusive, non-transferable, non-sublicensable, personal license to view, use, and interact with the platform and its digital utilities solely for your personal, non-commercial entertainment and competitive gaming improvement.

You may NOT:
• Copy, duplicate, reproduce, or mirror the POPI companion interface, animations, or code.
• Create derivative works or commercial clones based on our software architecture.
• Remove, obscure, or alter any copyright notices, watermarks, or digital signatures affixed to our materials.`,
      },
      {
        id: "ip-user-content",
        title: "3. User-Generated Content & Strategies",
        content: `You retain all ownership rights in any notes, strategy templates, or custom gameplay text that you create and upload to POPI Tools.

By submitting content to public community areas (such as public strategy boards or shared presets), you grant POPI Tools a non-exclusive, worldwide, royalty-free license to store, display, format, and distribute that specific content across our platform solely for enabling feature functionality. You represent that your uploaded content does not infringe the copyright, privacy, or proprietary rights of any third party.`,
      },
      {
        id: "ip-third-party-trademarks",
        title: "4. Third-Party Game Trademarks & Nominative Fair Use",
        content: `Garena®, Free Fire®, Krafton®, Battlegrounds Mobile India / BGMI®, PUBG®, Call of Duty®, Activision®, and related logos are registered trademarks of their respective corporate owners.

The use of these names and game titles on POPI Tools is strictly for nominative fair use—specifically to inform users regarding game compatibility, tactical metadata, and recommended companion settings. POPI Tools does not claim any ownership, partnership, or co-branding with these entities.`,
      },
      {
        id: "ip-takedown",
        title: "5. Notice and Takedown Procedure (DMCA / Indian Copyright Act)",
        content: `If you are a copyright owner or an authorized agent and believe that any material available on POPI Tools infringes your intellectual property, please submit an infringement notice to our legal inbox:
• Email: ${LEGAL_CONFIG.businessOperator.legalInquiryEmail}
• Subject Line: "Copyright Infringement Notice - Attention Legal Desk"
• Required Details: (a) Identification of the copyrighted work claimed to be infringed; (b) Direct URL/location of the allegedly infringing material; (c) Sufficient contact details; (d) A statement of good-faith belief; and (e) An electronic or physical signature of the authorized copyright holder.`,
      },
    ],
  },

  security: {
    id: "security",
    slug: "account-and-security-policy",
    name: "Account & Security Policy",
    shortTitle: "Security",
    iconClass: "fi fi-rr-lock",
    badge: "Platform Hardening",
    summary:
      "Details account hygiene requirements, multi-factor authentication, security monitoring, prompt reporting of compromises, and vulnerability disclosures.",
    lastUpdated: LEGAL_CONFIG.lastUpdatedDate,
    keyHighlights: [
      "Users must safeguard Google OAuth sessions and refrain from credential sharing or public session leaks.",
      "Automated threat detection mechanisms instantly block anomalous concurrent logins and credential stuffing.",
      "Suspected account compromises must be escalated to support immediately for protective freezing.",
    ],
    sections: [
      {
        id: "sec-user-hygiene",
        title: "1. Account Security & Credential Protection",
        content: `Maintaining the security of your account is a joint responsibility. As a registered user of POPI Tools:
• Secure Login Credentials: You must use strong, unique authentication credentials and maintain active security on your linked Google Account.
• Prohibited Account Sharing: Subscriptions and premium passes are issued on a single-user basis. Sharing your account credentials or session tokens with friends, tournament squads, or public forums is strictly prohibited and triggers automated security lockouts.
• Safe Device Usage: Always ensure you log out of public, shared, or gaming cafe devices after using POPI Tools.`,
      },
      {
        id: "sec-monitoring",
        title: "2. Technical Security Hardening & Monitoring",
        content: `POPI Tools incorporates defense-in-depth security principles across all layers of our digital stack:
• Strict Firestore Security Rules: Database read/write operations are cryptographically restricted so users can only view and update their own authenticated profile and private notes.
• Transport Layer Security (TLS): All data exchanged between your browser and our servers is encrypted using modern TLS 1.3/HTTPS cryptographic standards.
• Rate Limiting & Anti-Abuse: Intelligent Cloud Armor and application rate-limiters throttle anomalous burst requests to safeguard system stability.
• Regular Patching: We continuously update underlying dependencies, Vite runtimes, and Firebase SDKs to eliminate known CVE vulnerabilities.`,
      },
      {
        id: "sec-breach-response",
        title: "3. Incident Response & Reporting Compromises",
        content: `If you suspect that your account has been breached, or if you notice unauthorized profile adjustments:
1. Immediately change the password of your linked Google Account and revoke third-party app permissions.
2. Email our security escalation desk at ${LEGAL_CONFIG.businessOperator.supportEmail} with the subject "URGENT: Security Incident Report".
3. We will immediately terminate all active sessions, invalidate active tokens, and guide you through secure identity verification to restore control.`,
      },
      {
        id: "sec-responsible-disclosure",
        title: "4. Responsible Vulnerability Disclosure",
        content: `We welcome ethical security researchers who wish to test our public web application. If you discover a security vulnerability:
• Report it privately to ${LEGAL_CONFIG.businessOperator.legalInquiryEmail} with clear reproduction steps and proof-of-concept logs.
• Do not publicly disclose or publish details of the vulnerability before we have investigated and deployed a remediation patch.
• Do not access, view, or alter data belonging to other users during testing.
• Do not perform DoS/DDoS attacks, social engineering, or physical penetration testing.`,
      },
    ],
  },

  contact: {
    id: "contact",
    slug: "legal-contact-information",
    name: "Contact & Legal Information",
    shortTitle: "Contact",
    iconClass: "fi fi-rr-envelope",
    badge: "Official Desk",
    summary:
      "Official operational, grievance redressal, and regulatory communication channels for POPI Tools under Indian Information Technology rules.",
    lastUpdated: LEGAL_CONFIG.lastUpdatedDate,
    keyHighlights: [
      "Official point of contact for customer support, billing inquiries, and statutory legal grievances in India.",
      "Dedicated response SLA: Legal and grievance inquiries are acknowledged within 48 to 72 business hours.",
      "Placeholder checklist provided for website operators to easily insert registered business credentials.",
    ],
    sections: [
      {
        id: "contact-official-details",
        title: "1. Legal Entity & Operator Information",
        content: `For legal correspondence, service of notices, or formal regulatory inquiries regarding POPI Tools, please direct communications to the designated operational team:`,
        subsections: [
          {
            id: "contact-operator-card",
            subtitle: "Official Business & Operator Profile",
            highlight: true,
            body: `• Brand Name: ${LEGAL_CONFIG.brandName}
• Legal Entity / Operator: ${LEGAL_CONFIG.businessOperator.legalEntityName}
• Official Website: ${LEGAL_CONFIG.websiteUrl}
• Customer Support Email: ${LEGAL_CONFIG.businessOperator.supportEmail}
• Legal & Privacy Desk: ${LEGAL_CONFIG.businessOperator.legalInquiryEmail}
• Registered Country: ${LEGAL_CONFIG.businessOperator.country}
• Business Address: ${LEGAL_CONFIG.businessOperator.registeredAddress}
• Jurisdiction: ${LEGAL_CONFIG.businessOperator.jurisdictionStateCity}
• Operational Hours: ${LEGAL_CONFIG.businessOperator.operatingHours}`,
          },
        ],
      },
      {
        id: "contact-grievance-officer",
        title: "2. Grievance Redressal Officer (Indian IT Rules)",
        content: `In accordance with the Information Technology Act, 2000, and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, the designated Grievance Redressal Officer for POPI Tools is:

• Name: ${LEGAL_CONFIG.businessOperator.grievanceOfficerName}
• Email: ${LEGAL_CONFIG.businessOperator.legalInquiryEmail}
• Subject Prefix: "ATTN: Grievance Officer - Formal Complaint"
• Expected Acknowledgment: Within twenty-four (24) to forty-eight (48) business hours.
• Resolution Timeline: Within fifteen (15) days of receipt of complete and verifiable complaint details.`,
      },
      {
        id: "contact-how-to-reach",
        title: "3. Fast Support Channels for Gamers",
        content: `For non-legal operational assistance, game setup tips, companion trouble-shooting, or subscription activation inquiries, you may also connect via our active community channels:
• Official Telegram Channel: https://t.me/popitools
• Google Play Store App Listing: https://play.google.com/store/apps/details?id=com.popi.popitools.ai
• In-App Support: Access the user profile modal in the top header and click "Community Support".`,
      },
    ],
  },
};

export const POLICY_LIST: LegalPolicy[] = Object.values(LEGAL_POLICIES);
