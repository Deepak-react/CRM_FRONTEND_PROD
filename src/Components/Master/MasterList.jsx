// MasterList.jsx (No changes needed from previous version)
import React from 'react';

export default function MasterList({ items, onEdit, onDelete }) {
  console.log("[MasterList] Rendering with items:", items);

  return (
    <ul className="divide-y">
      {items.map((item) => (
        <li
          key={item.id}
          className="py-2 flex justify-between items-center group hover:bg-blue-50 rounded"
        >
          <span className="text-gray-800 font-medium">{item.name}</span>
          <div className="flex items-center space-x-2">
            <button
              className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
              onClick={() => {
                // console.log("[MasterList] Edit clicked for item:", item.id);
                onEdit(item);
              }}
              title="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.85 0 0 1 2 2L15 9l-3-3L17 3Z"/><path d="m15 9-1.5-1.5L6 17H3v3h3l8.5-8.5Z"/></svg>
            </button>
            <button
              className="p-1 text-red-600 hover:text-red-800 transition-colors"
              onClick={() => {
                // console.log("[MasterList] Delete clicked for item ID:", item.id);
                onDelete(item.id);
              }}
              title="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
} 