export default function StepAssets({ formData, updateForm }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">🏦 Assets & Investments</h2>
      {[
        { label: "Bank Savings", key: "savings" },
        { label: "Fixed Deposits", key: "fd" },
        { label: "Stock Market Investments", key: "stocks" },
        { label: "Crypto", key: "crypto" },
        { label: "Real Estate Value", key: "realEstate" },
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
