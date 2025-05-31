import React, { useEffect, useState } from "react";

export default function KPIStats(data) {
  const [hotCount, setHotCount] = useState(0);
  const [warmCount, setWarmCount] = useState(0);
  const [coldCount, setColdCount] = useState(0);
  const [wonCount, setWonCount] = useState(0);

  const leads = data?.data?.leads || [];

  useEffect(() => {
    let hot = 0, warm = 0, cold = 0, won = 0;

    leads.forEach(lead => {
      const potential = lead.lead_potential?.clead_name;
      const status = lead.lead_status?.clead_name;

      if (potential === "HOT") hot++;
      else if (potential === "WARM") warm++;
      else if (potential === "COLD") cold++;

      if (status === "Won") won++;
    });

    setHotCount(hot);
    setWarmCount(warm);
    setColdCount(cold);
    setWonCount(won);
  }, [leads]);

  const kpiData = [
    {
      title: "Hot Leads",
      value: hotCount,
      color: "text-red-500",
      bg: "/illustrations/hot.svg",
    },
    {
      title: "Warm Leads",
      value: warmCount,
      color: "text-orange-500",
      bg: "/illustrations/warm.svg",
    },
    {
      title: "Cold Leads",
      value: coldCount,
      color: "text-blue-500",
      bg: "/illustrations/cold.svg",
    },
    {
      title: "Total Won",
      value: wonCount,
      color: "text-green-600",
      bg: "/illustrations/win.svg",
    },
  ];

  if (leads.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8 text-lg font-medium">
        No data available
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="max-w-3xl mx-auto grid grid-cols-2 grid-rows-2 gap-6">
        {kpiData.map((kpi, index) => (
          <div
            key={index}
            className="relative min-h-[160px] backdrop-blur-md bg-white/60 border border-white/30 shadow-[0_4px_30px_rgba(0,0,0,0.05)] rounded-2xl p-5 transition-all hover:shadow-lg overflow-hidden"
            style={{
              backgroundImage: `url(${kpi.bg})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right bottom",
              backgroundSize: "150px",
            }}
          >
            <div className="flex flex-col justify-between h-full">
              <div>
                <h3 className="text-xs font-semibold text-gray-600 mb-1 tracking-tight">
                  {kpi.title}
                </h3>
                <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
