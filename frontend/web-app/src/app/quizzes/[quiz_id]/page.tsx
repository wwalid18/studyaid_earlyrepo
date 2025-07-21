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

export default function QuizTakingPage() {
  const router = useRouter();
  const params = useParams();
  const { quiz_id } = params;
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [qIdx: number]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [review, setReview] = useState<any>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [attemptChecked, setAttemptChecked] = useState(false);
  const [attemptLoading, setAttemptLoading] = useState(true);

  // Check if user already took the quiz
  useEffect(() => {
    const checkAttempt = async () => {
      setAttemptLoading(true);
      setReview(null); // Reset review before checking
      const token = getCookie('access_token');
      if (!token) {
        setAttemptLoading(false);
        return;
      }
      try {
        const res = await fetch(`http://localhost:5000/api/quizzes/${quiz_id}/my-attempt`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Only fetch review if there is a valid attempt id
          if (data && data.id) {
            const reviewRes = await fetch(`http://localhost:5000/api/quizzes/${quiz_id}/attempts/${data.id}/review`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (reviewRes.ok) {
              const reviewData = await reviewRes.json();
              setReview(reviewData);
            } else {
              setReview(null);
            }
          } else {
            setReview(null);
          }
        } else {
          // 404 means no attempt, so show quiz form
          setReview(null);
        }
      } catch {
        setReview(null);
      }
      setAttemptChecked(true);
      setAttemptLoading(false);
    };
    if (quiz_id) checkAttempt();
  }, [quiz_id]);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      setError(null);
      const token = getCookie('access_token');
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`http://localhost:5000/api/quizzes/${quiz_id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Quiz not found');
        const data = await res.json();
        setQuiz(data.quiz || data);
      } catch (err: any) {
        setError(err.message || 'Could not fetch quiz');
      } finally {
        setLoading(false);
      }
    };
    if (quiz_id) fetchQuiz();
  }, [quiz_id]);

  const handleSelect = (qIdx: number, option: string) => {
    setAnswers(prev => ({ ...prev, [qIdx]: option }));
  };

  const handleSubmit = async () => {
    if (!quiz || !quiz.questions) return;
    setSubmitting(true);
    setReviewError(null);
    const token = getCookie('access_token');
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/quizzes/${quiz_id}/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers: quiz.questions.map((_: any, i: number) => answers[i] || null) })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || err?.message || 'Could not submit answers');
      }
      const data = await res.json();
      // Add a delay before fetching the review to avoid race condition
      await new Promise(resolve => setTimeout(resolve, 400));
      // Use attempt_id or id from backend response
      const attemptId = data.attempt_id || data.id;
      if (!attemptId) throw new Error('No attempt id returned from backend');
      // Fetch review using the required endpoint
      setReviewLoading(true);
      const reviewRes = await fetch(`http://localhost:5000/api/quizzes/${quiz_id}/attempts/${attemptId}/review`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!reviewRes.ok) throw new Error('Could not fetch review');
      const reviewData = await reviewRes.json();
      setReview(reviewData);
      // Refresh the page after a short delay to ensure review is rendered
      setTimeout(() => { router.refresh(); }, 500);
    } catch (err: any) {
      setReviewError(err.message || 'Could not submit/review quiz');
    } finally {
      setSubmitting(false);
      setReviewLoading(false);
    }
  };

  if (loading || attemptLoading) return <div className="text-white text-center mt-10">Loading quiz...</div>;
  if (error) return <div className="text-[#ff6b6b] text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#181c2f] to-[#23243a] p-4">
      <div className="bg-[#23243a] rounded-2xl p-8 shadow-xl w-full max-w-2xl flex flex-col gap-6">
        <h1 className="text-white text-2xl font-bold mb-2">{quiz.title || 'Quiz'}</h1>
        {review ? (
          <QuizReview review={review} quiz={quiz} />
        ) : (
          <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="flex flex-col gap-6 text-white">
            {quiz.questions.map((q: any, i: number) => (
              <div key={i} className="bg-[#181c2f] rounded-xl p-4 shadow flex flex-col gap-4 text-white">
                <div className="font-semibold text-lg text-white">Q{i + 1}: {q.question}</div>
                <div className="flex flex-col gap-2 mt-2 text-white">
                  {Object.entries(q.options).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer select-none text-white">
                      <input
                        type="radio"
                        name={`quiz-q${i}`}
                        value={key}
                        checked={answers[i] === key}
                        onChange={() => handleSelect(i, key)}
                        className="accent-[#7f5fff] w-4 h-4"
                        disabled={submitting}
                      />
                      <span className="text-base text-white">{key}: {value}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            {reviewError && <div className="text-[#ff6b6b] text-center">{reviewError}</div>}
            {/* Only show submit if user hasn't taken the quiz */}
            <button
              type="submit"
              className="rounded-xl px-6 py-2 bg-gradient-to-r from-[#7f5fff] to-[#5e8bff] text-white font-semibold shadow hover:from-[#5e8bff] hover:to-[#7f5fff] transition-colors mt-4"
              disabled={submitting || Object.keys(answers).length !== quiz.questions.length}
            >{submitting ? 'Submitting...' : 'Submit Quiz'}</button>
          </form>
        )}
      </div>
    </div>
  );
}

function QuizReview({ review, quiz }: { review: any, quiz?: any }) {
  // Support new review format
  const questions = Array.isArray(review.questions) ? review.questions : [];
  const userAnswers = review.user_answers || [];
  const userAnswersText = review.user_answers_text || [];
  const correctAnswers = review.correct_answers || [];
  const correctAnswersText = review.correct_answers_text || [];
  const incorrectIndices = Array.isArray(review.incorrect_indices) ? review.incorrect_indices : [];
  const wrongQuestions = Array.isArray(review.wrong_questions) ? review.wrong_questions : [];
  const score = review.score ?? (userAnswers.length - incorrectIndices.length);
  const total = review.total_questions ?? questions.length;
  const percent = review.percentage ?? (typeof score === 'number' && total ? Math.round((score / total) * 100) : '-');
  return (
    <div className="flex flex-col gap-6 text-white">
      <div className="text-xl text-white font-bold mb-2">Quiz Review</div>
      <div className="text-white text-base mb-2">Score: <span className="font-bold text-white">{score ?? '-'}</span> / {total} ({percent}%)</div>
      {wrongQuestions.length > 0 && (
        <div className="bg-[#2a1a1a] rounded-xl p-4 mb-2 text-white">
          <div className="text-red-400 font-semibold mb-1">Questions you got wrong:</div>
          <ul className="list-disc ml-6 text-red-300 text-white">
            {wrongQuestions.map((q, i) => <li key={i} className="text-white">{q}</li>)}
          </ul>
        </div>
      )}
      <ul className="flex flex-col gap-6">
        {questions.length > 0 ? questions.map((q: string, i: number) => {
          const userAns = userAnswers[i];
          const userAnsText = userAnswersText[i];
          const correctAns = correctAnswers[i];
          const correctAnsText = correctAnswersText[i];
          const isWrong = incorrectIndices.includes(i);
          return (
            <li key={i} className="bg-[#181c2f] rounded-xl p-4 shadow flex flex-col gap-2">
              <div className={`font-semibold text-lg flex items-center gap-2 ${isWrong ? 'text-red-400' : 'text-white'}`}>{isWrong && <span title="Incorrect">⚠️</span>}Q{i + 1}: {q}</div>
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${isWrong ? 'text-red-400' : 'text-green-400'}`}>{userAns ? `Your answer: ${userAns} (${userAnsText ?? ''})` : 'No answer'}</span>
                  {isWrong ? <span className="ml-2">❌</span> : <span className="ml-2">✅</span>}
                </div>
                {isWrong && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-green-400">Correct answer: {correctAns} ({correctAnsText ?? ''})</span>
                    <span>✅</span>
                  </div>
                )}
              </div>
            </li>
          );
        }) : <li className="text-[#b0b3c7] text-white">No questions found in this review.</li>}
      </ul>
    </div>
  );
} 