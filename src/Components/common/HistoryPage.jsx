import React, { useEffect, useState } from "react";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setHistory(dummyData);
    }, 500);
  }, []);

  const visibleHistory = showAll ? history : history.slice(0, 3);

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">History</h2>
        {history.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-600 hover:underline"
          >
            {showAll ? "Show less" : "Show more"}
          </button>
        )}
      </div>
      <ul className="space-y-4">
        {visibleHistory.map((item, index) => (
          <li key={index} className="flex items-start text-sm text-gray-700">
            <img
              src={item.avatar}
              alt={item.user}
              className="w-8 h-8 rounded-full mr-3"
            />
            <div>
              <span className="font-medium">{item.action}</span>{" "}
              <span className="text-gray-800">{item.user}</span>’s work on{" "}
              <span className="font-medium">{item.date}</span> at{" "}
              <span className="font-medium">{item.time}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryPage;
