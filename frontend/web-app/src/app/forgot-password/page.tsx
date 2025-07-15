"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SwirlBackground from "@/components/SwirlBackground";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useRef, useState } from "react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const email = emailRef.current?.value || '';
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (response.status === 200) {
        const data = await response.json();
        localStorage.setItem('reset_token', data.token);
        setSuccess(data?.message || 'Reset link sent! Check your email.');
        setTimeout(() => router.push('/reset-password'), 1200);
      } else {
        const err = await response.json().catch(() => ({}));
        let msg = err?.error || err?.message;
        if (!msg && err && typeof err === 'object') {
          const fieldErr = Object.values(err).find(v => Array.isArray(v) && v.length && typeof v[0] === 'string');
          if (fieldErr) msg = fieldErr[0];
        }
        setError(msg || 'Request failed. Please try again.');
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
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Enter your email</h1>
        </div>
        <form className="flex flex-col gap-4 z-10" onSubmit={handleSubmit}>
          <input
            ref={emailRef}
            type="email"
            placeholder="Email"
            className="rounded-xl px-5 py-3 bg-[#23243a] text-white placeholder-[#b0b3c7] border border-[#23243a] text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#7f5fff] shadow"
            required
          />
          <Button type="submit" className="w-full mt-2 rounded-xl font-semibold bg-gradient-to-r from-[#7f5fff] to-[#5e8bff] text-white shadow-md hover:from-[#5e8bff] hover:to-[#7f5fff] transition-colors py-3 text-base" disabled={loading}>{loading ? 'Sending...' : 'Continue'}</Button>
          {error && <div style={{ color: '#ff6b6b', marginTop: 8, textAlign: 'center', fontSize: '0.98rem', background: 'rgba(255,107,107,0.08)', borderRadius: 6, padding: '4px 0' }}>{error}</div>}
          {success && <div style={{ color: '#7f5fff', marginTop: 8, textAlign: 'center', fontSize: '0.98rem', background: 'rgba(127,95,255,0.08)', borderRadius: 6, padding: '4px 0' }}>{success}</div>}
        </form>
        <div className="flex justify-center text-sm text-white/80 mt-6 z-10">
          <Link href="/login" className="hover:underline text-white font-semibold">Back to login</Link>
        </div>
      </div>
    </div>
  );
} 