import React, { useEffect, useRef, useState } from "react";
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
    const routeState = location.state as { email?: string; plan?: string | null } | null;
    const storedEmail = typeof window !== "undefined"
        ? window.sessionStorage.getItem("hypnate:verification-email") || ""
        : "";
    // Signup passes the email through router state. Persist it in sessionStorage
    // as well so a refresh on the check-inbox screen does not lose the address
    // needed for a resend action.
    const email = routeState?.email || user?.email || storedEmail;

    useEffect(() => {
        if (routeState?.email) {
            window.sessionStorage.setItem("hypnate:verification-email", routeState.email);
        }
    }, [routeState?.email]);

    const [state, setState] = useState<VerifyState>(token ? "verifying" : "checkInbox");
    const [errorMessage, setErrorMessage] = useState("");
    const [resending, setResending] = useState(false);
    const [resendMessage, setResendMessage] = useState("");

    // The verification token is single-use, so this request must fire exactly
    // once. React 18 StrictMode intentionally double-invokes effects in
    // development — without this guard, the second invocation would send the
    // already-consumed token and show a false "invalid or expired" error even
    // though the first request already succeeded.
    const hasAttempted = useRef(false);

    useEffect(() => {
        if (!token || hasAttempted.current) return;
        hasAttempted.current = true;

        (async () => {
            try {
                await verifyEmail(token);
                window.sessionStorage.removeItem("hypnate:verification-email");
                setState("success");
            } catch (err: any) {
                setErrorMessage(err.message || "This verification link is invalid or has expired.");
                setState("error");
            }
        })();
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
                    <Loader2 size={32} color="#0d9488" aria-hidden="true" style={{ animation: "auth-spin 0.9s linear infinite" }} />
                    <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Confirming your verification link…</p>
                </div>
            </AuthLayout>
        );
    }

    if (state === "success") {
        return (
            <AuthLayout title="Email verified" subtitle="Your account is active.">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "24px 0" }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f0fdfa", border: "2px solid #6ee7b7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <CheckCircle2 size={28} color="#0d9488" aria-hidden="true" />
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
                        <XCircle size={28} color="#dc2626" aria-hidden="true" />
                    </div>
                    <p style={{ fontSize: 13, color: "#dc2626", margin: 0, textAlign: "center" }}>{errorMessage}</p>

                    {email && (
                        <button
                            type="button"
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
                    {resendMessage && <p role="status" aria-live="polite" style={{ fontSize: 12, color: "#64748b", margin: 0, textAlign: "center" }}>{resendMessage}</p>}

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
                    <Mail size={26} color="#0d9488" aria-hidden="true" />
                </div>

                {email && (
                    <p style={{ fontSize: 14, color: "#374151", margin: 0, textAlign: "center" }}>
                        Sent to <strong>{email}</strong>
                    </p>
                )}
                <p style={{ fontSize: 13, color: "#64748b", margin: 0, textAlign: "center", lineHeight: 1.6 }}>
                    Click the link in that email to activate your account. It may take a minute to arrive — check spam too.
                </p>

                <button
                    type="button"
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
                {resendMessage && <p role="status" aria-live="polite" style={{ fontSize: 12, color: "#64748b", margin: 0, textAlign: "center" }}>{resendMessage}</p>}

                <Link to="/login" style={{ fontSize: 13, color: "#0d9488", fontWeight: 600, textDecoration: "none" }} className="auth-link">
                    Back to sign in
                </Link>
            </div>
        </AuthLayout>
    );
};