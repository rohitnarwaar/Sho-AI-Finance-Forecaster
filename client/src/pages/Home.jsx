import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="p-10 text-center">
      <h1 className="text-4xl font-bold mb-4">💼 Welcome to LifeLedger</h1>
      <p className="text-lg text-gray-600 mb-6">Your AI-powered personal finance auditor.</p>
      <div className="flex justify-center gap-6">
        <Link to="/input" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Start</Link>
        <Link to="/upload" className="bg-gray-100 px-6 py-2 rounded-lg hover:bg-gray-200">Upload Statement</Link>
      </div>
    </div>
  );
}
