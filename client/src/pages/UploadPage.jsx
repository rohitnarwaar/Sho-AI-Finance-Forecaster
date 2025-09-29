import { useState } from "react";
import Tesseract from "tesseract.js";
import parseOCRToCategories from "../utils/parseOCR";
import { useNavigate } from "react-router-dom";
// Optional: Firestore if you want to save uploads
// import { db } from "../firebase";
// import { collection, addDoc } from "firebase/firestore";

export default function UploadPage() {
  const [ocrText, setOcrText] = useState("");
  const [editableCategories, setEditableCategories] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError("");

    Tesseract.recognize(file, "eng", { logger: (m) => console.log(m) })
      .then(({ data: { text } }) => {
        setOcrText(text);
        const rawCategories = parseOCRToCategories(text);

        // Convert all amounts to editable strings
        const editable = {};
        for (let key in rawCategories) {
          editable[key] = rawCategories[key].toString();
        }
        setEditableCategories(editable);
      })
      .catch((err) => {
        console.error("❌ OCR Error:", err);
        setError("Failed to process file. Please upload a clearer scan or smaller file.");
      })
      .finally(() => setLoading(false));
  };

  const handleEdit = (category, value) => {
    setEditableCategories((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleUseInAnalysis = async () => {
    // Map category names to formData keys
    const categoryKeyMap = {
      Food: "food",
      Transport: "transport",
      Shopping: "shopping",
      Subscriptions: "subscriptions",
      Housing: "rent",
      Loans: "emi",
      Groceries: "groceries",
      Utilities: "utilities",
    };

    const mergedData = {};
    for (let category in editableCategories) {
      const key = categoryKeyMap[category];
      if (key) {
        mergedData[key] = parseFloat(editableCategories[category] || 0);
      }
    }

    // Merge with existing form data in localStorage
    const existingData = JSON.parse(localStorage.getItem("lifeledgerFormData") || "{}");
    const updated = { ...existingData, ...mergedData };

    localStorage.setItem("lifeledgerFormData", JSON.stringify(updated));

    // Optional: Save OCR results to Firestore
    // try {
    //   await addDoc(collection(db, "ocrUploads"), {
    //     categories: mergedData,
    //     createdAt: new Date(),
    //   });
    //   console.log("✅ OCR upload saved to Firestore");
    // } catch (e) {
    //   console.error("❌ Error saving OCR upload:", e);
    // }

    navigate("/dashboard");
  };

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">📁 Upload Bank Statements</h1>
      <p className="text-lg text-gray-700 mb-6">
        Upload a PDF or image of your bank statement for automatic categorization.
      </p>

      <input
        type="file"
        accept="application/pdf,image/*"
        onChange={handleFile}
        className="mb-4"
      />

      {loading && <p className="text-blue-600">🕐 Reading your file...</p>}
      {error && <p className="text-red-600 mt-2">{error}</p>}

      {ocrText && (
        <div className="mt-6 bg-gray-100 p-4 rounded shadow-sm">
          <h2 className="text-lg font-bold mb-2">🧾 Extracted Text:</h2>
          <pre className="whitespace-pre-wrap text-sm">{ocrText}</pre>
        </div>
      )}

      {Object.keys(editableCategories).length > 0 && (
        <div className="mt-6 bg-white p-4 border rounded shadow">
          <h2 className="text-lg font-semibold mb-2">🧠 Detected & Editable Expense Categories</h2>
          <p className="text-gray-500 text-sm mb-2">
            Review and adjust the detected categories before saving them for analysis.
          </p>

          <table className="w-full text-sm border mt-2">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-left">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(editableCategories).map(([cat, amt]) => (
                <tr key={cat} className="border-t">
                  <td className="p-2">{cat}</td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={amt}
                      onChange={(e) => handleEdit(cat, e.target.value)}
                      className="w-full border rounded p-1"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={handleUseInAnalysis}
            disabled={loading}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "➕ Use This Data in Dashboard Analysis"}
          </button>
        </div>
      )}
    </div>
  );
}
