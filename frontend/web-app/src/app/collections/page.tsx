"use client";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import SwirlBackground from "@/components/SwirlBackground";
import React from "react";
import RollingGallery from "./RollingGallery";

const sidebarItems = [
  { name: "Home", icon: "/icons/home.svg", route: "/" },
  { name: "Highlights", icon: "/icons/highlights.svg", route: "/highlights" },
  { name: "Collections", icon: "/icons/collections.svg", route: "/collections" },
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

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function CollectionsPage() {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [highlights, setHighlights] = useState<any[]>([]);
  const [selectedHighlights, setSelectedHighlights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const galleryRef = useRef<any>(null);
  const [showList, setShowList] = useState(false);
  const [removePopup, setRemovePopup] = useState<{id: string, title: string, isOwner: boolean} | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !getCookie('access_token')) {
      router.replace('/login');
      return;
    }
    if (showCreate) {
      setLoading(true);
      setError(null);
      const token = getCookie('access_token');
      if (!token) {
        setLoading(false);
        return;
      }
      fetch('http://localhost:5000/api/highlights/mine', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch highlights'))
        .then(data => setHighlights(data))
        .catch(() => setError('Could not load highlights'))
        .finally(() => setLoading(false));
    }
    // Fetch all accessible collections for the gallery
    const fetchCollections = async () => {
      const token = getCookie('access_token');
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/api/collections/all-accessible', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch collections');
        const data = await res.json();
        setCollections(data.collections || []);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchCollections();
  }, [showCreate, router]);

  const handleHighlightSelect = (id: string) => {
    setSelectedHighlights(prev => prev.includes(id) ? prev.filter(hid => hid !== id) : [...prev, id]);
  };

  const handleCreateCollection = async () => {
    setError(null);
    setSuccess(null);
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (title.length > 255) {
      setError('Title must be at most 255 characters.');
      return;
    }
    setCreateLoading(true);
    try {
      const token = getCookie('access_token');
      if (!token) throw new Error('Not authenticated');
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timestamp = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      const payload = [{ title: title.trim(), description: description.trim(), timestamp }];
      const res = await fetch('http://localhost:5000/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        let msg = err?.error || err?.message;
        if (!msg && err && typeof err === 'object') {
          const fieldErr = Object.values(err).find(v => Array.isArray(v) && v.length && typeof v[0] === 'string');
          if (Array.isArray(fieldErr)) msg = fieldErr[0];
        }
        setError(msg || 'Could not create collection');
        setCreateLoading(false);
        return;
      }
      const data = await res.json();
      // Defensive: ensure we get the id from the first collection in the array
      const collectionId = data.collections && Array.isArray(data.collections) && data.collections[0]?.id ? data.collections[0].id : null;
      if (selectedHighlights.length && collectionId) {
        const addRes = await fetch(`http://localhost:5000/api/collections/${collectionId}/highlights`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(selectedHighlights.map(String))
        });
        if (!addRes.ok) {
          const err = await addRes.json().catch(() => ({}));
          let msg = err?.error || err?.message;
          if (!msg && err && typeof err === 'object') {
            const fieldErr = Object.values(err).find(v => Array.isArray(v) && v.length && typeof v[0] === 'string');
            if (Array.isArray(fieldErr)) msg = fieldErr[0];
          }
          setError('Failed to add highlights to collection: ' + (msg || 'Unknown error'));
          setCreateLoading(false);
          return;
        }
      } else if (selectedHighlights.length && !collectionId) {
        setError('Could not determine new collection ID.');
        setCreateLoading(false);
        return;
      }
      setSuccess('Collection created successfully!');
      setShowCreate(false);
      setTitle("");
      setDescription("");
      setSelectedHighlights([]);
      setHighlights([]);
      // Optionally: refresh collections list here
    } catch (err: any) {
      setError(err.message || 'Could not create collection');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJumpToCollection = (idx: number) => {
    if (galleryRef.current && typeof galleryRef.current.setActiveIdx === 'function') {
      galleryRef.current.setActiveIdx(idx);
      setShowList(false);
    }
  };

  const handleCardClick = (collectionId: string) => {
    router.push(`/collections/${collectionId}`);
  };

  // Remove/leave collection logic
  const handleRequestRemoveCollection = async (collectionId: string) => {
    setRemoveError(null);
    const token = getCookie('access_token');
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/collections/${collectionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch collection info');
      const data = await res.json();
      const collection = data.collection || data; // fallback if not wrapped
      // Parse user id from JWT
      const jwt = parseJwt(token);
      const userId = jwt && (jwt.user_id || jwt.sub || jwt.id);
      const ownerId = collection.owner && collection.owner.id;
      const isOwner = userId && ownerId && userId === ownerId;
      setRemovePopup({ id: collectionId, title: collection.title, isOwner });
    } catch (err: any) {
      setRemoveError(err.message || 'Could not fetch collection info');
    }
  };

  const handleConfirmRemove = async () => {
    if (!removePopup) return;
    setRemoveLoading(true);
    setRemoveError(null);
    const token = getCookie('access_token');
    if (!token) return;
    try {
      let res;
      if (removePopup.isOwner) {
        res = await fetch(`http://localhost:5000/api/collections/${removePopup.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        res = await fetch(`http://localhost:5000/api/collections/${removePopup.id}/collaborators/me`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        let msg = err?.error || err?.message;
        if (!msg && err && typeof err === 'object') {
          const fieldErr = Object.values(err).find(v => Array.isArray(v) && v.length && typeof v[0] === 'string');
          if (Array.isArray(fieldErr)) msg = fieldErr[0];
        }
        setRemoveError(msg || 'Could not remove collection');
      } else {
        setCollections(prev => prev.filter(c => c.id !== removePopup.id));
        setRemovePopup(null);
      }
    } catch (err: any) {
      setRemoveError(err.message || 'Could not remove collection');
    } finally {
      setRemoveLoading(false);
    }
  };

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
          {/* Highlights and Collections (active) in the middle */}
          <div
            key={sidebarItems[1].name}
            title={sidebarItems[1].name}
            className={`flex items-center justify-center w-14 h-14 rounded-2xl cursor-pointer transition-colors text-[#b0b3c7] hover:bg-[#23243a]/60`}
            onClick={() => router.push(sidebarItems[1].route)}
          >
            <Image src={sidebarItems[1].icon} alt={sidebarItems[1].name} width={24} height={24} style={{ filter: 'invert(0.7)' }} />
          </div>
          <div
            key={sidebarItems[2].name}
            title={sidebarItems[2].name}
            className={`flex items-center justify-center w-14 h-14 rounded-2xl cursor-pointer transition-colors bg-gradient-to-br from-[#7f5fff] to-[#5e8bff] text-white shadow-lg`}
            onClick={() => router.push(sidebarItems[2].route)}
          >
            <Image src={sidebarItems[2].icon} alt={sidebarItems[2].name} width={24} height={24} style={{ filter: 'invert(1)' }} />
          </div>
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
              <span className="text-2xl font-bold text-white leading-tight">Collections</span>
              <span className="text-sm text-[#b0b3c7] mt-1">All your collections</span>
            </div>
            <Image src="/logo.png" alt="StudyAid Logo" width={56} height={56} />
          </div>
          {/* Rolling Gallery of collections */}
          <RollingGallery
            ref={galleryRef}
            autoplay={true}
            pauseOnHover={true}
            collections={collections}
            onRequestRemoveCollection={handleRequestRemoveCollection}
            onCardClick={handleCardClick}
          />
          <div className="flex flex-col gap-6 text-white text-lg">
            <div className="flex flex-row items-center justify-end gap-2 mb-4 w-full">
              <button
                className="rounded-xl px-4 py-2 bg-[#23243a] hover:bg-[#7f5fff] text-white font-semibold shadow transition-colors ml-auto"
                onClick={() => setShowList(true)}
                style={{ order: 0 }}
              >Get List</button>
              <button
                className="rounded-full p-2 bg-[#23243a] hover:bg-[#7f5fff] text-white shadow transition-colors"
                aria-label="Previous Collection"
                onClick={() => galleryRef.current?.prev()}
                style={{ outline: 'none', border: 'none', order: 1 }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <button
                className="rounded-full p-2 bg-[#23243a] hover:bg-[#7f5fff] text-white shadow transition-colors"
                aria-label="Next Collection"
                onClick={() => galleryRef.current?.next()}
                style={{ outline: 'none', border: 'none', order: 2 }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
              </button>
            <button
                className="rounded-xl px-6 py-2 bg-gradient-to-r from-[#7f5fff] to-[#5e8bff] text-white font-semibold shadow hover:from-[#5e8bff] hover:to-[#7f5fff] transition-colors"
              onClick={() => setShowCreate(true)}
                style={{ order: 3 }}
            >+ Create Collection</button>
            </div>
            {showList && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-[#23243a] rounded-2xl p-8 shadow-xl flex flex-col gap-4 min-w-[340px] max-w-[90vw] w-full max-h-[80vh] overflow-y-auto relative">
                  <button
                    className="absolute top-2 right-2 text-[#7f5fff] hover:text-white text-2xl font-bold"
                    onClick={() => setShowList(false)}
                  >×</button>
                  <span className="text-white text-lg font-bold mb-2">Collections List</span>
                  <ul className="flex flex-col gap-2">
                    {collections.length === 0 ? (
                      <li className="text-[#b0b3c7] text-center">No collections available.</li>
                    ) : (
                      collections.map((col, idx) => (
                        <li
                          key={col.id || idx}
                          className="bg-[#181c2f] rounded-xl p-3 shadow flex flex-row items-center gap-3 cursor-pointer hover:bg-[#7f5fff]/30 transition-colors relative"
                          onClick={() => router.push(`/collections/${col.id}`)}
                        >
                          <span className="font-semibold text-white truncate max-w-[180px]">{col.title}</span>
                          {col.description && <span className="text-[#b0b3c7] text-xs truncate">{col.description}</span>}
                          <button
                            className="absolute top-2 right-2 z-10 text-[#ff6b6b] hover:text-white text-lg font-bold bg-transparent border-none outline-none"
                            onClick={e => { e.stopPropagation(); handleRequestRemoveCollection(col.id); }}
                            aria-label="Remove Collection"
                          >×</button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            )}
            {/* Modal for creating collection */}
            {showCreate && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-[#23243a] rounded-2xl p-8 shadow-xl flex flex-col gap-6 min-w-[380px] max-w-[90vw] w-full">
                  <span className="text-white text-lg font-bold mb-2">Create a New Collection</span>
                  <input
                    className="rounded-xl px-4 py-2 bg-[#181c2f] text-white border border-[#7f5fff] focus:outline-none focus:ring-2 focus:ring-[#7f5fff]"
                    placeholder="Collection Title"
                    maxLength={255}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                  <textarea
                    className="rounded-xl px-4 py-2 bg-[#181c2f] text-white border border-[#7f5fff] focus:outline-none focus:ring-2 focus:ring-[#7f5fff]"
                    placeholder="Description (optional)"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                  <span className="text-white font-semibold mt-2">Select Highlights to Add</span>
                  <div className="max-h-48 overflow-y-auto flex flex-col gap-2">
                    {loading ? (
                      <div className="text-[#b0b3c7] text-center">Loading highlights...</div>
                    ) : error ? (
                      <div className="text-[#ff6b6b] text-center">{error}</div>
                    ) : highlights.length === 0 ? (
                      <div className="text-[#b0b3c7] text-center">No highlights found.</div>
                    ) : (
                      <ul className="flex flex-col gap-2">
                        {highlights.map((h, i) => (
                          <li key={h.id || i} className="bg-[#23243a] rounded-xl p-4 shadow flex flex-col gap-2 relative">
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={selectedHighlights.includes(h.id)}
                                onChange={() => handleHighlightSelect(h.id)}
                                className="accent-[#7f5fff] w-4 h-4"
                              />
                              <div className="font-semibold text-base text-white cursor-pointer" onClick={() => setExpanded(expanded === i ? null : i)}>
                                {expanded === i ? h.text : (h.text.length > 60 ? h.text.slice(0, 60) : h.text)}
                                {h.text.length > 60 && (
                                  <span className="text-[#7f5fff] ml-2">{expanded === i ? ' (less)' : ' ...'}</span>
                                )}
                              </div>
                            </label>
                            <div className="flex flex-row justify-between text-xs text-[#b0b3c7] pl-7">
                              <span>{getDomain(h.url)}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex gap-4 justify-end mt-4">
                    <button
                      className="rounded-xl px-6 py-2 bg-gradient-to-r from-[#7f5fff] to-[#5e8bff] text-white font-semibold shadow hover:from-[#5e8bff] hover:to-[#7f5fff] transition-colors"
                      onClick={handleCreateCollection}
                      disabled={!title.trim() || createLoading}
                    >
                    {createLoading ? 'Creating...' : 'Create'}</button>
                    <button
                      className="rounded-xl px-6 py-2 bg-[#23243a] border border-[#7f5fff] text-[#7f5fff] font-semibold shadow hover:bg-[#181c2f] transition-colors"
                      onClick={() => setShowCreate(false)}
                    >Cancel</button>
                  </div>
                </div>
              </div>
            )}
            {/* Remove/Leave confirmation popup */}
            {removePopup && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-[#23243a] rounded-2xl p-8 shadow-xl flex flex-col gap-6 min-w-[340px] max-w-[90vw] w-full max-h-[80vh] overflow-y-auto relative">
                  <button
                    className="absolute top-2 right-2 text-[#7f5fff] hover:text-white text-2xl font-bold"
                    onClick={() => setRemovePopup(null)}
                  >×</button>
                  <span className="text-white text-lg font-bold mb-2">{removePopup.isOwner ? 'Delete Collection' : 'Leave Collection'}</span>
                  <div className="text-[#b0b3c7] text-base">
                    {removePopup.isOwner
                      ? <>Are you sure you want to delete the collection <span className="text-[#7f5fff] font-semibold">{removePopup.title}</span>?</>
                      : <>You are not the owner of this collection. You can't delete it. Proceed with leaving the collection <span className="text-[#7f5fff] font-semibold">{removePopup.title}</span>?</>
                    }
                  </div>
                  {removeError && <div className="text-[#ff6b6b] text-sm">{removeError}</div>}
                  <div className="flex gap-4 justify-end mt-4">
                    <button
                      className="rounded-xl px-6 py-2 bg-[#ff6b6b] text-white font-semibold shadow hover:bg-[#ff4b4b] transition-colors"
                      onClick={handleConfirmRemove}
                      disabled={removeLoading}
                    >{removePopup.isOwner ? 'Delete' : 'Leave'}</button>
                    <button
                      className="rounded-xl px-6 py-2 bg-[#23243a] border border-[#7f5fff] text-[#7f5fff] font-semibold shadow hover:bg-[#181c2f] transition-colors"
                      onClick={() => setRemovePopup(null)}
                      disabled={removeLoading}
                    >Cancel</button>
                  </div>
                </div>
              </div>
            )}
            {/* TODO: List collections here */}
           {success && <div className="text-green-400 text-center font-semibold mb-2">{success}</div>}
           {collections.length === 0 && (
             <div className="text-[#b0b3c7] text-center">No collections yet.</div>
           )}
          </div>
        </div>
      </main>
    </div>
  );
} 