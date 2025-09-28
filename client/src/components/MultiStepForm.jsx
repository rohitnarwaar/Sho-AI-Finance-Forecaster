import { useState } from "react";
import StepIncome from "./steps/StepIncome";
import StepExpenses from "./steps/StepExpenses";
import StepAssets from "./steps/StepAssets";
import StepLiabilities from "./steps/StepLiabilities";
import StepPersonal from "./steps/StepPersonal";
import StepReview from "./steps/StepReview";

// Required fields by step index
const requiredFields = {
  0: ['income'],                     // StepIncome
  1: ['rent', 'food', 'transport'], // StepExpenses
  2: ['savings'],                   // StepAssets
  3: ['loanAmount', 'emi'],         // StepLiabilities
  4: ['age', 'profession'],         // StepPersonal
};

const steps = [
  StepIncome,
  StepExpenses,
  StepAssets,
  StepLiabilities,
  StepPersonal,
  StepReview,
];

export default function MultiStepForm() {
  const [step, setStep] = useState(0);              
  const [formData, setFormData] = useState({});   

  const StepComponent = steps[step];

  const next = () => {
    const keysToCheck = requiredFields[step] || [];
    const isValid = keysToCheck.every(
      (key) => formData[key] !== undefined && formData[key] !== ""
    );

    if (!isValid) {
      alert("Please fill in all required fields before continuing.");
      return;
    }

    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const back = () => setStep((prev) => Math.max(prev - 1, 0));

  const updateForm = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md">
      <StepComponent formData={formData} updateForm={updateForm} />
      <div className="flex justify-between mt-6">
        <button
          onClick={back}
          disabled={step === 0}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back
        </button>
        <button
          onClick={next}
          disabled={step === steps.length - 1}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}
