export default function StepLiabilities({ formData, updateForm }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">💳 Liabilities</h2>
      {[
        { label: "Loan Amount (Total)", key: "loanAmount" },
        { label: "Monthly EMI", key: "emi" },
        { label: "Credit Card Debt", key: "creditCardDebt" },
      ].map(({ label, key }) => (
        <div key={key} className="mb-4">
          <label className="block mb-1">{label} (₹)</label>
          <input
            type="number"
            value={formData[key] || ""}
            onChange={(e) => updateForm({ [key]: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
      ))}
    </div>
  );
}
