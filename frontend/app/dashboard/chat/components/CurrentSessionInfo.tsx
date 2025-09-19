interface CurrentSessionInfoProps {
  sessionId: string | null;
  messages: Array<any>;
}

const CurrentSessionInfo = ({
  sessionId,
  messages,
}: CurrentSessionInfoProps) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
      <h3 className="font-semibold text-gray-800 mb-2">Current Session</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">ID:</span>
          <code className="text-xs bg-white px-2 py-1 rounded font-mono">
            {sessionId ? sessionId.substring(0, 8) + "..." : "Loading..."}
          </code>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Messages:</span>
          <span className="font-semibold text-indigo-600">
            {messages.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CurrentSessionInfo;
