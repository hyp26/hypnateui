import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";
import { AuthLayout } from "../components/auth/AuthLayout";
import { FormField } from "../components/auth/Formfield";
import { PasswordField } from "../components/auth/Passwordfield";
import {
    validateEmail,
    validatePassword,
    validateName,
    validateBusinessName,
    validatePhone,
} from "../utils/Validation";

interface FieldErrors {
    name?: string;
    businessName?: string;
    phone?: string;
    email?: string;
    password?: string;
}

export const Signup: React.FC = () => {
    const [name, setName] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const signup = useAuthStore((s) => s.signup);
    const navigate = useNavigate();

    const validate = (): boolean => {
        const checks: Record<keyof FieldErrors, { valid: boolean; message?: string }> = {
            name: validateName(name),
            businessName: validateBusinessName(businessName),
            phone: validatePhone(phone),
            email: validateEmail(email),
            password: validatePassword(password),
        };

        const errors: FieldErrors = {};
        (Object.keys(checks) as (keyof FieldErrors)[]).forEach((key) => {
            if (!checks[key].valid) errors[key] = checks[key].message;
        });

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (!validate()) return;

        setIsLoading(true);
        try {
            await signup(name, email, password, businessName, phone);
            // Account exists but isn't verified yet — send them to check their
            // inbox rather than straight into onboarding.
            navigate("/verify-email", { state: { email } });
        } catch (err: any) {
            setFormError(err.message || "Signup failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Create your account and get started with Hypnate."
            footer={
                <>
                    Already have an account?{" "}
                    <Link to="/login" style={{ color: "#0d9488", fontWeight: 700, textDecoration: "none" }} className="auth-link">
                        Sign in
                    </Link>
                </>
            }
        >
            {formError && (
                <div
                    style={{
                        marginBottom: 16,
                        padding: "10px 14px",
                        borderRadius: 10,
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        fontSize: 13,
                        color: "#dc2626",
                    }}
                >
                    {formError}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }} noValidate>
                <FormField
                    label="Full Name"
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={setName}
                    placeholder="e.g. Rahul Sharma"
                    error={fieldErrors.name}
                />
                <FormField
                    label="Business Name"
                    name="businessName"
                    autoComplete="organization"
                    value={businessName}
                    onChange={setBusinessName}
                    placeholder="e.g. Rahul Fashion House"
                    error={fieldErrors.businessName}
                />
                <FormField
                    label="Mobile No."
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={setPhone}
                    placeholder="+91 98XXX XXXXX"
                    error={fieldErrors.phone}
                />
                <FormField
                    label="Email address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                    error={fieldErrors.email}
                />
                <PasswordField
                    value={password}
                    onChange={setPassword}
                    autoComplete="new-password"
                    error={fieldErrors.password}
                    hint={!fieldErrors.password ? "Min 8 chars with uppercase, number & special character" : undefined}
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    className="auth-submit"
                    style={{
                        width: "100%",
                        height: 48,
                        marginTop: 4,
                        background: isLoading ? "#94a3b8" : "#0d9488",
                        color: "#fff",
                        border: "none",
                        borderRadius: 12,
                        fontSize: 15,
                        fontWeight: 800,
                        cursor: isLoading ? "not-allowed" : "pointer",
                        fontFamily: "'Outfit',sans-serif",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        letterSpacing: "-0.2px",
                    }}
                >
                    {isLoading ? <span className="auth-spinner" /> : "Create My Store →"}
                </button>
            </form>
        </AuthLayout>
    );
};