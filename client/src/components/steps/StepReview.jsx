import { useNavigate } from "react-router-dom";
import { db } from "../firebase"; 
import { collection, addDoc } from "firebase/firestore";

export default function StepReview({ formData }) {
  const navigate = useNavigate();

  const handleSubmit = async () => {
  localStorage.setItem("lifeledgerFormData", JSON.stringify(formData));

  try {
    const docRef = await addDoc(collection(db, "users"), formData);
    console.log("✅ Data saved with ID:", docRef.id);
  } catch (e) {
    console.error("❌ Error saving to Firestore:", e);
  }

  navigate("/dashboard");
};


  const formattedEntries = Object.entries(formData).map(([key, value]) => (
    <div key={key} className="flex justify-between border-b py-2">
      <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
      <span className="font-medium">{value || "N/A"}</span>
    </div>
  ));

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">✅ Review Your Details</h2>
      <div className="space-y-2">{formattedEntries}</div>

      <button
        onClick={handleSubmit}
        className="mt-6 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Submit
      </button>
    </div>
  );
}
