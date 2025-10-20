import { useEffect, useState } from "react";
import analyzeFinance from "../utils/analyzeFinance";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import { db } from "../firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

export default function Dashboard() {
  const [formData, setFormData] = useState({});
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [forecastData, setForecastData] = useState([]);
  const [loanData, setLoanData] = useState([]);
  const [retirementData, setRetirementData] = useState([]);
  const [simulateData, setSimulateData] = useState({ base: [], bump: [] });
  const [deltaSavings, setDeltaSavings] = useState(5000);

  useEffect(() => {
    const fetchLatestUserData = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setError("No user data found.");
          setLoading(false);
          return;
        }

        const userData = snapshot.docs[0].data();
        setFormData(userData);

        // --- Analyze with Gemini ---
        analyzeFinance(userData)
          .then((result) => setInsights(result))
          .catch(() => setError("Failed to analyze finance data."));

        const income = parseFloat(userData.income || 0);
        const expenses =
          parseFloat(userData.food || 0) +
          parseFloat(userData.rent || 0) +
          parseFloat(userData.transport || 0) +
          parseFloat(userData.utilities || 0) +
          parseFloat(userData.misc || 0);

        const savings = income - expenses;

        // --- Savings forecast ---
        if (savings > 0) {
          fetch(`${import.meta.env.VITE_API_BASE}/forecast`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ monthlySaving: savings, months: 120 }),
          })
            .then((res) => res.json())
            .then((data) => {
              const series = data.series || data;
              setForecastData(
                series.map((d) => ({
                  date: d.ds?.slice(0, 10),
                  netWorth: parseFloat(d.yhat || 0),
                }))
              );
            })
            .catch(() => setError("Failed to fetch forecast data."));
        }

        // --- Loan payoff ---
        const loanAmount = parseFloat(userData.loanAmount || 0);
        const emi = parseFloat(userData.emi || userData.monthlyEMI || 0);
        const rate = parseFloat(userData.interestRate || 0.1);
        if (loanAmount > 0 && emi > 0) {
          fetch(`${import.meta.env.VITE_API_BASE}/loan-payoff`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              principal: loanAmount,
              monthlyEmi: emi,
              annualInterestRate: rate,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              const timeline = data.timeline || data;
              setLoanData(
                timeline.map((d) => ({
                  date: d.month,
                  remaining: parseFloat(d.remaining || 0),
                }))
              );
            })
            .catch(() => setError("Failed to fetch loan payoff data."));
        }

        // --- Retirement corpus ---
        const currentSavings = parseFloat(userData.currentSavings || savings * 12);
        const monthlyContribution = parseFloat(userData.monthlyContribution || savings);
        fetch(`${import.meta.env.VITE_API_BASE}/retirement`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentSavings,
            monthlyContribution,
            annualReturnRate: 0.08,
            months: 360,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            const corpus = data.corpus || data;
            setRetirementData(
              corpus.map((d) => ({
                date: d.month,
                corpus: parseFloat(d.projected_corpus || 0),
              }))
            );
          })
          .catch(() => setError("Failed to fetch retirement forecast."));

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Error loading dashboard data.");
        setLoading(false);
      }
    };

    fetchLatestUserData();
  }, []);

  // --- What-if Simulation ---
  const runSimulation = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseMonthlySaving: parseFloat(formData.income || 0) - parseFloat(formData.expenses || 0),
          deltaMonthlySaving: parseFloat(deltaSavings),
          months: 120,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Simulation failed");

      const base = (data.base || []).map((d) => ({
        date: d.ds?.slice(0, 10),
        value: parseFloat(d.yhat),
      }));
      const bump = (data.bump || []).map((d) => ({
        date: d.ds?.slice(0, 10),
        value: parseFloat(d.yhat),
      }));
      setSimulateData({ base, bump });
    } catch (e) {
      console.error(e);
      setError("Simulation failed.");
    }
  };

  if (loading) return <p className="text-center text-gray-400 mt-10">Loading data...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-3xl font-bold text-center mb-6 text-white">
        💼 Financial Dashboard
      </h1>

      {/* Insights */}
      {insights && (
        <div className="bg-gray-800 text-gray-100 p-5 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-2">AI Insights</h2>
          <p className="whitespace-pre-line">{insights.summary}</p>
        </div>
      )}

      {/* Savings Forecast */}
      <section>
        <h2 className="text-xl font-semibold mb-2 text-gray-100">Savings Forecast (Next 10 Years)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="netWorth" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Loan Payoff */}
      <section>
        <h2 className="text-xl font-semibold mb-2 text-gray-100">Loan Payoff Timeline</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={loanData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="remaining" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Retirement Corpus */}
      <section>
        <h2 className="text-xl font-semibold mb-2 text-gray-100">Projected Retirement Corpus</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={retirementData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="corpus" stroke="#ffc658" />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* What-if Simulation */}
      <section className="bg-gray-800 p-5 rounded-2xl text-gray-100">
        <h2 className="text-xl font-semibold mb-2">💭 What-if Simulation</h2>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1000"
            max="20000"
            step="500"
            value={deltaSavings}
            onChange={(e) => setDeltaSavings(e.target.value)}
            className="w-full"
          />
          <span className="w-32 text-right">
            +₹{deltaSavings.toLocaleString("en-IN")} /month
          </span>
          <button
            onClick={runSimulation}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Simulate
          </button>
        </div>

        {simulateData.base.length > 0 && (
          <ResponsiveContainer width="100%" height={300} className="mt-4">
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                data={simulateData.base}
                dataKey="value"
                stroke="#8884d8"
                name="Current Plan"
              />
              <Line
                type="monotone"
                data={simulateData.bump}
                dataKey="value"
                stroke="#82ca9d"
                name={`+₹${deltaSavings.toLocaleString("en-IN")}`}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
}
