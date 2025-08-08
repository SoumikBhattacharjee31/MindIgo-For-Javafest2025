'use client';
import React, { useState } from 'react';

const ReviewModal = ({ action, onClose, onSubmit }: any) => {
  const [comments, setComments] = useState('');

  const handleSubmit = () => {
    onSubmit(comments);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">
          {action === 'APPROVE' ? 'Approve' : action === 'REJECT' ? 'Reject' : 'Request Info'}
        </h2>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Add comments (optional)"
          className="w-full border rounded p-2 mb-4"
          rows={4}
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 text-white rounded ${
              action === 'APPROVE' ? 'bg-green-600' :
              action === 'REJECT' ? 'bg-red-600' : 'bg-yellow-600'
            } hover:opacity-90`}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;