export const fetchQuiz = async () => {
  const res = await fetch('http://localhost:5000/generate-quiz');
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};
