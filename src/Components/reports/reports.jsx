import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileHeader from "../../Components/common/ProfileHeader";

const cardsData = [
  {
    title: "Sales by Stage Analytics",
    description: "View performance of opportunities across sales stages.",
    route: "/sales-by-stage-analytics",
    image: "/public/illustrations/Analytics-rafiki.svg", // Use your actual image path here
  },
  {
    title: "Lead Lost Analytics",
    description: "Analyze lost leads and identify drop-off patterns.",
    route: "/lead-lost-analytics",
    image: "/public/illustrations/oversight-amico.svg", // Use your actual image path here
  },
];
const CardsPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filteredCards = cardsData.filter((card) =>
    card.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      

      {/* Main Content */}
      <div className="flex-1 px-8 py-10">
                          <ProfileHeader />

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Dashbaords"
              className="w-full px-5 py-3 text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
           
          </div>
        </div>

        {/* Header */}
        <h2 className="text-3xl font-semibold mb-8 tracking-tight">Analytics Dashboard</h2>

        {/* Cards */}
        {filteredCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredCards.map((card, index) => (
              <div
                key={index}
                onClick={() => navigate(card.route)}
                className="flex items-center justify-between bg-white rounded-2xl p-6 min-h-[180px] shadow-sm hover:shadow-md transition cursor-pointer border border-gray-200 hover:border-blue-400"
              >
                {/* Text Content */}
                <div className="flex-1 pr-4">
                  <h3 className="text-xl font-medium text-gray-800 mb-2">{card.title}</h3>
                  <p className="text-sm text-gray-500">{card.description}</p>
                </div>

                {/* Image */}
              <div className="w-40 h-40 flex-shrink-0">
  <img
    src={card.image}
    alt={card.title}
    className="w-full h-full object-cover rounded-lg"
  />
</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No results found for "{query}"</p>
        )}
      </div>
    </div>
  );
};

export default CardsPage;