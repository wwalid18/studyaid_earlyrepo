"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SwirlBackground from "@/components/SwirlBackground";
import React from "react";

const sidebarItems = [
  { name: "Home", icon: "/icons/home.svg", route: "/" },
  { name: "Highlights", icon: "/icons/highlights.svg", route: "/highlights" },
  { name: "Collections", icon: "/icons/collections.svg", route: "/collection" },
  { name: "Settings", icon: "/icons/settings.svg", route: "/settings" },
];

function getCookie(name: string) {
  return document.cookie.split('; ').find(row => row.startsWith(name + '='))?.split('=')[1];
}

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

export default function HighlightsPage() {
  const router = useRouter();
  const [highlights, setHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (typeof window !== 'undefined' && !getCookie('access_token')) {
      router.replace('/login');
      return;
    }
    // Fetch highlights for authenticated user
    const fetchHighlights = async () => {
      setLoading(true);
      setError(null);
      const token = getCookie('access_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('http://localhost:5000/api/highlights/mine', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch highlights');
        const data = await res.json();
        setHighlights(data);
      } catch (err) {
        setError('Could not load highlights');
      } finally {
        setLoading(false);
      }
    };
    fetchHighlights();
  }, [router]);

  const handleDelete = async (highlightId: string, idx: number) => {
    setDeleting(true);
    setError(null);
    const token = getCookie('access_token');
    try {
      const res = await fetch(`http://localhost:5000/api/highlights/${highlightId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete highlight');
      setHighlights(prev => prev.filter((_, i) => i !== idx));
      setConfirmDeleteIdx(null);
    } catch (err) {
      setError('Could not delete highlight');
    } finally {
      setDeleting(false);
    }
  };

  const truncate = (text: string, max = 60) => text.length > max ? text.slice(0, max) : text;

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-[#181c2f] to-[#23243a]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 w-[90px] min-w-[72px] max-w-[120px] h-screen flex flex-col justify-between items-center bg-[#20223a]/80 shadow-xl py-8 z-30">
        <div className="flex flex-col gap-8 items-center flex-1 justify-center">
          {/* Home at the top */}
          <div
            key={sidebarItems[0].name}
            title={sidebarItems[0].name}
            className={`flex items-center justify-center w-14 h-14 rounded-2xl cursor-pointer transition-colors text-[#b0b3c7] hover:bg-[#23243a]/60`}
            onClick={() => router.push(sidebarItems[0].route)}
          >
            <Image src={sidebarItems[0].icon} alt={sidebarItems[0].name} width={24} height={24} style={{ filter: 'invert(0.7)' }} />
          </div>
          {/* Highlights (active) and Collections in the middle */}
          <div
            key={sidebarItems[1].name}
            title={sidebarItems[1].name}
            className={`flex items-center justify-center w-14 h-14 rounded-2xl cursor-pointer transition-colors bg-gradient-to-br from-[#7f5fff] to-[#5e8bff] text-white shadow-lg`}
            onClick={() => router.push(sidebarItems[1].route)}
          >
            <Image src={sidebarItems[1].icon} alt={sidebarItems[1].name} width={24} height={24} style={{ filter: 'invert(1)' }} />
          </div>
          {sidebarItems.slice(2, 3).map((item) => (
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
      <main className="flex-1 flex flex-col items-center justify-center relative overflow-y-auto min-h-screen ml-[90px]">
        <SwirlBackground />
        <div className="relative w-full max-w-4xl mx-auto flex flex-col items-stretch rounded-3xl shadow-2xl p-10 md:p-16 bg-gradient-to-br from-[#181c2f]/90 to-[#23243a]/90 z-10 gap-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 md:mb-10">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white leading-tight">Your Highlights</span>
              <span className="text-sm text-[#b0b3c7] mt-1">All your highlights</span>
            </div>
            <Image src="/logo.png" alt="StudyAid Logo" width={56} height={56} />
          </div>
          <div className="flex flex-col gap-6 text-white text-lg">
            {loading ? (
              <div className="text-[#b0b3c7] text-center">Loading highlights...</div>
            ) : error ? (
              <div className="text-[#ff6b6b] text-center">{error}</div>
            ) : highlights.length === 0 ? (
              <div className="text-[#b0b3c7] text-center">No highlights found.</div>
            ) : (
              <ul className="flex flex-col gap-4">
                {highlights.map((h, i) => (
                  <li key={h.id || i} className="bg-[#23243a] rounded-xl p-5 shadow flex flex-col gap-2 relative">
                    {/* Delete button */}
                    <button
                      className="absolute top-3 right-3 text-[#b0b3c7] hover:text-[#ff6b6b] text-xl font-bold focus:outline-none"
                      title="Delete highlight"
                      onClick={() => setConfirmDeleteIdx(i)}
                    >×</button>
                    {/* Delete confirmation modal */}
                    {confirmDeleteIdx === i && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="bg-[#23243a] rounded-2xl p-8 shadow-xl flex flex-col items-center gap-6 min-w-[320px]">
                          <span className="text-white text-lg">Delete this highlight?</span>
                          <div className="flex gap-4">
                            <button
                              className="rounded-xl px-6 py-2 bg-gradient-to-r from-[#7f5fff] to-[#5e8bff] text-white font-semibold shadow hover:from-[#5e8bff] hover:to-[#7f5fff] transition-colors"
                              onClick={() => handleDelete(h.id, i)}
                              disabled={deleting}
                            >{deleting ? 'Deleting...' : 'Delete'}</button>
                            <button
                              className="rounded-xl px-6 py-2 bg-[#23243a] border border-[#7f5fff] text-[#7f5fff] font-semibold shadow hover:bg-[#181c2f] transition-colors"
                              onClick={() => setConfirmDeleteIdx(null)}
                              disabled={deleting}
                            >Cancel</button>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Highlight text with show more/less */}
                    <div className="font-semibold text-base text-white cursor-pointer" onClick={() => setExpanded(expanded === i ? null : i)}>
                      {expanded === i ? h.text : truncate(h.text)}
                      {h.text.length > 60 && (
                        <span className="text-[#7f5fff] ml-2">{expanded === i ? ' (less)' : ' ...'}</span>
                      )}
                    </div>
                    {/* Meta: short link and date */}
                    <div className="flex flex-row justify-between text-xs text-[#b0b3c7]">
                      <span>{getDomain(h.url)}</span>
                      <span>{h.timestamp ? new Date(h.timestamp).toLocaleDateString() : ''}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 