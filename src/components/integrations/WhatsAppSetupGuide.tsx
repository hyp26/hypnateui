import React from 'react';
import { MessageCircle, ShieldCheck, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '../ui/Button';

interface WhatsAppSetupGuideProps {
  /** Optional callback rendered as a Connect WhatsApp button (e.g. starts the OAuth flow). */
  onConnect?: () => void;
  /** Optional extra classes for the root element. */
  className?: string;
}

const STEPS: { title: string; description: string }[] = [
  {
    title: 'Click Connect WhatsApp',
    description: 'Open Settings, go to Integrations, and click Connect WhatsApp on the WhatsApp card.',
  },
  {
    title: 'Continue to Meta',
    description: 'Hypnate sends you to Meta. You do not need any API keys, tokens, or phone numbers from us.',
  },
  {
    title: 'Log in to Meta',
    description: 'Sign in with the Facebook account that manages your business on Meta.',
  },
  {
    title: 'Authorize your WhatsApp Business assets',
    description: 'Select the business and the WhatsApp Business Account (and phone number) you want Hypnate to use, then approve the permissions.',
  },
  {
    title: 'Return to Hypnate',
    description: 'After you approve, Meta brings you back to Hypnate and your connection appears automatically.',
  },
  {
    title: 'Chat from Hypnate',
    description: 'Hypnate securely stores and manages the connection for you. You can now receive and reply to WhatsApp conversations right from Hypnate.',
  },
];

/**
 * Presentational guide explaining how connecting WhatsApp through Hypnate works.
 * Pure UI: no API calls, no OAuth logic, no store access.
 */
export const WhatsAppSetupGuide: React.FC<WhatsAppSetupGuideProps> = ({ onConnect, className = '' }) => {
  return (
    <div className={'w-full rounded-xl border border-gray-200 bg-white ' + className}>
      {/* Header */}
      <div className="flex items-start gap-3 border-b border-gray-100 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50">
          <MessageCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">How WhatsApp connecting works</h3>
          <p className="mt-1 text-sm text-gray-600">
            Hypnate connects to WhatsApp through an official Meta authorization. It takes about a minute, and you never have to handle API keys or access tokens.
          </p>
        </div>
      </div>

      {/* Steps */}
      <ol className="divide-y divide-gray-100">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex items-start gap-3 p-5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-700" aria-hidden="true">
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-800">{step.title}</p>
              <p className="mt-0.5 text-sm text-gray-600">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>

      {/* Security note */}
      <div className="flex items-start gap-3 border-t border-gray-100 bg-gray-50 p-5">
        <ShieldCheck className="h-5 w-5 shrink-0 text-primary-500" aria-hidden="true" />
        <div className="text-sm text-gray-600">
          <p className="font-medium text-gray-700">Secure by design</p>
          <p className="mt-1">
            <Lock className="mr-1 inline h-3.5 w-3.5 align-[-1px]" aria-hidden="true" />
            Hypnate stores and manages your connection securely. Never share your Meta password or paste access tokens into any tool.
          </p>
        </div>
      </div>

      {/* Optional connect action (wired by the parent when the guide is used) */}
      {onConnect && (
        <div className="border-t border-gray-100 p-5">
          <Button onClick={onConnect} className="w-full">
            Connect WhatsApp <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> You will be redirected to Meta to authorize Hypnate.
          </p>
        </div>
      )}
    </div>
  );
};
