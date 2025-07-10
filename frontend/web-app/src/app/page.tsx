"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SwirlBackground from "@/components/SwirlBackground";

const sidebarItems = [
  { name: "Home", icon: "/icons/home.svg", route: "/" },
  { name: "Highlights", icon: "/icons/highlights.svg", route: "/highlights" },
  { name: "Collections", icon: "/icons/collections.svg", route: "/collections" },
  { name: "Settings", icon: "/icons/settings.svg", route: "/settings" },
];

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = document.cookie.split('; ').find(row => row.startsWith('access_token='));
      if (!token) {
        router.replace('/login');
      }
    }
  }, [router]);
  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-[#181c2f] to-[#23243a]">
      {/* Sidebar */}
      <aside className="w-[90px] min-w-[72px] max-w-[120px] h-screen flex flex-col justify-between items-center bg-[#20223a]/80 shadow-xl py-8">
        <div className="flex flex-col gap-8 items-center flex-1 justify-center">
          {/* Home at the top */}
          <div
            key={sidebarItems[0].name}
            title={sidebarItems[0].name}
            className={`flex items-center justify-center w-14 h-14 rounded-2xl cursor-pointer transition-colors bg-gradient-to-br from-[#7f5fff] to-[#5e8bff] text-white shadow-lg`}
            onClick={() => router.push(sidebarItems[0].route)}
          >
            <Image src={sidebarItems[0].icon} alt={sidebarItems[0].name} width={24} height={24} style={{ filter: 'invert(1)' }} />
          </div>
          {/* Highlights and Collections in the middle */}
          {sidebarItems.slice(1, 3).map((item) => (
            <div
              key={item.name}
              title={item.name}
              className={`flex items-center justify-center w-14 h-14 rounded-2xl cursor-pointer transition-colors text-[#b0b3c7] hover:bg-[#23243a]/60`}
              onClick={() => router.push(item.route)}
            >
              <Image src={item.icon} alt={item.name} width={24} height={24} style={{ filter: 'invert(0.7)' }} />
            </div>
          ))}
        </div>
        {/* Settings at the bottom */}
        <div
          key={sidebarItems[3].name}
          title={sidebarItems[3].name}
          className={`flex items-center justify-center w-14 h-14 rounded-2xl cursor-pointer transition-colors text-[#b0b3c7] hover:bg-[#23243a]/60 mb-2`}
          onClick={() => router.push(sidebarItems[3].route)}
        >
          <Image src={sidebarItems[3].icon} alt={sidebarItems[3].name} width={24} height={24} style={{ filter: 'invert(0.7)' }} />
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center relative overflow-y-auto min-h-screen">
        <SwirlBackground />
        <div className="relative w-full max-w-2xl mx-auto flex flex-col items-stretch rounded-3xl shadow-2xl p-8 md:p-12 bg-gradient-to-br from-[#181c2f]/90 to-[#23243a]/90 z-10 gap-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 md:mb-10">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white leading-tight">Welcome to StudyAid Extension</span>
              <span className="text-sm text-[#b0b3c7] mt-1">Your AI-powered study companion</span>
            </div>
            <Image src="/logo.png" alt="StudyAid Logo" width={56} height={56} />
          </div>
          <div className="flex flex-col gap-6 text-white text-lg">
            <p>
              <b>StudyAid Extension</b> is a browser extension and web app that helps you save, organize, and review highlights from any web page. Select text on any site, save it as a highlight, and sync it to your StudyAid account. Export your highlights to your personal database, manage your profile and security, and access your collection from anywhere. The extension keeps your login state in sync with the web app for a seamless experience.
            </p>
            <p>
              <b>How it works:</b> <br />
              1. Select text on any web page and use the extension to save it as a highlight.<br />
              2. View and manage your highlights in the extension or on the web app.<br />
              3. Export your highlights to your StudyAid account database with one click.<br />
              4. Manage your profile, security, and account settings in the web app.<br />
              5. All your highlights and settings are kept in sync between the extension and the web app.
            </p>
          </div>
          <footer className="mt-10 pt-6 border-t border-[#23243a] text-center text-[#b0b3c7] text-sm">
            Created by <b>Walid Chaouachi</b>, first year student at Holberton School.<br />
            This project is my first year PFA (Projet de Fin d'Année) project.
          </footer>
        </div>
      </main>
    </div>
  );
}
