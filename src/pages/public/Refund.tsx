import React from 'react';

const UPDATED = 'September 14, 2026';

export const Refund = () => {
  return (
    <div className="bg-white py-20 px-6">
      <div className="max-w-3xl mx-auto prose prose-lg prose-primary">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Refund Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: {UPDATED}</p>

        <h3>1. Trial and Pilot Plans</h3>
        <p>Where a free trial or pilot period is offered, the applicable terms and end date are shown at signup or checkout. A free period is not a paid purchase and therefore does not itself create a refund amount.</p>

        <h3>2. Paid Subscriptions</h3>
        <p>Once a paid subscription has started, charges are generally non-refundable except where a refund is required by applicable law or where Hypnate expressly agrees to one. Cancelling prevents future renewal but does not automatically reverse a completed billing period.</p>

        <h3>3. Duplicate or Incorrect Charges</h3>
        <p>If you believe you were charged twice for the same subscription period or charged in error, contact us promptly with the account email and relevant transaction details so we can review the charge.</p>

        <h3>4. Third-Party Charges</h3>
        <p>Fees charged directly by third-party services, including messaging platforms or payment providers, are governed by those providers' own policies and are not automatically refundable by Hypnate.</p>

        <h3>5. How to Request a Refund</h3>
        <p>Send your request to <a href="mailto:hello@hypnate.in">hello@hypnate.in</a> with your account email, billing details and a brief description of the issue. We will review the request and respond through the contact information associated with your account.</p>

        <h3>6. Policy Changes</h3>
        <p>We may update this policy as our plans, billing systems or applicable requirements change. The updated date above identifies the current version.</p>
      </div>
    </div>
  );
};
