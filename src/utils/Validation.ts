export interface ValidationResult {
    valid: boolean;
    message?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Indian mobile numbers: optional +91, then a digit 6-9 followed by 9 more digits
const INDIA_PHONE_REGEX = /^(\+91[-\s]?)?[6-9]\d{9}$/;

export const validateEmail = (value: string): ValidationResult => {
    const trimmed = value.trim();
    if (!trimmed) return { valid: false, message: "Email is required" };
    if (!EMAIL_REGEX.test(trimmed)) {
        return { valid: false, message: "Enter a valid email address" };
    }
    return { valid: true };
};

// Full strength check — used on signup
export const validatePassword = (value: string): ValidationResult => {
    if (!value) return { valid: false, message: "Password is required" };
    if (value.length < 8) return { valid: false, message: "Use at least 8 characters" };
    if (!/[A-Z]/.test(value)) return { valid: false, message: "Add an uppercase letter" };
    if (!/[0-9]/.test(value)) return { valid: false, message: "Add a number" };
    if (!/[^A-Za-z0-9]/.test(value)) return { valid: false, message: "Add a special character" };
    return { valid: true };
};

// Login only needs to know a password was typed — the server is the
// source of truth for whether it's correct.
export const validateLoginPassword = (value: string): ValidationResult => {
    if (!value) return { valid: false, message: "Password is required" };
    return { valid: true };
};

export const validateName = (value: string): ValidationResult => {
    const trimmed = value.trim();
    if (!trimmed) return { valid: false, message: "Full name is required" };
    if (trimmed.length < 2) return { valid: false, message: "Name looks too short" };
    return { valid: true };
};

export const validateBusinessName = (value: string): ValidationResult => {
    if (!value.trim()) return { valid: false, message: "Business name is required" };
    return { valid: true };
};

export const validatePhone = (value: string): ValidationResult => {
    const cleaned = value.replace(/[\s-]/g, "");
    if (!cleaned) return { valid: false, message: "Mobile number is required" };
    if (!INDIA_PHONE_REGEX.test(cleaned)) {
        return { valid: false, message: "Enter a valid 10-digit mobile number" };
    }
    return { valid: true };
};