export default function StepIncome({ formData, updateForm }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">💰 Income Details</h2>
      <label className="block mb-2 text-sm font-medium">Monthly Income (₹)</label>
      <input
        type="number"
        value={formData.income || ""}
        onChange={(e) => updateForm({ income: e.target.value })}
        className="w-full p-2 border rounded"
      />
    </div>
  );
}
