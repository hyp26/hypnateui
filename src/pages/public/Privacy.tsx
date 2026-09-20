import React from 'react';

const UPDATED = 'September 14, 2026';

export const Privacy = () => {
  return (
    <div className="bg-white py-20 px-6">
      <div className="max-w-3xl mx-auto prose prose-lg prose-primary">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: {UPDATED}</p>

        <h2>1. Scope</h2>
        <p>Hypnate Solutions Pvt Ltd ("Hypnate", "we", "our", or "us") provides software for businesses to manage conversations, commerce workflows, orders, customers, payments and related operations. This policy explains how we handle information submitted to or generated through our services.</p>

        <h2>2. Information We Collect</h2>
        <ul>
          <li><strong>Account information:</strong> name, email address, phone number, business name and account credentials.</li>
          <li><strong>Business and commerce information:</strong> product, inventory, order and customer information that a merchant chooses to upload, sync or otherwise process through Hypnate.</li>
          <li><strong>Communications:</strong> messages, support requests, contact-form submissions and other information you send to us.</li>
          <li><strong>Usage and device information:</strong> basic application, browser, device, diagnostic and security information used to operate and protect the service.</li>
          <li><strong>Billing information:</strong> subscription and transaction-related information needed to manage billing. Payment credentials may be handled directly by third-party payment providers rather than stored by Hypnate.</li>
        </ul>

        <h2>3. How We Use Information</h2>
        <p>We use information to provide and secure the service, authenticate accounts, process requested commerce workflows, respond to support requests, communicate service updates, maintain records, prevent abuse and improve the product.</p>

        <h2>4. Third-Party Services</h2>
        <p>Hypnate can integrate with third-party services including Meta services used for WhatsApp, Instagram and Facebook, Telegram, and payment providers such as Razorpay. When you connect a third-party service, information may be exchanged as necessary to provide the integration. Those providers may process information under their own terms and privacy policies.</p>

        <h2>5. Merchant Customer Data</h2>
        <p>Where a merchant uploads or syncs information about its own customers, Hypnate generally processes that information on the merchant's behalf to provide the requested service. Merchants are responsible for having the required rights and notices for the customer data they submit.</p>

        <h2>6. Security</h2>
        <p>We use reasonable technical and organizational safeguards designed to protect information against unauthorized access, loss, misuse or alteration. No security measure can guarantee absolute security.</p>

        <h2>7. Retention and Deletion</h2>
        <p>We retain information for as long as reasonably necessary to provide the service, meet contractual or legal obligations, resolve disputes, maintain security and enforce our agreements. You may request deletion of personal information subject to applicable law and legitimate retention requirements.</p>

        <h2>8. Your Choices and Rights</h2>
        <p>You may request access to, correction of, or deletion of personal information we control, subject to applicable law. You can also contact us about privacy questions or data requests.</p>

        <h2>9. Changes</h2>
        <p>We may update this policy when our services or legal obligations change. We will update the date above and, where appropriate, provide additional notice for material changes.</p>

        <h2>10. Contact</h2>
        <p>Privacy questions or requests can be sent to <a href="mailto:hello@hypnate.in">hello@hypnate.in</a>.</p>
      </div>
    </div>
  );
};
