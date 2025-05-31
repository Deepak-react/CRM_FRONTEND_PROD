import React, { useState } from 'react';

const BillingSettings = () => {
  const [currentPlan, setCurrentPlan] = useState('Pro');
  const [nextPaymentDate] = useState('June 30, 2025');
  const [invoices] = useState([
    { id: 'INV-1001', date: 'Apr 30, 2025', amount: '$49.00', status: 'Paid' },
    { id: 'INV-1000', date: 'Mar 30, 2025', amount: '$49.00', status: 'Paid' },
  ]);

  const plans = [
    {
      name: 'Free',
      price: '$0/month',
      features: ['Limited access', 'Basic support'],
    },
    {
      name: 'Pro',
      price: '$49/month',
      features: ['Unlimited access', 'Priority support'],
    },
  ];

  return (
    <div className="mx-auto mt-10 bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl rounded-3xl p-8 space-y-10">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Billing & Subscription</h2>
        <p className="text-gray-600">Manage your current plan and view past invoices.</p>
      </div>

      {/* Current Plan */}
      <div className="bg-blue-100/60 border border-blue-300 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-blue-800 mb-1">Current Plan: {currentPlan}</h3>
        <p className="text-sm text-blue-700 mb-4">
          Renews on <strong>{nextPaymentDate}</strong>.
        </p>
        <div className="flex flex-wrap gap-4">
          <button className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
            Upgrade Plan
          </button>
          <button className="px-5 py-2 border border-gray-300 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition">
            Cancel Subscription
          </button>
        </div>
      </div>

      {/* Plan Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-xl border p-5 shadow-sm ${
              currentPlan === plan.name ? 'border-blue-500 bg-blue-50/40' : 'border-gray-200'
            }`}
          >
            <h4 className="text-lg font-bold mb-1">{plan.name}</h4>
            <p className="text-sm text-gray-600 mb-3">{plan.price}</p>
            <ul className="list-disc list-inside text-sm text-gray-500 space-y-1 mb-4">
              {plan.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
            <button
              disabled={currentPlan === plan.name}
              className={`w-full py-2 rounded-full font-medium transition ${
                currentPlan === plan.name
                  ? 'bg-gray-300 text-white cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
              onClick={() => setCurrentPlan(plan.name)}
            >
              {currentPlan === plan.name ? 'Current Plan' : 'Choose Plan'}
            </button>
          </div>
        ))}
      </div>

      {/* Billing History */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Billing History</h3>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3">Invoice ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t">
                  <td className="px-4 py-2">{inv.id}</td>
                  <td className="px-4 py-2">{inv.date}</td>
                  <td className="px-4 py-2">{inv.amount}</td>
                  <td className="px-4 py-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingSettings;
