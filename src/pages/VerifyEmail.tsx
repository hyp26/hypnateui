import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, Mail, XCircle } from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";
import { AuthLayout } from "../components/auth/AuthLayout";

type VerifyState = "checkInbox" | "verifying" | "success" | "error";

export const VerifyEmail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const verifyEmail = useAuthStore((s) => s.verifyEmail);
    const resendVerificationEmail = useAuthStore((s) => s.resendVerificationEmail);
    const user = useAuthStore((s) => s.user);

    const token = searchParams.get("token");
    // Signup passes the email via router state; fall back to the logged-in
    // user's email if the person lands here directly (e.g. via a bookmark).
    const email = (location.state as { email?: string } | null)?.email || user?.email || "";

    const [state, setState] = useState<VerifyState>(token ? "verifying" : "checkInbox");
    const [errorMessage, setErrorMessage] = useState("");
    const [resending, setResending] = useState(false);
    const [resendMessage, setResendMessage] = useState("");

    useEffect(() => {
        if (!token) return;
        let cancelled = false;

        (async () => {
            try {
                await verifyEmail(token);
                if (!cancelled) setState("success");
            } catch (err: any) {
                if (!cancelled) {
                    setErrorMessage(err.message || "This verification link is invalid or has expired.");
                    setState("error");
                }
            }
        })();

        return () => { cancelled = true; };
    }, [token, verifyEmail]);

    useEffect(() => {
        if (state !== "success") return;
        const t = setTimeout(() => navigate("/onboarding"), 1500);
        return () => clearTimeout(t);
    }, [state, navigate]);

    const handleResend = async () => {
        if (!email) return;
        setResending(true);
        setResendMessage("");
        try {
            await resendVerificationEmail(email);
            setResendMessage("Verification email sent — check your inbox.");
        } catch (err: any) {
            setResendMessage(err.message || "Could not resend the email. Please try again.");
        } finally {
            setResending(false);
        }
    };

    if (state === "verifying") {
        return (
            <AuthLayout title="Verifying your email" subtitle="This will just take a moment.">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "24px 0" }}>
                    <Loader2 size={32} color="#0d9488" style={{ animation: "auth-spin 0.9s linear infinite" }} />
                    <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>Confirming your verification link…</p>
                </div>
            </AuthLayout>
        );
    }

    if (state === "success") {
        return (
            <AuthLayout title="Email verified" subtitle="Your account is active.">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "24px 0" }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f0fdfa", border: "2px solid #6ee7b7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <CheckCircle2 size={28} color="#0d9488" />
                    </div>
                    <p style={{ fontSize: 13, color: "#64748b", margin: 0, textAlign: "center" }}>Taking you to store setup…</p>
                </div>
            </AuthLayout>
        );
    }

    if (state === "error") {
        return (
            <AuthLayout title="Verification failed" subtitle="We couldn't confirm that link.">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "12px 0" }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fef2f2", border: "2px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <XCircle size={28} color="#dc2626" />
                    </div>
                    <p style={{ fontSize: 13, color: "#dc2626", margin: 0, textAlign: "center" }}>{errorMessage}</p>

                    {email && (
                        <button
                            onClick={handleResend}
                            disabled={resending}
                            className="auth-submit"
                            style={{
                                width: "100%", height: 46, background: resending ? "#94a3b8" : "#0d9488", color: "#fff",
                                border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700,
                                cursor: resending ? "not-allowed" : "pointer", fontFamily: "'Outfit',sans-serif",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            }}
                        >
                            {resending ? <span className="auth-spinner" /> : "Resend verification email"}
                        </button>
                    )}
                    {resendMessage && <p style={{ fontSize: 12, color: "#64748b", margin: 0, textAlign: "center" }}>{resendMessage}</p>}

                    <Link to="/login" style={{ fontSize: 13, color: "#0d9488", fontWeight: 600, textDecoration: "none" }} className="auth-link">
                        Back to sign in
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    // state === "checkInbox" — the screen shown right after signup
    return (
        <AuthLayout title="Check your email" subtitle="We've sent a verification link to activate your account.">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "12px 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f0fdfa", border: "2px solid #6ee7b7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Mail size={26} color="#0d9488" />
                </div>

                {email && (
                    <p style={{ fontSize: 14, color: "#374151", margin: 0, textAlign: "center" }}>
                        Sent to <strong>{email}</strong>
                    </p>
                )}
                <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, textAlign: "center", lineHeight: 1.6 }}>
                    Click the link in that email to activate your account. It may take a minute to arrive — check spam too.
                </p>

                <button
                    onClick={handleResend}
                    disabled={resending || !email}
                    className="auth-submit"
                    style={{
                        width: "100%", height: 46, background: resending ? "#94a3b8" : "#0d9488", color: "#fff",
                        border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700,
                        cursor: resending || !email ? "not-allowed" : "pointer", fontFamily: "'Outfit',sans-serif",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                >
                    {resending ? <span className="auth-spinner" /> : "Resend verification email"}
                </button>
                {resendMessage && <p style={{ fontSize: 12, color: "#64748b", margin: 0, textAlign: "center" }}>{resendMessage}</p>}

                <Link to="/login" style={{ fontSize: 13, color: "#0d9488", fontWeight: 600, textDecoration: "none" }} className="auth-link">
                    Back to sign in
                </Link>
            </div>
        </AuthLayout>
    );
};