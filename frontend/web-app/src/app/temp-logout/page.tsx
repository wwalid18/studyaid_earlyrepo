"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import SwirlBackground from "@/components/SwirlBackground";
import Image from "next/image";

function removeAccessTokenCookie() {
  document.cookie = 'access_token=; Max-Age=0; path=/;';
}

export default function TempLogoutPage() {
  const router = useRouter();

  const handleLogout = () => {
    removeAccessTokenCookie();
    router.replace('/login');
    setTimeout(() => window.location.href = '/login', 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181c2f] to-[#23243a]">
      <div className="relative w-[360px] h-[600px] max-w-full flex flex-col items-center justify-center rounded-3xl shadow-2xl p-8 bg-gradient-to-br from-[#181c2f] to-[#23243a] overflow-hidden">
        <SwirlBackground />
        <div className="flex flex-col items-center z-10 mt-6 mb-8">
          <Image src="/logo.png" alt="StudyAid Logo" width={64} height={64} className="mb-4" />
          <h1 className="text-2xl font-bold text-white mb-6 text-center">You are logged in</h1>
        </div>
        <Button onClick={handleLogout} className="w-full mt-2 rounded-xl font-semibold bg-gradient-to-r from-[#7f5fff] to-[#5e8bff] text-white shadow-md hover:from-[#5e8bff] hover:to-[#7f5fff] transition-colors py-3 text-base z-10">
          Logout
        </Button>
      </div>
    </div>
  );
} 