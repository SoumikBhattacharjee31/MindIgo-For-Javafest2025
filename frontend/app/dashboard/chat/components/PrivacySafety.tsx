import { Shield } from "lucide-react";

const PrivacySafety = () => {
  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100">
      <div className="flex items-center space-x-2 mb-2">
        <Shield className="w-4 h-4 text-emerald-600" />
        <h3 className="font-semibold text-gray-800">Privacy & Safety</h3>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">
        Your conversations are confidential and secure. Our AI is trained to
        recognize crisis situations and provide appropriate support.
      </p>
    </div>
  );
};
export default PrivacySafety;
