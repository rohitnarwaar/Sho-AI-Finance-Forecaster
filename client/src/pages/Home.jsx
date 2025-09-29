import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-gradient-to-b from-white to-gray-50">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">💼 Welcome to <span className="text-blue-600">LifeLedger</span></h1>
      
      <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl">
        Your AI-powered personal finance auditor. Track income, expenses, loans, and future savings forecasts — all in one place.
      </p>
      
      <div className="flex flex-wrap justify-center gap-4">
        <Link 
          to="/input" 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          ➕ Start Input
        </Link>

        <Link 
          to="/upload" 
          className="bg-gray-100 px-6 py-3 rounded-lg hover:bg-gray-200 transition"
        >
          📄 Upload Statement
        </Link>

        <Link 
          to="/dashboard" 
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
        >
          📊 View Dashboard
        </Link>
      </div>
    </div>
  );
}
