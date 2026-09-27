import React, { useState } from 'react';
import { publicApi } from '../../lib/api';

const UPDATED = 'September 27, 2026';

export const DataDeletion = () => {
  const [contactEmail, setContactEmail] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const payload = {
      contactEmail: contactEmail.trim().toLowerCase(),
      details: details.trim(),
    };

    if (!payload.contactEmail) {
      setError('Please provide the email address associated with your account.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await publicApi.submitDataDeletionRequest(payload);
      setSubmitted(true);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        'We could not submit your request right now. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white py-20 px-6">
      <div className="max-w-3xl mx-auto prose prose-lg prose-primary">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Data Deletion</h1>
        <p className="text-gray-500 mb-8">Last updated: {UPDATED}</p>

        <h2>1. How to Request Deletion of Your Data</h2>
        <p>
          If you want your Hypnate account or personal data deleted, you can submit a
          deletion request in two ways:
        </p>
        <ul>
          <li>
            Use the request form on this page; or
          </li>
          <li>
            Email us at <a href="mailto:hello@hypnate.in">hello@hypnate.in</a> with the
            subject line &ldquo;Data Deletion Request&rdquo;.
        </li>
        </ul>

        <h2>2. Information We Need From You</h2>
        <p>
          To locate the correct account, please provide the email address associated
          with your Hypnate account (or the email address you use to log in with a
          connected service). You may optionally add details that help us identify the
          account, such as the business name on the account.
        </p>
        <p>
          For security reasons, we may ask you to verify your identity through the
          contact information on file before we process the request.
        </p>

        <h2>3. What Happens After You Submit a Request</h2>
        <p>
          Deletion requests are reviewed and processed by Hypnate. Submitting a request
          does not delete anything immediately. After we verify the request, we will
          delete the personal data associated with your account, which may include:
        </p>
        <ul>
          <li><strong>Account information:</strong> your name, email address, phone number and business profile.</li>
          <li><strong>Business and commerce information:</strong> products, orders and related records you manage through Hypnate.</li>
          <li><strong>Customer records</strong> belonging to your business that are stored in Hypnate.</li>
          <li><strong>Conversation history</strong> and messages routed through Hypnate.</li>
          <li><strong>Connected channel credentials</strong> used for integrations such as WhatsApp.</li>
        </ul>
        <p>
          Some information may be retained where we are legally required to keep it
          (for example, transaction and tax records), or where retention is necessary
          to secure our service, resolve disputes and enforce our agreements.
        </p>

        <h2>4. Important Notes</h2>
        <ul>
          <li>
            Requesting deletion through a third-party platform (for example, through a
            Meta service) does not automatically delete records held by Hypnate. Your
            request still needs to reach us, ideally through this page or our support
            email.
          </li>
          <li>
            Deleting your account removes access to Hypnate, including any business
            data stored in it. This action cannot be undone.
          </li>
        </ul>

        <h2>5. Submit a Deletion Request</h2>
        {submitted ? (
          <div className="not-prose my-8 rounded-lg border border-teal-200 bg-teal-50 p-5 text-gray-800">
            <p className="font-semibold mb-2">Request received</p>
            <p>
              Your deletion request has been received. If additional verification is
              required, Hypnate will contact you using the information provided.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="not-prose my-8 space-y-4">
            <div>
              <label htmlFor="deletion-email" className="block text-sm font-medium text-gray-700 mb-1">
                Account email address (required)
              </label>
              <input
                id="deletion-email"
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                maxLength={254}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-teal-600 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="deletion-details" className="block text-sm font-medium text-gray-700 mb-1">
                Additional details (optional)
              </label>
              <textarea
                id="deletion-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={2000}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-teal-600 focus:outline-none"
                placeholder="Business name or other information that helps us locate your account"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600" role="alert">{error}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-teal-600 px-5 py-2.5 text-white font-medium hover:bg-teal-700 disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Submit Deletion Request'}
            </button>
          </form>
        )}

        <h2>6. Contact</h2>
        <p>
          Questions about deletion or privacy can be sent to{' '}
          <a href="mailto:hello@hypnate.in">hello@hypnate.in</a>.
        </p>
      </div>
    </div>
  );
};
