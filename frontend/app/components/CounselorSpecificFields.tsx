import React from 'react';

interface CounselorSpecificFieldsProps {
  licenseNumber: string;
  setLicenseNumber: (value: string) => void;
  specialization: string;
  setSpecialization: (value: string) => void;
  verificationDocument: File | undefined;
  setVerificationDocument: (file: File | undefined) => void;
}

const CounselorSpecificFields: React.FC<CounselorSpecificFieldsProps> = ({
  licenseNumber,
  setLicenseNumber,
  specialization,
  setSpecialization,
  verificationDocument,
  setVerificationDocument
}) => {
  return (
    <div className="space-y-4">
      {/* License Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          License Number *
        </label>
        <input
          type="text"
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          className="w-full px-3 py-2 text-blue-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your professional license number"
          required
        />
      </div>

      {/* Specialization */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Specialization *
        </label>
        <input
          type="text"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          className="w-full px-3 py-2 text-blue-700  border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Clinical Psychology, Marriage Counseling"
          required
        />
      </div>

      {/* Verification Document */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Verification Document *
        </label>
        <input
          type="file"
          onChange={(e) => setVerificationDocument(e.target.files?.[0])}
          accept=".pdf,.jpg,.jpeg,.png"
          className="w-full px-3 py-2 text-blue-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Upload your professional license or certification (PDF, JPG, PNG)
        </p>
      </div>
    </div>
  );
};

export default CounselorSpecificFields;