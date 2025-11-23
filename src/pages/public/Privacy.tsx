import React from 'react';

export const Privacy = () => {
  return (
    <div className="bg-white py-20 px-6">
      <div className="max-w-3xl mx-auto prose prose-lg prose-primary">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: October 15, 2024</p>

        <h3>1. Introduction</h3>
        <p>Hypnate ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by Hypnate.</p>

        <h3>2. Information We Collect</h3>
        <p>We collect information you provide directly to us, such as when you create or modify your account, request customer support, or communicate with us.</p>
        <ul>
          <li><strong>Account Information:</strong> Name, email address, phone number, business name.</li>
          <li><strong>Customer Data:</strong> Data about your customers that you upload or sync (we process this as a data processor).</li>
          <li><strong>Payment Information:</strong> Billing address and payment method details (processed securely by our payment providers).</li>
        </ul>

        <h3>3. How We Use Your Information</h3>
        <p>We use the information we collect to operate, maintain, and improve our services, such as to:</p>
        <ul>
          <li>Process transactions and send related information.</li>
          <li>Send you technical notices, updates, security alerts, and support messages.</li>
          <li>Respond to your comments, questions, and requests.</li>
        </ul>

        <h3>4. Data Security</h3>
        <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>

        <h3>5. Third-Party Services</h3>
        <p>Our service integrates with third-party services like WhatsApp (Meta) and Razorpay. Please review their privacy policies to understand how they handle your data.</p>

        <h3>6. Your Rights</h3>
        <p>You have the right to access, correct, or delete your personal information. You can manage your information from your account settings or by contacting us.</p>
      </div>
    </div>
  );
};
