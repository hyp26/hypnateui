import React from 'react';

export const Refund = () => {
  return (
    <div className="bg-white py-20 px-6">
      <div className="max-w-3xl mx-auto prose prose-lg prose-primary">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Refund Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: October 15, 2024</p>

        <h3>1. 14-Day Money-Back Guarantee</h3>
        <p>We want you to be satisfied with Hypnate. If you are not satisfied with our service for any reason, you may request a full refund within 14 days of your initial purchase.</p>

        <h3>2. Monthly Subscriptions</h3>
        <p>For monthly subscriptions, you can cancel at any time. You will continue to have access to the service through the end of your billing period. We do not offer refunds for partial months of service after the initial 14-day period.</p>

        <h3>3. Annual Subscriptions</h3>
        <p>If you cancel an annual subscription within the first 30 days, you are eligible for a full refund. After 30 days, refunds are prorated based on the remaining unused months, minus a 20% early cancellation fee.</p>

        <h3>4. How to Request a Refund</h3>
        <p>To request a refund, please contact our support team at support@hypnate.ai with your account email and order details. We will process your request within 5-7 business days.</p>

        <h3>5. Exceptions</h3>
        <p>Refunds are not available for accounts that have been suspended or terminated for violations of our Terms of Service or WhatsApp's policies.</p>
      </div>
    </div>
  );
};
