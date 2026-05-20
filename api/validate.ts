import type { VercelRequest, VercelResponse } from "@vercel/node";

// Email validation with strict rules
const validateEmail = (email: string): { valid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    return { valid: false, error: "Email is required" };
  }

  if (email.length > 254) {
    return { valid: false, error: "Email is too long (max 254 characters)" };
  }

  if (!emailRegex.test(email)) {
    return { valid: false, error: "Invalid email format" };
  }

  // Check for common typos
  const commonDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"];
  const domain = email.split("@")[1].toLowerCase();
  const typos: { [key: string]: string } = {
    "gmial.com": "gmail.com",
    "gmai.com": "gmail.com",
    "yahooo.com": "yahoo.com",
    "yaho.com": "yahoo.com",
    "outloo.com": "outlook.com",
    "hotmial.com": "hotmail.com",
  };

  if (typos[domain]) {
    return {
      valid: false,
      error: `Did you mean ${email.replace(domain, typos[domain])}?`,
    };
  }

  return { valid: true };
};

// Password validation with strict rules
const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!password) {
    return { valid: false, errors: ["Password is required"] };
  }

  if (password.length < 12) {
    errors.push("Password must be at least 12 characters");
  }

  if (password.length > 32) {
    errors.push("Password must be less than 32 characters");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least 1 lowercase letter");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least 1 uppercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least 1 number");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least 1 symbol");
  }

  return { valid: errors.length === 0, errors };
};

// Personal data validation
const validatePersonalData = (
  data: any
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  const { firstName, lastName, dateOfBirth, nationality } = data;

  // First name validation
  if (!firstName || firstName.trim().length === 0) {
    errors.push("First name is required");
  } else if (firstName.length < 2) {
    errors.push("First name must be at least 2 characters");
  } else if (firstName.length > 50) {
    errors.push("First name is too long");
  } else if (!/^[a-zA-Z\s'-]*$/.test(firstName)) {
    errors.push("First name contains invalid characters");
  }

  // Last name validation
  if (!lastName || lastName.trim().length === 0) {
    errors.push("Last name is required");
  } else if (lastName.length < 2) {
    errors.push("Last name must be at least 2 characters");
  } else if (lastName.length > 50) {
    errors.push("Last name is too long");
  } else if (!/^[a-zA-Z\s'-]*$/.test(lastName)) {
    errors.push("Last name contains invalid characters");
  }

  // Date of birth validation
  if (!dateOfBirth) {
    errors.push("Date of birth is required");
  } else {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();

    if (age < 18) {
      errors.push("You must be at least 18 years old");
    }

    if (age > 150) {
      errors.push("Date of birth appears to be invalid");
    }

    if (dob > today) {
      errors.push("Date of birth cannot be in the future");
    }
  }

  // Nationality validation
  if (!nationality || nationality.trim().length === 0) {
    errors.push("Nationality is required");
  } else if (nationality.length < 2) {
    errors.push("Nationality is invalid");
  }

  return { valid: errors.length === 0, errors };
};

// Identity document validation
const validateIdentityDoc = (
  data: any
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  const { docType, docNumber, expiryDate, issuingCountry } = data;

  if (!docType) {
    errors.push("Document type is required");
  }

  if (!docNumber || docNumber.trim().length === 0) {
    errors.push("Document number is required");
  } else if (docNumber.length < 5 || docNumber.length > 20) {
    errors.push("Document number appears invalid");
  }

  if (!expiryDate) {
    errors.push("Expiry date is required");
  } else {
    const expiry = new Date(expiryDate);
    const today = new Date();

    if (expiry < today) {
      errors.push("Document has expired");
    }

    if (expiry.getFullYear() - today.getFullYear() > 20) {
      errors.push("Expiry date appears to be invalid");
    }
  }

  if (!issuingCountry || issuingCountry.trim().length === 0) {
    errors.push("Issuing country is required");
  }

  return { valid: errors.length === 0, errors };
};

// Address validation
const validateAddress = (
  data: any
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  const { country, state, city, postalCode, address } = data;

  if (!country) {
    errors.push("Country is required");
  }

  if (!state) {
    errors.push("State/province is required");
  }

  if (!city || city.trim().length === 0) {
    errors.push("City is required");
  } else if (city.length < 2) {
    errors.push("City name is too short");
  }

  if (!postalCode || postalCode.trim().length === 0) {
    errors.push("Postal code is required");
  }

  if (!address || address.trim().length === 0) {
    errors.push("Address is required");
  } else if (address.length < 10) {
    errors.push("Address seems incomplete");
  } else if (address.length > 200) {
    errors.push("Address is too long");
  }

  return { valid: errors.length === 0, errors };
};

// Send verification email
const sendVerificationEmail = async (
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // For demonstration, we'll use a mock email service
    // In production, integrate with SendGrid, AWS SES, or similar

    const emailContent = `
Your ProofPass Email Verification Code: ${code}

This code expires in 15 minutes.

Do not share this code with anyone.

If you didn't request this, ignore this email.

---
ProofPass Security Team
2026
    `;

    console.log(`[EMAIL] Sending verification to ${email}`);
    console.log(`[CODE] ${code}`);

    // Mock success - in production, actually send via email service
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "Failed to send verification email",
    };
  }
};

// Generate verification code
const generateVerificationCode = (): string => {
  return Math.random().toString().slice(2, 8).padStart(6, "0");
};

// Main handler
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { action, email, password, passwordConfirm, personalData, identityDoc, address } =
    req.body;

  try {
    switch (action) {
      case "validate-email": {
        const validation = validateEmail(email);
        if (!validation.valid) {
          return res.status(400).json({
            valid: false,
            error: validation.error,
          });
        }

        // Generate verification code
        const code = generateVerificationCode();

        // Send email (mock)
        const emailResult = await sendVerificationEmail(email, code);
        if (!emailResult.success) {
          return res.status(500).json({
            valid: false,
            error: emailResult.error,
          });
        }

        // Store verification code temporarily (in production, use Redis or database)
        // For now, return it for client to use
        return res.status(200).json({
          valid: true,
          message: "Verification email sent",
          code, // Remove in production - just for testing
        });
      }

      case "validate-password": {
        const validation = validatePassword(password);

        if (!validation.valid) {
          return res.status(400).json({
            valid: false,
            errors: validation.errors,
          });
        }

        if (password !== passwordConfirm) {
          return res.status(400).json({
            valid: false,
            errors: ["Passwords do not match"],
          });
        }

        return res.status(200).json({
          valid: true,
          message: "Password meets all requirements",
        });
      }

      case "validate-personal-data": {
        const validation = validatePersonalData(personalData);

        if (!validation.valid) {
          return res.status(400).json({
            valid: false,
            errors: validation.errors,
          });
        }

        return res.status(200).json({
          valid: true,
          message: "Personal data validated",
        });
      }

      case "validate-identity-doc": {
        const validation = validateIdentityDoc(identityDoc);

        if (!validation.valid) {
          return res.status(400).json({
            valid: false,
            errors: validation.errors,
          });
        }

        return res.status(200).json({
          valid: true,
          message: "Identity document validated",
        });
      }

      case "validate-address": {
        const validation = validateAddress(address);

        if (!validation.valid) {
          return res.status(400).json({
            valid: false,
            errors: validation.errors,
          });
        }

        return res.status(200).json({
          valid: true,
          message: "Address validated",
        });
      }

      default:
        return res.status(400).json({ error: "Unknown action" });
    }
  } catch (error) {
    console.error("Validation error:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
