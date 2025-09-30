import { useEffect, useState } from "react";
import analyzeFinance from "../utils/analyzeFinance";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { db } from "../firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

export default function Dashboard() {
  const [formData, setFormData] = useState({});
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forecastData, setForecastData] = useState([]);
  const [loanData, setLoanData] = useState([]);
  const [error, setError] = useState("");
  const [retirementData, setRetirementData] = useState([]);
  const [corpus, setCorpus] = useState({});


  useEffect(() => {
    const fetchLatestUserData = async () => {
      try {
        // 🔎 Get most recent user entry
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(1));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          setFormData(userData);

          // 🔮 Analyze with Gemini
          analyzeFinance(userData)
            .then((result) => setInsights(result))
            .catch(() => setError("Failed to analyze finance data."))
            .finally(() => setLoading(false));

          // 💰 Savings forecast
          const income = parseFloat(userData.income || 0);
          const expenses =
            parseFloat(userData.food || 0) +
            parseFloat(userData.rent || 0) +
            parseFloat(userData.transport || 0) +
            parseFloat(userData.utilities || 0) +
            parseFloat(userData.misc || 0);

          const savings = income - expenses;
          if (savings > 0) {
            fetch(`${import.meta.env.VITE_API_BASE}/forecast`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ monthlySaving: savings }),
            })
              .then((res) => res.json())
              .then((data) => {
                const cleaned = data.map((d) => ({
                  date: d.ds.slice(0, 10),
                  netWorth: parseFloat(d.yhat),
                }));
                setForecastData(cleaned);
              })
              .catch(() => setError("Failed to fetch forecast data."));
          }

          // 🏦 Loan payoff
          const loanAmount = parseFloat(userData.loanAmount || 0);
          const emi = parseFloat(userData.emi || userData.monthlyEMI || 0);
          if (loanAmount > 0 && emi > 0) {
            fetch(`${import.meta.env.VITE_API_BASE}/loan-payoff`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                loanAmount: loanAmount,
                monthlyEMI: emi,
                interestRate: 10,
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                const cleaned = data.map((d) => ({
                  month: d.month,
                  remaining: d.remaining,
                }));
                setLoanData(cleaned);
              })
              .catch(() => setError("Failed to fetch loan payoff data."));
          }
        } else {
          setError("⚠️ No user data found. Please fill in the form first.");
          setLoading(false);
        }
      } catch (err) {
        console.error("Firestore error:", err);
        setError("Failed to fetch data from Firestore.");
        setLoading(false);
      }
    };

    fetchLatestUserData();

    // 🏖️ Retirement Corpus Forecast
    if (parsed.income && parsed.age && parsed.retirementAge) {
      fetch(`${import.meta.env.VITE_API_BASE}/retirement-forecast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlySaving: savings > 0 ? savings : 0,
          currentAge: parseInt(parsed.age),
          retirementAge: parseInt(parsed.retirementAge),
          expectedReturn: 0.08,
          inflation: 0.05,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setRetirementData(data.forecast || []);
          setCorpus({
            nominal: data.corpus,
            adjusted: data.inflationAdjustedCorpus,
          });
        })
        .catch(() => setError("Failed to fetch retirement forecast."));
    }

  }, []);

  if (loading) return <p className="text-center text-gray-500 mt-10">⏳ Loading insights...</p>;
  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;
  if (!formData || Object.keys(formData).length === 0)
    return <p className="text-center text-gray-500 mt-10">⚠️ No data found. Please complete the form or upload a statement.</p>;

  // 📊 Summary cards
  const summaryData = [
    { label: "Monthly Income", value: formData.income, color: "bg-green-100 text-green-700" },
    { label: "Monthly Expenses", value: formData.food, color: "bg-red-100 text-red-700" },
    { label: "Bank Savings", value: formData.savings, color: "bg-blue-100 text-blue-700" },
    { label: "Stock Investments", value: formData.stocks, color: "bg-purple-100 text-purple-700" },
    { label: "Loans", value: formData.loanAmount, color: "bg-yellow-100 text-yellow-700" },
    { label: "Real Estate", value: formData.realEstate, color: "bg-orange-100 text-orange-700" },
    { label: "Risk Tolerance", value: formData.risk, color: "bg-gray-100 text-gray-700" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">📊 Your Financial Snapshot</h1>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {summaryData.map(({ label, value, color }) => (
          <div key={label} className={`rounded-lg shadow p-4 ${color}`}>
            <h3 className="font-semibold text-sm">{label}</h3>
            <p className="text-lg font-bold">
              {value
                ? typeof value === "number"
                  ? `₹${parseFloat(value).toLocaleString()}`
                  : value
                : "N/A"}
            </p>
          </div>
        ))}
      </div>

      {/* AI + Local Insights */}
      {insights && (
        <div className="bg-white p-6 rounded-lg shadow-md border space-y-4">
          <h2 className="text-2xl font-semibold mb-2">🧠 AI Financial Insights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-100 p-4 rounded">
              <p><strong>Savings Rate:</strong> {insights.savingsRate}</p>
              <p><strong>Debt-to-Asset Ratio:</strong> {insights.debtToAssetRatio}%</p>
              <p><strong>Summary:</strong> {insights.summary}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded">
              <p><strong>Net Worth:</strong> ₹{insights.netWorth?.toLocaleString() || "N/A"}</p>
              <p><strong>Health Score:</strong> {insights.healthScore || "N/A"}/100</p>
            </div>
          </div>
          {insights.aiSummary && (
            <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded mt-4">
              <h3 className="font-semibold text-lg mb-1">💬 AI Summary</h3>
              <p className="text-gray-800 whitespace-pre-line">{insights.aiSummary}</p>
            </div>
          )}
          {insights.suggestedChanges && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mt-4">
              <h3 className="font-semibold text-lg mb-1">🔧 Suggested Changes</h3>
              <ul className="list-disc ml-6 text-gray-800">
                {insights.suggestedChanges.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="mt-12 space-y-12">
        {/* Forecast */}
        {forecastData.length > 0 ? (
          <div className="bg-white p-4 rounded shadow-md">
            <h3 className="text-lg font-semibold mb-2">📈 Net Worth Forecast</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="netWorth" stroke="#4f46e5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-500 text-center">⚠️ No forecast data available</p>
        )}

        {/* Loan Payoff */}
        {loanData.length > 0 ? (
          <div className="bg-white p-4 rounded shadow-md">
            <h3 className="text-lg font-semibold mb-2">💳 Loan Payoff Timeline</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={loanData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="remaining" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-500 text-center">⚠️ No loan payoff data available</p>
        )}

        {/* Expenses */}
        <div className="bg-white p-4 rounded shadow-md">
          <h3 className="text-lg font-semibold mb-2">🧾 Monthly Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={[
                { category: "Rent", amount: parseFloat(formData.rent || 0) },
                { category: "Food", amount: parseFloat(formData.food || 0) },
                { category: "Transport", amount: parseFloat(formData.transport || 0) },
                { category: "Misc", amount: parseFloat(formData.misc || 0) },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
          {/* Retirement Corpus Forecast */}
          {retirementData.length > 0 && (
            <div className="bg-white p-4 rounded shadow-md">
              <h3 className="text-lg font-semibold mb-2">🏖️ Retirement Corpus Forecast</h3>
              <p className="mb-2 text-gray-700">
                Estimated Corpus: <strong>₹{corpus.nominal?.toLocaleString()}</strong><br />
                Inflation Adjusted Corpus: <strong>₹{corpus.adjusted?.toLocaleString()}</strong>
              </p>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={retirementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ds" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="yhat" stroke="#16a34a" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
