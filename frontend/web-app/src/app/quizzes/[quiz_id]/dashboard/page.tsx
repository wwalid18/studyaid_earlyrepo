"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

function getCookie(name: string) {
  if (typeof document === 'undefined') return null;
  return document.cookie.split('; ').find(row => row.startsWith(name + '='))?.split('=')[1];
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

export default function QuizDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const { quiz_id } = params;
  const [attempts, setAttempts] = useState<any[]>([]);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'score'|'percentage'|'date'>('score');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');

  useEffect(() => {
    const fetchAttempts = async () => {
      setLoading(true);
      setError(null);
      const token = getCookie('access_token');
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }
      try {
        // Fetch quiz for access control
        const quizRes = await fetch(`http://localhost:5000/api/quizzes/${quiz_id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!quizRes.ok) throw new Error('Quiz not found');
        const quizData = await quizRes.json();
        setQuiz(quizData.quiz || quizData);
        // Fetch attempts
        const res = await fetch(`http://localhost:5000/api/quizzes/${quiz_id}/attempts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Could not fetch attempts');
        const data = await res.json();
        setAttempts(Array.isArray(data.attempts) ? data.attempts : data);
      } catch (err: any) {
        setError(err.message || 'Could not fetch attempts');
      } finally {
        setLoading(false);
      }
    };
    if (quiz_id) fetchAttempts();
  }, [quiz_id]);

  const sortedAttempts = [...attempts].sort((a, b) => {
    if (sortBy === 'score') return sortDir === 'asc' ? a.score - b.score : b.score - a.score;
    if (sortBy === 'percentage') return sortDir === 'asc' ? a.percentage - b.percentage : b.percentage - a.percentage;
    if (sortBy === 'date') return sortDir === 'asc' ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime() : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    return 0;
  });

  if (loading) return <div className="text-white text-center mt-10">Loading dashboard...</div>;
  if (error) return <div className="text-[#ff6b6b] text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#181c2f] to-[#23243a] p-4">
      <div className="bg-[#23243a] rounded-2xl p-8 shadow-xl w-full max-w-3xl flex flex-col gap-6">
        <h1 className="text-white text-2xl font-bold mb-2">Quiz Dashboard</h1>
        <div className="flex flex-row gap-4 mb-4">
          <button className={`rounded px-3 py-1 text-sm font-semibold ${sortBy==='score' ? 'bg-[#7f5fff] text-white' : 'bg-[#181c2f] text-[#b0b3c7]'}`} onClick={()=>{setSortBy('score');setSortDir(sortDir==='asc'?'desc':'asc')}}>Sort by Score</button>
          <button className={`rounded px-3 py-1 text-sm font-semibold ${sortBy==='percentage' ? 'bg-[#7f5fff] text-white' : 'bg-[#181c2f] text-[#b0b3c7]'}`} onClick={()=>{setSortBy('percentage');setSortDir(sortDir==='asc'?'desc':'asc')}}>Sort by %</button>
          <button className={`rounded px-3 py-1 text-sm font-semibold ${sortBy==='date' ? 'bg-[#7f5fff] text-white' : 'bg-[#181c2f] text-[#b0b3c7]'}`} onClick={()=>{setSortBy('date');setSortDir(sortDir==='asc'?'desc':'asc')}}>Sort by Date</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-white border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-[#181c2f]">
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">Score</th>
                <th className="px-4 py-2 text-left">%</th>
                <th className="px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {sortedAttempts.length === 0 ? (
                <tr><td colSpan={4} className="text-[#b0b3c7] text-center py-4">No attempts yet.</td></tr>
              ) : (
                sortedAttempts.map((a, i) => (
                  <tr key={a.id || i} className="bg-[#23243a] rounded-xl shadow">
                    <td className="px-4 py-2 font-semibold">{a.user?.username || a.user?.email || a.user?.id || 'Unknown'}</td>
                    <td className="px-4 py-2">{a.score} / {a.total_questions}</td>
                    <td className="px-4 py-2">{a.percentage}%</td>
                    <td className="px-4 py-2">{a.completed_at ? new Date(a.completed_at).toLocaleString() : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Leaderboard */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-white mb-2">Leaderboard</h2>
          <ol className="list-decimal ml-6 flex flex-col gap-2">
            {sortedAttempts.slice(0, 10).map((a, i) => (
              <li key={a.id || i} className="bg-[#181c2f] rounded-xl px-4 py-2 flex flex-row justify-between items-center">
                <span className="font-semibold">{a.user?.username || a.user?.email || a.user?.id || 'Unknown'}</span>
                <span className="">{a.score} / {a.total_questions} ({a.percentage}%)</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
} 