import React, { useState } from "react";
import "./../styles/onboarding.css";

import BusinessStep from "../components/onboarding/BusinessStep";
import CatalogStep from "../components/onboarding/CatalogStep";
import PaymentsStep from "../components/onboarding/PaymentsStep";
import ChannelsStep from "../components/onboarding/ChannelsStep";
import SummaryStep from "../components/onboarding/SummaryStep";
import Stepper from "../components/onboarding/Stepper";
import Footer from "../components/onboarding/Footer";

export default function Onboarding() {
  const [step, setStep] = useState(1);

  return (
    <div className="ob-root">
      <div className="ob-wrap">
        <div className="ob-inner">

          <h1>Store Setup</h1>

          <Stepper current={step} />

          <div className="ob-card">
            {step === 1 && <BusinessStep />}
            {step === 2 && <CatalogStep />}
            {step === 3 && <PaymentsStep />}
            {step === 4 && <ChannelsStep />}
            {step === 5 && <SummaryStep />}
          </div>

          <Footer
            step={step}
            onNext={() => setStep(s => Math.min(s + 1, 5))}
            onBack={() => setStep(s => Math.max(s - 1, 1))}
          />

        </div>
      </div>
    </div>
  );
}