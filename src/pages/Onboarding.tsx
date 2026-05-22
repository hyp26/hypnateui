import React, { useState, useEffect } from "react";
import api from "../lib/api";

import { Step, BusinessForm, PaymentForm } from "../types/onboarding";

import Stepper from "../components/onboarding/Stepper";
import BusinessStep from "../components/onboarding/BusinessStep";
import CatalogStep from "../components/onboarding/CatalogStep";
import PaymentsStep from "../components/onboarding/PaymentsStep";
import ChannelsStep from "../components/onboarding/ChannelsStep";
import SummaryStep from "../components/onboarding/SummaryStep";
import Footer from "../components/onboarding/Footer";

const OnboardingPage = () => {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  const [business, setBusiness] = useState<BusinessForm>({
    businessName: "",
    industry: "retail",
    size: "1-10",
    mobileNo: "",
    gstNumber: "",
  });

  const [payment, setPayment] = useState<PaymentForm>({
    gateway: null,
    keyId: "",
    keySecret: "",
    merchantId: "",
    salt: "",
  });

  // 🔥 FETCH EXISTING DATA
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/onboarding/me");
        const d = res.data;

        setBusiness({
          businessName: d.businessName || "",
          industry: d.industry || "retail",
          size: d.size || "1-10",
          mobileNo: d.phone || "",
          gstNumber: d.gstNumber || "",
        });

      } catch { }
      finally {
        setLoadingData(false);
      }
    };

    load();
  }, []);

  const handleNext = async () => {
    setError("");
    setLoading(true);

    try {
      if (step === 1) {
        await api.post("/api/onboarding/business", {
          ...business,
          phone: business.mobileNo,
        });
        setStep(2);
      }

      else if (step === 2) {
        setStep(3);
      }

      else if (step === 3) {
        await api.post("/api/onboarding/payments", payment);
        setStep(4);
      }

      else if (step === 4) {
        setStep(5);
      }

      else {
        await api.post("/api/onboarding/complete");
      }

    } catch (e: any) {
      setError(e?.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return <div>Loading...</div>;

  return (
    <div>
      <Stepper step={step} />

      {step === 1 && (
        <BusinessStep data={business} setData={setBusiness} error={error} />
      )}

      {step === 2 && <CatalogStep />}

      {step === 3 && (
        <PaymentsStep data={payment} setData={setPayment} />
      )}

      {step === 4 && <ChannelsStep />}

      {step === 5 && <SummaryStep />}

      <Footer onNext={handleNext} loading={loading} />
    </div>
  );
};

export default OnboardingPage;