import { useState } from "react";

function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState("");

  const generateQuiz = async () => {
    setLoading(true);
    setError("");
    setStarted(false);
    setFinished(false);
    setScore(0);
    setCurrent(0);
    setSelected(null);
    setAnswered(false);

    try {
      const response = await fetch("http://localhost:5000/quiz", {
        method: "POST",
      });
      const data = await response.json();
      if (response.ok) {
        setQuestions(data.questions);
        setStarted(true);
      } else {
        setError(data.error || "Failed to generate quiz.");
      }
    } catch {
      setError("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (option) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);
    if (option === questions[current].answer) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-6 bg-gray-50">
        <div className="text-4xl mb-4 animate-bounce">🧠</div>
        <p className="text-gray-500 text-sm">Generating quiz from your PDF...</p>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-6 bg-gray-50">
        <div className="text-center max-w-xs">
          <div className="text-5xl mb-4">🧠</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">PDF Quiz</h2>
          <p className="text-gray-500 text-sm mb-6">
            Test your knowledge with questions generated from your PDF.
          </p>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            onClick={generateQuiz}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Generate Quiz
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    const percent = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-6 bg-gray-50">
        <div className="text-center max-w-xs">
          <div className="text-5xl mb-4">
            {percent === 100 ? "🏆" : percent >= 60 ? "🎉" : "📚"}
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Quiz Complete!</h2>
          <p className="text-4xl font-bold text-blue-600 mb-1">
            {score}/{questions.length}
          </p>
          <p className="text-gray-400 text-sm mb-6">
            {percent === 100
              ? "Perfect score! Excellent!"
              : percent >= 60
              ? "Good job! Keep it up!"
              : "Keep reading and try again!"}
          </p>
          <button
            onClick={generateQuiz}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="flex flex-col flex-1 overflow-y-auto p-4 bg-gray-50">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">
          Question {current + 1} of {questions.length}
        </span>
        <span className="text-xs font-medium text-blue-600">Score: {score}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-5">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question card */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
          {q.type === "truefalse" ? "True / False" : "Multiple Choice"}
        </span>
        <p className="text-gray-800 font-medium mt-2 text-sm leading-relaxed">
          {q.question}
        </p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {q.options.map((option, i) => {
          let style =
            "border border-gray-200 bg-white text-gray-700 hover:border-blue-400 cursor-pointer";
          if (answered) {
            if (option === q.answer) {
              style = "border-2 border-green-500 bg-green-50 text-green-800 cursor-default";
            } else if (option === selected) {
              style = "border-2 border-red-400 bg-red-50 text-red-700 cursor-default";
            } else {
              style = "border border-gray-200 bg-white text-gray-400 cursor-default";
            }
          }
          return (
            <button
              key={i}
              onClick={() => handleSelect(option)}
              disabled={answered}
              className={`text-left px-4 py-3 rounded-lg text-sm transition ${style}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* Feedback + Next */}
      {answered && (
        <div className="mt-4">
          <p
            className={`text-sm font-medium mb-3 ${
              selected === q.answer ? "text-green-600" : "text-red-600"
            }`}
          >
            {selected === q.answer
              ? "✓ Correct!"
              : `✗ Wrong! Correct answer: ${q.answer}`}
          </p>
          <button
            onClick={handleNext}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
          >
            {current + 1 >= questions.length ? "See Results" : "Next Question →"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Quiz;
