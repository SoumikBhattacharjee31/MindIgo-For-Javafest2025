import React, { useState } from 'react';
import MeetingRoom from './MeetingRoom';

const MeetingLauncher = ({ meetingRequest, userRole, onClose }) => {
  const [inMeeting, setInMeeting] = useState(false);

  const startMeeting = () => {
    setInMeeting(true);
  };

  const endMeeting = () => {
    setInMeeting(false);
    onClose();
  };

  if (inMeeting) {
    return (
      <MeetingRoom
        meetingRoomId={meetingRequest.meetingRoomId}
        meetingType={meetingRequest.meetingType}
        userRole={userRole}
        onEndMeeting={endMeeting}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Join {meetingRequest.meetingType} Meeting
        </h3>
        <p className="text-gray-600 mb-6">
          {userRole === 'USER' 
            ? `Meeting with ${meetingRequest.counselorUsername}`
            : `Meeting with ${meetingRequest.userUsername}`
          }
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
          <p className="text-yellow-800 text-sm">
            Make sure your browser allows camera and microphone access for this meeting.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={startMeeting}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200"
          >
            Join Meeting
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingLauncher;