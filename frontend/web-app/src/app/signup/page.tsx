"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SwirlBackground from "@/components/SwirlBackground";
import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Eye icon SVGs
const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="8" ry="5" /><circle cx="12" cy="12" r="2.5" /><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" opacity=".2"/></svg>
) : (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="8" ry="5" /><path d="M3 3l18 18" stroke="#b0b3c7" strokeWidth="2"/><circle cx="12" cy="12" r="2.5" /><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" opacity=".2"/></svg>
);

export default function SignupPage() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const username = usernameRef.current?.value || '';
    const email = emailRef.current?.value || '';
    const password = passwordRef.current?.value || '';
    const confirmPassword = confirmPasswordRef.current?.value || '';
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      if (response.status === 201) {
        router.push('/login');
      } else {
        const err = await response.json().catch(() => ({}));
        let msg = err?.error || err?.message;
        if (!msg && err && typeof err === 'object') {
          // Check for field errors
          const fieldErr = Object.values(err).find(v => Array.isArray(v) && v.length && typeof v[0] === 'string');
          if (fieldErr) msg = fieldErr[0];
        }
        setError(msg || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181c2f] to-[#23243a]">
      <div className="relative w-[360px] h-[600px] max-w-full flex flex-col items-stretch rounded-3xl shadow-2xl p-8 bg-gradient-to-br from-[#181c2f] to-[#23243a] overflow-hidden">
        <SwirlBackground />
        <div className="flex flex-col items-center z-10 mt-6 mb-8">
          <Image src="/logo.png" alt="StudyAid Logo" width={64} height={64} className="mb-4" />
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Create your account</h1>
        </div>
        <form className="flex flex-col gap-4 z-10" onSubmit={handleSubmit}>
          <input
            ref={usernameRef}
            type="text"
            placeholder="Username"
            className="rounded-xl px-5 py-3 bg-[#23243a] text-white placeholder-[#b0b3c7] border border-[#23243a] text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#7f5fff] shadow"
            required
          />
          <input
            ref={emailRef}
            type="email"
            placeholder="Email"
            className="rounded-xl px-5 py-3 bg-[#23243a] text-white placeholder-[#b0b3c7] border border-[#23243a] text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#7f5fff] shadow"
            required
          />
          <div className="relative">
            <input
              ref={passwordRef}
              type={showPw ? "text" : "password"}
              placeholder="Password"
              className="rounded-xl px-5 py-3 pr-10 bg-[#23243a] text-white placeholder-[#b0b3c7] border border-[#23243a] text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#7f5fff] shadow"
              required
            />
            <button
              type="button"
              aria-label={showPw ? 'Hide password' : 'Show password'}
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#b0b3c7] hover:text-white focus:outline-none"
              tabIndex={0}
            >
              <EyeIcon open={showPw} />
            </button>
          </div>
          <div className="relative">
            <input
              ref={confirmPasswordRef}
              type={showPw2 ? "text" : "password"}
              placeholder="Confirm Password"
              className="rounded-xl px-5 py-3 pr-10 bg-[#23243a] text-white placeholder-[#b0b3c7] border border-[#23243a] text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#7f5fff] shadow"
              required
            />
            <button
              type="button"
              aria-label={showPw2 ? 'Hide password' : 'Show password'}
              onClick={() => setShowPw2(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#b0b3c7] hover:text-white focus:outline-none"
              tabIndex={0}
            >
              <EyeIcon open={showPw2} />
            </button>
          </div>
          <Button type="submit" className="w-full mt-2 rounded-xl font-semibold bg-gradient-to-r from-[#7f5fff] to-[#5e8bff] text-white shadow-md hover:from-[#5e8bff] hover:to-[#7f5fff] transition-colors py-3 text-base" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</Button>
          {error && <div style={{ color: '#ff6b6b', marginTop: 8, textAlign: 'center', fontSize: '0.98rem' }}>{error}</div>}
        </form>
        <div className="flex justify-center text-sm text-white/80 mt-6 z-10">
          <span>Already have an account? <Link href="/login" className="hover:underline text-white font-semibold">Login</Link></span>
        </div>
      </div>
    </div>
  );
} 