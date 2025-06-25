"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SwirlBackground from "@/components/SwirlBackground";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function setAccessTokenCookie(token: string) {
  document.cookie = `access_token=${token}; path=/; domain=localhost; SameSite=Lax`;
}
function removeAccessTokenCookie() {
  document.cookie = 'access_token=; Max-Age=0; path=/;';
}
function getCookie(name: string) {
  return document.cookie.split('; ').find(row => row.startsWith(name + '='))?.split('=')[1];
}

export default function LoginPage() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (getCookie('access_token')) {
      router.replace('/temp-logout');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const email = emailRef.current?.value || '';
    const password = passwordRef.current?.value || '';
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (response.status === 200) {
        const data = await response.json();
        const accessToken = data.access_token;
        setAccessTokenCookie(accessToken);
        router.push('/temp-logout');
        setTimeout(() => window.location.reload(), 100);
      } else {
        const err = await response.json().catch(() => ({}));
        setError(err?.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Example logout handler (call this on logout action)
  // removeAccessTokenCookie();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181c2f] to-[#23243a]">
      <div className="relative w-[360px] h-[600px] max-w-full flex flex-col items-stretch rounded-3xl shadow-2xl p-8 bg-gradient-to-br from-[#181c2f] to-[#23243a] overflow-hidden">
        <SwirlBackground />
        <div className="flex flex-col items-center z-10 mt-6 mb-8">
          <Image src="/logo.png" alt="StudyAid Logo" width={64} height={64} className="mb-4" />
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Get Started With<br />StudyAid AI</h1>
        </div>
        <form className="flex flex-col gap-4 z-10" onSubmit={handleSubmit}>
          <input
            ref={emailRef}
            type="email"
            placeholder="Email"
            className="rounded-xl px-5 py-3 bg-[#23243a] text-white placeholder-[#b0b3c7] border border-[#23243a] text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#7f5fff] shadow"
            required
          />
          <input
            ref={passwordRef}
            type="password"
            placeholder="Password"
            className="rounded-xl px-5 py-3 bg-[#23243a] text-white placeholder-[#b0b3c7] border border-[#23243a] text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#7f5fff] shadow"
            required
          />
          <div className="flex justify-between text-xs text-white/80 mt-1">
            <Link href="/forgot-password" className="hover:underline">forgot password?</Link>
          </div>
          <Button type="submit" className="w-full mt-2 rounded-xl font-semibold bg-gradient-to-r from-[#7f5fff] to-[#5e8bff] text-white shadow-md hover:from-[#5e8bff] hover:to-[#7f5fff] transition-colors py-3 text-base" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</Button>
          {error && <div style={{ color: '#ff6b6b', marginTop: 8, textAlign: 'center', fontSize: '0.98rem' }}>{error}</div>}
        </form>
        <div className="flex justify-center text-sm text-white/80 mt-6 z-10">
          <span>New to StudyAid ? <Link href="/signup" className="hover:underline text-white font-semibold">Create account</Link></span>
        </div>
      </div>
    </div>
  );
} 