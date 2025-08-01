"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import SwirlBackground from "@/components/SwirlBackground";

const sidebarItems = [
  { name: "Home", icon: "/icons/home.svg", route: "/" },
  { name: "Highlights", icon: "/icons/highlights.svg", route: "/highlights" },
  { name: "Collections", icon: "/icons/collections.svg", route: "/collections" },
  { name: "Settings", icon: "/icons/settings.svg", route: "/settings" },
];

function getCookie(name: string) {
  return document.cookie.split('; ').find(row => row.startsWith(name + '='))?.split('=')[1];
}

export default function CollectionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [collection, setCollection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddHighlight, setShowAddHighlight] = useState(false);
  const [userHighlights, setUserHighlights] = useState<any[]>([]);
  const [selectedHighlightIds, setSelectedHighlightIds] = useState<string[]>([]);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [showEditCollaborators, setShowEditCollaborators] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [collabLoading, setCollabLoading] = useState(false);
  const [collabError, setCollabError] = useState<string | null>(null);
  const [removeCollabLoading, setRemoveCollabLoading] = useState<string | null>(null); // user id being removed
  const [isOwner, setIsOwner] = useState(false);
  const [removeHighlightLoading, setRemoveHighlightLoading] = useState<string | null>(null);
  const [removeHighlightError, setRemoveHighlightError] = useState<string | null>(null);
  const [showSummaries, setShowSummaries] = useState(false);
  const [showGenerateSummary, setShowGenerateSummary] = useState(false);
  const [selectedSummaryHighlights, setSelectedSummaryHighlights] = useState<string[]>([]);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [removeSummaryLoading, setRemoveSummaryLoading] = useState<string | null>(null);
  const [removeSummaryError, setRemoveSummaryError] = useState<string | null>(null);
  const [showSummaryDetails, setShowSummaryDetails] = useState(false);
  const [summaryDetails, setSummaryDetails] = useState<any>(null);
  const [summaryDetailsLoading, setSummaryDetailsLoading] = useState(false);
  const [summaryDetailsError, setSummaryDetailsError] = useState<string | null>(null);
  const [showHighlightsModal, setShowHighlightsModal] = useState(false);
  const [highlightsToShow, setHighlightsToShow] = useState<any[]>([]);
  const [quiz, setQuiz] = useState<any>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);

  // Helper to get user id from JWT
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

  useEffect(() => {
    if (!collection?.owner?.id) {
      setIsOwner(false);
      return;
    }
    if (typeof window === 'undefined') return;
    const token = getCookie('access_token');
    if (!token) return setIsOwner(false);
    const jwt = parseJwt(token);
    const userId = jwt && (jwt.user_id || jwt.sub || jwt.id);
    setIsOwner(!!userId && userId === collection.owner.id);
  }, [collection]);

  useEffect(() => {
    if (!id) return;
    const token = getCookie('access_token');
    if (!token) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/collections/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject('Not found'))
      .then(data => setCollection(data.collection || data))
      .catch(() => setError('Collection not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const openAddHighlightModal = async () => {
    setAddError(null);
    setSelectedHighlightIds([]);
    setShowAddHighlight(true);
    const token = getCookie('access_token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/highlights/mine', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        let msg = err?.error || err?.message;
        if (!msg && err && typeof err === 'object') {
          const fieldErr = Object.values(err).find(v => Array.isArray(v) && v.length && typeof v[0] === 'string');
          if (Array.isArray(fieldErr)) msg = fieldErr[0];
        }
        setAddError(msg || 'Could not fetch your highlights');
        return;
      }
      const data = await res.json();
      setUserHighlights(data);
    } catch (err: any) {
      setAddError(err.message || 'Could not fetch your highlights');
      setUserHighlights([]);
    }
  };

  const handleSelectHighlight = (id: string) => {
    setSelectedHighlightIds(prev => prev.includes(id)
      ? prev.filter(hid => hid !== id)
      : [...prev, id]
    );
  };

  const handleAddHighlight = async () => {
    setAddError(null);
    if (selectedHighlightIds.length === 0) {
      setAddError("Please select at least one highlight.");
      return;
    }
    setAddLoading(true);
    const token = getCookie('access_token');
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/collections/${id}/highlights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(selectedHighlightIds.map(String))
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        let msg = err?.error || err?.message;
        if (!msg && err && typeof err === 'object') {
          const fieldErr = Object.values(err).find(v => Array.isArray(v) && v.length && typeof v[0] === 'string');
          if (Array.isArray(fieldErr)) msg = fieldErr[0];
        }
        setAddError(msg || 'Could not add highlight(s)');
        return;
      }
      const data = await res.json();
      setCollection((prev: any) => ({ ...prev, highlights: [...(prev?.highlights || []), ...(data.highlights || [])] }));
      setShowAddHighlight(false);
      setSelectedHighlightIds([]);
    } catch (err: any) {
      setAddError(err.message || 'Could not add highlight(s)');
    } finally {
      setAddLoading(false);
    }
  };

  const handleAddCollaborator = async () => {
    setCollabError(null);
    if (!collaboratorEmail.trim()) {
      setCollabError("Email is required.");
      return;
    }
    setCollabLoading(true);
    const token = getCookie('access_token');
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/collections/${id}/collaborators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: collaboratorEmail })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        let msg = err?.error || err?.message;
        if (!msg && err && typeof err === 'object') {
          const fieldErr = Object.values(err).find(v => Array.isArray(v) && v.length && typeof v[0] === 'string');
          if (Array.isArray(fieldErr)) msg = fieldErr[0];
        }
        setCollabError(msg || 'Could not add collaborator');
        return;
      }
      const data = await res.json();
      setCollection((prev: any) => ({ ...prev, collaborators: [...(prev?.collaborators || []), data.collaborator] }));
      setCollaboratorEmail("");
    } catch (err: any) {
      setCollabError(err.message || 'Could not add collaborator');
    } finally {
      setCollabLoading(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    setRemoveCollabLoading(userId);
    setCollabError(null);
    const token = getCookie('access_token');
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/collections/${id}/collaborators/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        let msg = err?.error || err?.message;
        if (!msg && err && typeof err === 'object') {
          const fieldErr = Object.values(err).find(v => Array.isArray(v) && v.length && typeof v[0] === 'string');
          if (Array.isArray(fieldErr)) msg = fieldErr[0];
        }
        setCollabError(msg || 'Could not remove collaborator');
        return;
      }
      setCollection((prev: any) => ({
        ...prev,
        collaborators: (prev?.collaborators || []).filter((c: any) => c.id !== userId)
      }));
    } catch (err: any) {
      setCollabError(err.message || 'Could not remove collaborator');
    } finally {
      setRemoveCollabLoading(null);
    }
  };

  const handleRemoveHighlight = async (highlightId: string) => {
    setRemoveHighlightLoading(highlightId);
    setRemoveHighlightError(null);
    const token = getCookie('access_token');
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/collections/${id}/highlights/${highlightId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        let msg = err?.error || err?.message;
        if (!msg && err && typeof err === 'object') {
          const fieldErr = Object.values(err).find(v => Array.isArray(v) && v.length && typeof v[0] === 'string');
          if (Array.isArray(fieldErr)) msg = fieldErr[0];
        }
        setRemoveHighlightError(msg || 'Could not remove highlight');
        return;
      }
      setCollection((prev: any) => ({
        ...prev,
        highlights: (prev?.highlights || []).filter((h: any) => h.id !== highlightId)
      }));
    } catch (err: any) {
      setRemoveHighlightError(err.message || 'Could not remove highlight');
    } finally {
      setRemoveHighlightLoading(null);
    }
  };

  const handleSelectSummaryHighlight = (id: string) => {
    setSelectedSummaryHighlights(prev => prev.includes(id)
      ? prev.filter(hid => hid !== id)
      : [...prev, id]
    );
  };

  const handleGenerateSummary = async () => {
    setGenerateError(null);
    if (!selectedSummaryHighlights.length) {
      setGenerateError('Please select at least one highlight.');
      return;
    }
    setGenerateLoading(true);
    const token = getCookie('access_token');
    if (!token) return;
    try {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timestamp = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      const res = await fetch('http://localhost:5000/api/summaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          collection_id: id,
          highlight_ids: selectedSummaryHighlights,
          timestamp
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        let msg = err?.error || err?.message;
        if (!msg && err && typeof err === 'object') {
          const fieldErr = Object.values(err).find(v => Array.isArray(v) && v.length && typeof v[0] === 'string');
          if (Array.isArray(fieldErr)) msg = fieldErr[0];
        }
        setGenerateError(msg || 'Could not generate summary');
        return;
      }
      const data = await res.json();
      setCollection((prev: any) => ({
        ...prev,
        summaries: [...(prev?.summaries || []), data.summary || data]
      }));
      setShowGenerateSummary(false);
      setSelectedSummaryHighlights([]);
    } catch (err: any) {
      setGenerateError(err.message || 'Could not generate summary');
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleRemoveSummary = async (summaryId: string) => {
    setRemoveSummaryLoading(summaryId);
    setRemoveSummaryError(null);
    const token = getCookie('access_token');
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/summaries/${summaryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        let msg = err?.error || err?.message;
        if (!msg && err && typeof err === 'object') {
          const fieldErr = Object.values(err).find(v => Array.isArray(v) && v.length && typeof v[0] === 'string');
          if (Array.isArray(fieldErr)) msg = fieldErr[0];
        }
        setRemoveSummaryError(msg || 'Could not delete summary');
        return;
      }
      setCollection((prev: any) => ({
        ...prev,
        summaries: (prev?.summaries || []).filter((s: any) => s.id !== summaryId)
      }));
    } catch (err: any) {
      setRemoveSummaryError(err.message || 'Could not delete summary');
    } finally {
      setRemoveSummaryLoading(null);
    }
  };

  const handleShowSummaryDetails = async (summaryId: string) => {
    setShowSummaryDetails(true);
    setSummaryDetails(null);
    setQuiz(null);
    setSummaryDetailsLoading(true);
    setSummaryDetailsError(null);
    setQuizError(null);
    const token = getCookie('access_token');
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/summaries/${summaryId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        let msg = err?.error || err?.message;
        if (!msg && err && typeof err === 'object') {
          const fieldErr = Object.values(err).find(v => Array.isArray(v) && v.length && typeof v[0] === 'string');
          if (Array.isArray(fieldErr)) msg = fieldErr[0];
        }
        setSummaryDetailsError(msg || 'Could not fetch summary details');
        return;
      }
      const data = await res.json();
      const summary = data.summary || data;
      setSummaryDetails(summary);
      // Check for quiz in summary object
      if (summary.quiz && Array.isArray(summary.quiz.questions)) {
        setQuiz({
          questions: summary.quiz.questions,
          title: summary.quiz.title || 'Quiz',
        });
      } else {
        // Fallback: try GET /api/quizzes?summary_id=...
        const quizRes = await fetch(`http://localhost:5000/api/quizzes?summary_id=${summary.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (quizRes.ok) {
          const quizData = await quizRes.json();
          if (Array.isArray(quizData)) {
            setQuiz({ questions: quizData, title: 'Quiz' });
          } else if (quizData && Array.isArray(quizData.quiz)) {
            setQuiz({ questions: quizData.quiz, title: quizData.title || 'Quiz' });
          } else if (quizData && quizData.questions && Array.isArray(quizData.questions)) {
            setQuiz({ questions: quizData.questions, title: quizData.title || 'Quiz' });
          } else {
            setQuiz(null);
          }
        } else {
          setQuiz(null);
        }
      }
    } catch (err: any) {
      setSummaryDetailsError(err.message || 'Could not fetch summary details');
      setQuiz(null);
    } finally {
      setSummaryDetailsLoading(false);
    }
  };

  const handleGenerateQuiz = async (summaryId: string) => {
    setQuizLoading(true);
    setQuizError(null);
    const token = getCookie('access_token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ summary_id: summaryId })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        let msg = err?.error || err?.message;
        if (!msg && err && typeof err === 'object') {
          const fieldErr = Object.values(err).find(v => Array.isArray(v) && v.length && typeof v[0] === 'string');
          if (Array.isArray(fieldErr)) msg = fieldErr[0];
        }
        setQuizError(msg || 'Could not generate quiz');
        setQuiz(null);
        return;
      }
      const data = await res.json();
      // Get quiz id from response (support both {quiz: {...}} and {...})
      const quizId = data.quiz?.id || data.id || (Array.isArray(data.quiz) && data.quiz[0]?.id) || null;
      if (quizId) {
        router.push(`/quizzes/${quizId}`);
        return;
      }
      // fallback: setQuiz for modal (should not happen)
      if (Array.isArray(data)) setQuiz(data);
      else if (data && Array.isArray(data.quiz)) setQuiz(data.quiz);
      else setQuiz(null);
      setShowQuizModal(true);
    } catch (err: any) {
      setQuizError(err.message || 'Could not generate quiz');
      setQuiz(null);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleOpenQuiz = () => {
    setShowQuizModal(true);
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
        <div className="relative w-full max-w-3xl mx-auto flex flex-col items-stretch rounded-3xl shadow-2xl p-10 md:p-16 bg-gradient-to-br from-[#181c2f]/90 to-[#23243a]/90 z-10 gap-8">
          {loading ? (
            <div className="text-white text-center text-xl">Loading collection...</div>
          ) : error ? (
            <div className="text-[#ff6b6b] text-center text-xl">{error}</div>
          ) : collection ? (
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <div className="text-3xl font-bold text-white mb-1">{collection.title}</div>
                  <div className="text-[#b0b3c7] text-base mb-2">{collection.description}</div>
                  <div className="text-xs text-[#7f5fff]">Created: {collection.timestamp ? new Date(collection.timestamp).toLocaleString() : "-"}</div>
                  <div className="text-xs text-[#b0b3c7]">Owner: <span className="font-semibold">{collection.owner?.username || collection.owner?.id || "-"}</span></div>
                  {collection.collaborators && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[#b0b3c7]">Collaborators:</span>
                      {collection.collaborators.length > 0 ? (
                        <span className="text-xs text-white font-semibold">
                          {collection.collaborators.map((c: any, i: number) => c.username || c.email || c.id).join(", ")}
                        </span>
                      ) : (
                        <span className="text-xs text-[#b0b3c7]">None</span>
                      )}
                      {isOwner && (
                        <button
                          className="ml-2 px-2 py-0.5 text-xs rounded bg-[#23243a] border border-[#7f5fff] text-[#7f5fff] hover:bg-[#7f5fff] hover:text-white transition-colors"
                          style={{ fontSize: '0.8rem', lineHeight: '1.2', padding: '2px 8px' }}
                          onClick={() => setShowEditCollaborators(true)}
                        >Edit</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg font-semibold text-white">Highlights</div>
                  <button
                    className="rounded-xl px-4 py-1 bg-gradient-to-r from-[#7f5fff] to-[#5e8bff] text-white font-semibold shadow hover:from-[#5e8bff] hover:to-[#7f5fff] transition-colors text-sm"
                    onClick={openAddHighlightModal}
                  >+ Add Highlight</button>
                </div>
                {showAddHighlight && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-[#23243a] rounded-2xl p-8 shadow-xl flex flex-col gap-4 min-w-[340px] max-w-[90vw] w-full max-w-md relative">
                      <button
                        className="absolute top-2 right-2 text-[#7f5fff] hover:text-white text-2xl font-bold"
                        onClick={() => setShowAddHighlight(false)}
                      >×</button>
                      <span className="text-white text-lg font-bold mb-2">Add Highlight</span>
                      {addError && <div className="text-[#ff6b6b] text-sm">{addError}</div>}
                      <div className="max-h-64 overflow-y-auto flex flex-col gap-2">
                        {userHighlights.length === 0 ? (
                          <div className="text-[#b0b3c7] text-center">No highlights found.</div>
                        ) : (
                          <ul className="flex flex-col gap-2">
                            {userHighlights.map((h, i) => (
                              <li key={h.id || i} className="bg-[#181c2f] rounded-xl p-3 shadow flex flex-row items-center gap-3 cursor-pointer select-none">
                                <label className="flex items-center gap-3 cursor-pointer select-none w-full">
                                  <input
                                    type="checkbox"
                                    checked={selectedHighlightIds.includes(h.id)}
                                    onChange={() => handleSelectHighlight(h.id)}
                                    className="accent-[#7f5fff] w-4 h-4"
                                  />
                                  <div className="font-semibold text-base text-white truncate w-full">
                                    {h.text?.length > 60 ? h.text.slice(0, 60) + '...' : h.text}
                                  </div>
                                </label>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="flex gap-4 justify-end mt-2">
                        <button
                          className="rounded-xl px-6 py-2 bg-gradient-to-r from-[#7f5fff] to-[#5e8bff] text-white font-semibold shadow hover:from-[#5e8bff] hover:to-[#7f5fff] transition-colors"
                          onClick={handleAddHighlight}
                          disabled={addLoading}
                        >{addLoading ? 'Adding...' : 'Add Selected'}</button>
                        <button
                          className="rounded-xl px-6 py-2 bg-[#23243a] border border-[#7f5fff] text-[#7f5fff] font-semibold shadow hover:bg-[#181c2f] transition-colors"
                          onClick={() => setShowAddHighlight(false)}
                          disabled={addLoading}
                        >Cancel</button>
                      </div>
                    </div>
                  </div>
                )}
                {collection.highlights && collection.highlights.length > 0 ? (
                  <ul className="flex flex-col gap-3">
                    {collection.highlights.map((h: any, i: number) => (
                      <li key={h.id || i} className="bg-[#23243a] rounded-xl p-4 shadow flex flex-col gap-2 relative">
                        <button
                          className="absolute top-2 right-2 z-10 text-[#ff6b6b] hover:text-white text-lg font-bold bg-transparent border-none outline-none"
                          onClick={() => handleRemoveHighlight(h.id)}
                          disabled={removeHighlightLoading === h.id}
                          aria-label="Remove Highlight from Collection"
                        >{removeHighlightLoading === h.id ? '...' : '×'}</button>
                        <div className="text-white font-semibold">{h.text || h.title || "Untitled Highlight"}</div>
                        {h.url && <div className="text-xs text-[#b0b3c7]">{h.url}</div>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-[#b0b3c7]">No highlights in this collection.</div>
                )}
                {removeHighlightError && <div className="text-[#ff6b6b] text-xs mt-2">{removeHighlightError}</div>}
              </div>
              {/* Summaries button at the bottom */}
              <div className="flex flex-row gap-4 mt-8 self-end">
                <button
                  className="rounded-xl px-6 py-2 bg-gradient-to-r from-[#7f5fff] to-[#5e8bff] text-white font-semibold shadow hover:from-[#5e8bff] hover:to-[#7f5fff] transition-colors"
                  onClick={() => setShowSummaries(true)}
                >Summaries</button>
                <button
                  className="rounded-xl px-6 py-2 bg-gradient-to-r from-[#5e8bff] to-[#7f5fff] text-white font-semibold shadow hover:from-[#7f5fff] hover:to-[#5e8bff] transition-colors"
                  onClick={() => setShowGenerateSummary(true)}
                >Generate Summary</button>
              </div>
              {showSummaries && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div className="bg-[#23243a] rounded-2xl p-8 shadow-xl flex flex-col gap-6 min-w-[340px] max-w-[90vw] w-full max-w-lg relative">
                    <button
                      className="absolute top-2 right-2 text-[#7f5fff] hover:text-white text-2xl font-bold"
                      onClick={() => setShowSummaries(false)}
                    >×</button>
                    <span className="text-white text-lg font-bold mb-2">Summaries</span>
                    {collection.summaries && collection.summaries.length > 0 ? (
                      <ul className="flex flex-col gap-3">
                        {collection.summaries.map((s: any, i: number) => (
                          <li
                            key={s.id || i}
                            className="bg-[#181c2f] rounded-xl p-4 shadow flex flex-col gap-2 relative cursor-pointer hover:bg-[#7f5fff]/20 transition-colors"
                            onClick={e => {
                              // Prevent click if X is clicked
                              if ((e.target as HTMLElement).closest('button')) return;
                              handleShowSummaryDetails(s.id);
                            }}
                          >
                            <button
                              className="absolute top-2 right-2 z-10 text-[#ff6b6b] hover:text-white text-lg font-bold bg-transparent border-none outline-none"
                              onClick={e => { e.stopPropagation(); handleRemoveSummary(s.id); }}
                              disabled={removeSummaryLoading === s.id}
                              aria-label="Delete Summary"
                            >{removeSummaryLoading === s.id ? '...' : '×'}</button>
                            <div className="text-white font-semibold">{s.title || `Summary ${i + 1}`}</div>
                            {s.text && <div className="text-[#b0b3c7] text-sm">{s.text}</div>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-[#b0b3c7] text-center">No summaries available.</div>
                    )}
                  </div>
                </div>
              )}
              {showGenerateSummary && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div className="bg-[#23243a] rounded-2xl p-8 shadow-xl flex flex-col gap-6 min-w-[340px] max-w-[90vw] w-full max-w-lg relative">
                    <button
                      className="absolute top-2 right-2 text-[#7f5fff] hover:text-white text-2xl font-bold"
                      onClick={() => setShowGenerateSummary(false)}
                    >×</button>
                    <span className="text-white text-lg font-bold mb-2">Generate Summary</span>
                    <div className="max-h-64 overflow-y-auto flex flex-col gap-2">
                      {collection.highlights && collection.highlights.length > 0 ? (
                        <ul className="flex flex-col gap-2">
                          {collection.highlights.map((h: any, i: number) => (
                            <li key={h.id || i} className="bg-[#181c2f] rounded-xl p-3 shadow flex flex-row items-center gap-3 cursor-pointer select-none">
                              <label className="flex items-center gap-3 cursor-pointer select-none w-full">
                                <input
                                  type="checkbox"
                                  checked={selectedSummaryHighlights.includes(h.id)}
                                  onChange={() => handleSelectSummaryHighlight(h.id)}
                                  className="accent-[#7f5fff] w-4 h-4"
                                />
                                <div className="font-semibold text-base text-white truncate w-full">
                                  {h.text?.length > 60 ? h.text.slice(0, 60) + '...' : h.text}
                                </div>
                              </label>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-[#b0b3c7] text-center">No highlights found in this collection.</div>
                      )}
                    </div>
                    {generateError && <div className="text-[#ff6b6b] text-sm">{generateError}</div>}
                    <div className="flex gap-4 justify-end mt-2">
                      <button
                        className="rounded-xl px-6 py-2 bg-gradient-to-r from-[#5e8bff] to-[#7f5fff] text-white font-semibold shadow hover:from-[#7f5fff] hover:to-[#5e8bff] transition-colors"
                        onClick={handleGenerateSummary}
                        disabled={generateLoading}
                      >{generateLoading ? 'Generating...' : 'Generate'}</button>
                      <button
                        className="rounded-xl px-6 py-2 bg-[#23243a] border border-[#7f5fff] text-[#7f5fff] font-semibold shadow hover:bg-[#181c2f] transition-colors"
                        onClick={() => setShowGenerateSummary(false)}
                        disabled={generateLoading}
                      >Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </main>
      {showEditCollaborators && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-[#23243a] rounded-2xl p-6 shadow-xl flex flex-col gap-4 min-w-[320px] max-w-[90vw] w-full max-w-xs relative">
            <button
              className="absolute top-2 right-2 text-[#7f5fff] hover:text-white text-2xl font-bold"
              onClick={() => setShowEditCollaborators(false)}
            >×</button>
            <span className="text-white text-base font-bold mb-2">Edit Collaborators</span>
            <input
              className="rounded-xl px-3 py-2 bg-[#181c2f] text-white border border-[#7f5fff] focus:outline-none focus:ring-2 focus:ring-[#7f5fff] text-sm"
              placeholder="Add collaborator by email"
              value={collaboratorEmail}
              onChange={e => setCollaboratorEmail(e.target.value)}
              type="email"
              autoFocus
            />
            <div className="flex gap-3 justify-end mt-2">
              <button
                className="rounded-xl px-4 py-1 bg-gradient-to-r from-[#7f5fff] to-[#5e8bff] text-white font-semibold shadow hover:from-[#5e8bff] hover:to-[#7f5fff] transition-colors text-xs"
                onClick={handleAddCollaborator}
                disabled={collabLoading}
              >{collabLoading ? 'Adding...' : 'Add'}</button>
            </div>
            {collabError && <div className="text-[#ff6b6b] text-xs">{collabError}</div>}
            <div className="mt-4">
              <span className="text-white text-sm font-semibold mb-2 block">Current Collaborators</span>
              {collection.collaborators && collection.collaborators.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {collection.collaborators.map((c: any) => (
                    <li key={c.id} className="flex items-center justify-between bg-[#181c2f] rounded-xl px-3 py-2">
                      <span className="text-white text-xs font-semibold">{c.username || c.email || c.id}</span>
                      <button
                        className="text-[#ff6b6b] hover:text-white text-base font-bold bg-transparent border-none outline-none ml-2"
                        onClick={() => handleRemoveCollaborator(c.id)}
                        disabled={removeCollabLoading === c.id}
                        aria-label="Remove Collaborator"
                      >{removeCollabLoading === c.id ? '...' : '×'}</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-[#b0b3c7] text-xs">No collaborators yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
      {showSummaryDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-[#23243a] rounded-2xl p-8 shadow-xl flex flex-col gap-6 w-[700px] h-[700px] max-w-[95vw] max-h-[95vh] relative overflow-hidden">
            <button
              className="absolute top-2 right-2 text-[#7f5fff] hover:text-white text-2xl font-bold"
              onClick={() => setShowSummaryDetails(false)}
            >×</button>
            <span className="text-white text-lg font-bold mb-2">Summary Details</span>
            <div className="flex-1 min-h-0 overflow-y-auto">
            {summaryDetailsLoading ? (
              <div className="text-white text-center">Loading...</div>
            ) : summaryDetailsError ? (
              <div className="text-[#ff6b6b] text-center">{summaryDetailsError}</div>
            ) : summaryDetails ? (
              <SummaryDetailsContent
                summaryDetails={summaryDetails}
                onShowHighlights={() => {
                  setHighlightsToShow(summaryDetails.highlights || []);
                  setShowHighlightsModal(true);
                }}
                quiz={quiz}
                quizLoading={quizLoading}
                quizError={quizError}
                onGenerateQuiz={() => handleGenerateQuiz(summaryDetails.id)}
                onOpenQuiz={handleOpenQuiz}
              />
            ) : null}
            </div>
          </div>
        </div>
      )}
      {showHighlightsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-[#23243a] rounded-2xl p-8 shadow-xl flex flex-col gap-6 min-w-[340px] max-w-[90vw] w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-[#7f5fff] hover:text-white text-2xl font-bold"
              onClick={() => setShowHighlightsModal(false)}
            >×</button>
            <span className="text-white text-lg font-bold mb-2">Summary Highlights</span>
            <div className="max-h-80 overflow-y-auto">
              {highlightsToShow && highlightsToShow.length > 0 ? (
                <ul className="flex flex-col gap-2 mt-2">
                  {highlightsToShow.map((h: any, i: number) => (
                    <li key={h.id || i} className="bg-[#181c2f] rounded-xl p-3 shadow flex flex-col gap-1">
                      <div className="text-white text-sm">{h.text || "No text"}</div>
                      {h.url && <div className="text-xs text-[#b0b3c7] break-all">{h.url}</div>}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-[#b0b3c7] text-xs mt-2">No highlights for this summary.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryDetailsContent({ summaryDetails, onShowHighlights, quiz, quizLoading, quizError, onGenerateQuiz, onOpenQuiz }: {
  summaryDetails: any,
  onShowHighlights: () => void,
  quiz: any,
  quizLoading: boolean,
  quizError: string | null,
  onGenerateQuiz: () => void,
  onOpenQuiz: () => void,
}) {
  const creator = summaryDetails.user?.username || summaryDetails.user?.email || summaryDetails.user_id || "Unknown";
  const hasQuiz = quiz && quiz.questions && Array.isArray(quiz.questions) && quiz.questions.length > 0;
  const router = useRouter();

  // State for user quiz attempt
  const [attemptStatus, setAttemptStatus] = useState<'loading'|'taken'|'not-taken'|'error'>('loading');
  const [attemptInfo, setAttemptInfo] = useState<any>(null);

  useEffect(() => {
    if (!hasQuiz || !summaryDetails.quiz?.id) {
      setAttemptStatus('not-taken');
      setAttemptInfo(null);
      return;
    }
    setAttemptStatus('loading');
    setAttemptInfo(null);
    const token = typeof window !== 'undefined' ? getCookie('access_token') : null;
    if (!token) {
      setAttemptStatus('error');
      setAttemptInfo(null);
      return;
    }
    fetch(`http://localhost:5000/api/quizzes/${summaryDetails.quiz.id}/my-attempt`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.ok) return res.json();
        if (res.status === 404) return Promise.reject({ notFound: true });
        return res.json().then(e => Promise.reject(e));
      })
      .then(data => {
        setAttemptStatus('taken');
        setAttemptInfo(data);
      })
      .catch(e => {
        if (e && e.notFound) setAttemptStatus('not-taken');
        else setAttemptStatus('error');
      });
  }, [hasQuiz, summaryDetails.quiz?.id]);

  return (
    <div className="flex flex-col h-full justify-between gap-3">
      <div className="flex flex-col gap-3 flex-1 min-h-0">
        <div className="text-white text-2xl font-bold mb-2">{summaryDetails.title || "Summary"}</div>
        <div className="flex-1 min-h-0 max-h-full overflow-y-auto text-white font-semibold text-base whitespace-pre-line">
          {summaryDetails.content || "No content available."}
        </div>
        {summaryDetails.timestamp && (
          <div className="text-xs text-[#7f5fff] mt-2">
            Created: {new Date(summaryDetails.timestamp).toLocaleString()}
          </div>
        )}
        <div className="text-xs text-[#b0b3c7] mt-1">
          Creator: <span className="font-semibold">{creator}</span>
        </div>
        {quizError && <div className="text-[#ff6b6b] text-xs mt-2">{quizError}</div>}
        {/* Quiz attempt status */}
        {hasQuiz && (
          <div className="mt-2 text-xs">
            {attemptStatus === 'loading' && <span className="text-[#b0b3c7]">Checking if you have taken this quiz...</span>}
            {attemptStatus === 'taken' && <span className="text-green-400 font-semibold">You have already taken this quiz. Score: {attemptInfo?.score} / {attemptInfo?.total} ({attemptInfo?.percentage}%)</span>}
            {attemptStatus === 'not-taken' && <span className="text-[#b0b3c7]">You have not taken this quiz yet.</span>}
            {attemptStatus === 'error' && <span className="text-[#ff6b6b]">Could not check quiz attempt status.</span>}
          </div>
        )}
      </div>
      <div className="flex flex-row gap-3 mt-4 w-full">
        <button
          className="rounded-xl px-4 py-2 bg-gradient-to-r from-[#7f5fff] to-[#5e8bff] text-white font-semibold shadow hover:from-[#5e8bff] hover:to-[#7f5fff] transition-colors text-base w-full"
          onClick={onShowHighlights}
        >
          Show Highlights
        </button>
        <button
          className="rounded-xl px-4 py-2 bg-gradient-to-r from-[#5e8bff] to-[#7f5fff] text-white font-semibold shadow hover:from-[#7f5fff] hover:to-[#5e8bff] transition-colors text-base w-full"
          onClick={hasQuiz ? () => router.push(`/quizzes/${summaryDetails.quiz?.id}`) : onGenerateQuiz}
          disabled={quizLoading}
        >
          {quizLoading ? 'Loading...' : hasQuiz ? 'Open Quiz' : 'Generate Quiz'}
        </button>
        {hasQuiz && (
          <button
            className="rounded-xl px-4 py-2 bg-gradient-to-r from-[#23243a] to-[#7f5fff] text-white font-semibold shadow hover:from-[#7f5fff] hover:to-[#23243a] transition-colors text-base w-full"
            onClick={() => router.push(`/quizzes/${summaryDetails.quiz?.id}/dashboard`)}
          >
            Quiz Dashboard
          </button>
        )}
      </div>
    </div>
  );
} 