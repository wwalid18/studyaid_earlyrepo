"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SwirlBackground from "@/components/SwirlBackground";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem("reset_token") || "";
    setToken(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const password = passwordRef.current?.value || '';
    const confirmPassword = confirmPasswordRef.current?.value || '';
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password })
      });
      if (response.status === 200) {
        localStorage.removeItem('reset_token');
        setSuccess('Password changed successfully! You can now log in.');
        setTimeout(() => router.push('/login'), 1500);
      } else {
        const err = await response.json().catch(() => ({}));
        setError(err?.message || 'Reset failed. Please try again.');
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
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Change your password</h1>
        </div>
        <form className="flex flex-col gap-4 z-10" onSubmit={handleSubmit}>
          <input
            ref={passwordRef}
            type="password"
            placeholder="New Password"
            className="rounded-xl px-5 py-3 bg-[#23243a] text-white placeholder-[#b0b3c7] border border-[#23243a] text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#7f5fff] shadow"
            required
          />
          <input
            ref={confirmPasswordRef}
            type="password"
            placeholder="Confirm New Password"
            className="rounded-xl px-5 py-3 bg-[#23243a] text-white placeholder-[#b0b3c7] border border-[#23243a] text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#7f5fff] shadow"
            required
          />
          <Button type="submit" className="w-full mt-2 rounded-xl font-semibold bg-gradient-to-r from-[#7f5fff] to-[#5e8bff] text-white shadow-md hover:from-[#5e8bff] hover:to-[#7f5fff] transition-colors py-3 text-base" disabled={loading}>{loading ? 'Changing...' : 'Change password'}</Button>
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