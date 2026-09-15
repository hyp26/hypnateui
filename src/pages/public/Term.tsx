import React from 'react';

const UPDATED = 'September 14, 2026';

export const Terms = () => {
  return (
    <div className="bg-white py-20 px-6">
      <div className="max-w-3xl mx-auto prose prose-lg prose-primary">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>
        <p className="text-gray-500 mb-8">Last updated: {UPDATED}</p>

        <h3>1. Agreement</h3>
        <p>By accessing or using Hypnate, you agree to these Terms and the Privacy Policy. If you do not agree, do not use the service.</p>

        <h3>2. Accounts</h3>
        <p>You must provide accurate information when creating an account and keep your login credentials secure. You are responsible for activity under your account and for notifying us of unauthorized access.</p>

        <h3>3. Acceptable Use</h3>
        <p>You may use Hypnate only for lawful business purposes. You must not use the service to violate applicable law, intellectual-property rights, messaging-platform rules, payment-provider requirements or the privacy rights of other people.</p>

        <h3>4. Third-Party Integrations</h3>
        <p>Some features depend on third-party services, including Meta/WhatsApp and payment providers. Your use of those integrations is also subject to the applicable third-party terms and policies. We cannot guarantee approval, availability or uninterrupted operation of a third-party service.</p>

        <h3>5. Subscription and Billing</h3>
        <p>Paid plans are billed according to the pricing and billing cycle shown at checkout. Your subscription may renew automatically until cancelled. Cancelling a subscription stops future renewals; access and any refund are governed by the applicable billing terms and Refund Policy.</p>

        <h3>6. Your Content and Data</h3>
        <p>You retain responsibility for the data and content you submit to Hypnate, including the right to process merchant customer information through the service. You grant Hypnate the limited rights necessary to host, process and transmit that content to provide the service.</p>

        <h3>7. Availability and Changes</h3>
        <p>We may modify, suspend or discontinue features as the product evolves. We may also update these Terms from time to time. Material changes may be communicated through the service or other reasonable means.</p>

        <h3>8. Disclaimer</h3>
        <p>Hypnate is provided on an "as is" and "as available" basis to the extent permitted by applicable law. We do not guarantee that the service will be uninterrupted, error-free or suitable for every business use case.</p>

        <h3>9. Limitation of Liability</h3>
        <p>To the maximum extent permitted by applicable law, Hypnate and its officers, employees, partners and suppliers are not liable for indirect, incidental, special, consequential or punitive damages arising from use of the service.</p>

        <h3>10. Contact</h3>
        <p>Questions about these Terms can be sent to <a href="mailto:hello@hypnate.in">hello@hypnate.in</a>.</p>
      </div>
    </div>
  );
};
