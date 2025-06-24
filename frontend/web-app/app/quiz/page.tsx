import { useQuery } from '@tanstack/react-query';
import { fetchQuiz } from '@/lib/api';

export default function QuizPage() {
  const { data, isLoading } = useQuery(['quiz'], fetchQuiz);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="p-4 space-y-4">
      {data.map((q, idx) => (
        <div key={idx} className="border p-4 rounded shadow">
          <h3>{q.question}</h3>
          {Object.entries(q.options).map(([key, val]) => (
            <p key={key}>{key}: {val}</p>
          ))}
        </div>
      ))}
    </div>
  );
}
