"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import s from "./login.module.scss";

const OTP_LENGTH = 4;
const API_BASE =
  "https://enrolment-portal.getvisitapp.net/optin/opt-in/visitapp";
const CORPORATE_ID = 217;
const CORPORATE_NAME = "Visit OPD";
const TOKEN_KEY = "opd_auth_token";
const USER_KEY = "opd_user_info";

type UserInfo = {
  userId: number;
  isNewUser?: boolean;
  enrolmentCompleted?: boolean;
  visitPaymentMade?: boolean;
};

type ApiResponse = {
  userInfo?: UserInfo;
  authToken?: string;
  errorMessage?: string;
  message?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp" | "submitted">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [userId, setUserId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const phoneValid = phone.length === 10;
  const otpValid = otp.every((d) => d !== "");

  function handlePhoneChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);
  }

  async function sendOtp() {
    if (!phoneValid || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/identify-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          corporateId: CORPORATE_ID,
          corporateName: CORPORATE_NAME,
        }),
      });
      const data: ApiResponse = await res.json();
      if (!res.ok || !data.userInfo) {
        throw new Error(
          data.errorMessage || data.message || "Something went wrong",
        );
      }
      if (data.userInfo.enrolmentCompleted) {
        setStep("submitted");
        return;
      }
      setUserId(data.userInfo.userId);
      setOtp(Array(OTP_LENGTH).fill(""));
      setStep("otp");
      setResendTimer(25);
      requestAnimationFrame(() => otpRefs.current[0]?.focus());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    setError("");
    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!digits) return;
    const next = Array(OTP_LENGTH).fill("");
    digits.split("").forEach((d, i) => (next[i] = d));
    setOtp(next);
    otpRefs.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus();
  }

  async function verifyOtp() {
    if (!otpValid || userId == null || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp: otp.join(""), phone }),
      });
      const data: ApiResponse = await res.json();
      const token = data.authToken || res.headers.get("Authorization") || "";
      if (!res.ok || !token) {
        throw new Error(data.errorMessage || data.message || "Invalid OTP");
      }
      sessionStorage.setItem(TOKEN_KEY, token);
      if (data.userInfo) {
        sessionStorage.setItem(USER_KEY, JSON.stringify(data.userInfo));
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={s.page}>
      <main className={s.main}>
        <div className={s.content}>
          {step === "phone" && (
            <>
              <h1 className={s.headline}>
                Unlock up to <span className={s.highlight}>₹25,000</span> in
                healthcare savings every year
              </h1>

              <Image
                className={s.banner}
                src="/images/LoginPageBanner.png"
                alt="OPD Pass Gold — Doctor consultations, lab tests & medicines at a discount"
                width={933}
                height={570}
                priority
              />

              <label className={s.fieldLabel} htmlFor="mobile-number">
                Enter your mobile number
              </label>
              <div className={s.phoneField}>
                <input
                  id="mobile-number"
                  className={s.phoneInput}
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                  autoFocus
                />
              </div>

              {error && <p className={s.error}>{error}</p>}

              <button
                type="button"
                className={s.submit}
                onClick={sendOtp}
                disabled={!phoneValid || loading}
              >
                {loading ? "Sending…" : "Get OTP"}
              </button>

              <p className={s.terms}>
                By continuing you agree to our <span>Terms</span> and{" "}
                <span>Privacy Policy</span>.
              </p>
            </>
          )}

          {step === "otp" && (
            <>
              <h1 className={s.headline}>
                Unlock up to <span className={s.highlight}>₹25,000</span> in
                healthcare savings every year
              </h1>

              <Image
                className={s.banner}
                src="/images/LoginPageBanner.png"
                alt="OPD Pass Gold — Doctor consultations, lab tests & medicines at a discount"
                width={933}
                height={570}
                priority
              />

              <h1 className={s.title}>Enter OTP</h1>
              <p className={s.subtitle}>
                Please enter the OTP that has been sent to{" "}
                <strong className={s.phoneStrong}>+91-{phone}</strong>
              </p>

              <div className={s.otpRow}>
                {otp.map((digit, i) => (
                  <input
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    className={s.otpInput}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={handleOtpPaste}
                  />
                ))}
              </div>

              {error && <p className={s.error}>{error}</p>}

              <p className={s.resend}>
                {resendTimer > 0 ? (
                  <>Resend OTP in {resendTimer}s</>
                ) : (
                  <button
                    type="button"
                    className={s.resendBtn}
                    onClick={sendOtp}
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                )}
              </p>
              <button
                type="button"
                className={s.submit}
                onClick={verifyOtp}
                disabled={!otpValid || loading}
              >
                {loading ? "Verifying…" : "Verify & Continue"}
              </button>

              <p className={s.terms}>
                By continuing you agree to our <span>Terms</span> and{" "}
                <span>Privacy Policy</span>.
              </p>
            </>
          )}

          {step === "submitted" && (
            <>
              <h1 className={s.title}>You&apos;re already enrolled</h1>
              <p className={s.subtitle}>
                You&apos;ve already submitted your details for the OPD Pass. No
                further action is needed.
              </p>
              <button
                type="button"
                className={s.submit}
                onClick={() => router.push("/")}
              >
                Go to Home
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
