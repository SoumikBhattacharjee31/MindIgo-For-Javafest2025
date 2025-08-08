"use client"
import React, { useState } from 'react';
import { RoutineResponse, AssignRoutineRequest } from '../types/routine';
import { FaUser, FaSearch, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

interface Patient {
  id: number;
  name: string;
  email: string;
  age?: number;
  phoneNumber?: string;
}

interface PatientAssignProps {
  routine: RoutineResponse;
  onAssign: (request: AssignRoutineRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const PatientAssign: React.FC<PatientAssignProps> = ({
  routine,
  onAssign,
  onCancel,
  isLoading = false
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([
    // Mock data - replace with actual API call
    { id: 1, name: 'John Smith', email: 'john.smith@email.com', age: 32, phoneNumber: '+1234567890' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah.j@email.com', age: 28, phoneNumber: '+1234567891' },
    { id: 3, name: 'Michael Brown', email: 'm.brown@email.com', age: 45, phoneNumber: '+1234567892' },
    { id: 4, name: 'Emily Davis', email: 'emily.davis@email.com', age: 35, phoneNumber: '+1234567893' },
    { id: 5, name: 'David Wilson', email: 'd.wilson@email.com', age: 41, phoneNumber: '+1234567894' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedPatientId) return;

    setIsSubmitting(true);
    try {
      await onAssign({
        patientId: selectedPatientId,
        routineId: routine.id
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <FaUser className="mr-2 text-blue-500" />
            Assign Routine to Patient
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Select a patient to assign "{routine.name}" routine
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Patient List */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Select Patient:</h3>
            <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
              {filteredPatients.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FaUser className="mx-auto text-4xl mb-4 text-gray-300" />
                  <p>No patients found</p>
                  <p className="text-sm">Try adjusting your search criteria</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedPatientId === patient.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => setSelectedPatientId(patient.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-grow">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                                selectedPatientId === patient.id ? 'bg-blue-500' : 'bg-gray-400'
                              }`}>
                                {patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </div>
                            </div>
                            <div className="flex-grow">
                              <h4 className="font-medium text-gray-900">{patient.name}</h4>
                              <p className="text-sm text-gray-600">{patient.email}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                {patient.age && <span>Age: {patient.age}</span>}
                                {patient.phoneNumber && <span>Phone: {patient.phoneNumber}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                        {selectedPatientId === patient.id && (
                          <FaCheck className="text-blue-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Patient Summary */}
          {selectedPatient && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Assignment Summary</h4>
              <div className="text-sm text-blue-800">
                <p><strong>Patient:</strong> {selectedPatient.name}</p>
                <p><strong>Routine:</strong> {routine.name}</p>
                <p><strong>Activities:</strong> {routine.activities.length} activities</p>
                <p><strong>Type:</strong> {routine.routineType.charAt(0) + routine.routineType.slice(1).toLowerCase()}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              disabled={isSubmitting || isLoading}
            >
              <FaTimes className="inline mr-2" />
              Cancel
            </button>
            <button
              onClick={handleAssign}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={!selectedPatientId || isSubmitting || isLoading}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Assigning...
                </>
              ) : (
                <>
                  <FaCheck className="mr-2" />
                  Assign Routine
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientAssign;