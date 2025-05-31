import React, { useEffect, useState } from 'react';
import CompanyForm from '@/Components/Company/CompanyForm';
import CompanyCard from '@/Components/Company/CompanyCard';
import CompanyRow from '@/Components/Company/CompanyRow';
import { LayoutGrid, List, Plus } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('grid');
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchCompanies = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setCompanies(data);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleDelete = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchCompanies();
  };

  const filtered = companies.filter(c =>
    c.cCompany_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search Company..."
          className="border p-2 rounded-2xl w-3/2"
          onChange={e => setSearchTerm(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded hover:bg-gray-200 ${view === 'grid' ? 'bg-gray-300' : ''}`}
          >
            <LayoutGrid className="text-black" size={20} />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded hover:bg-gray-200 ${view === 'list' ? 'bg-gray-300' : ''}`}
          >
            <List className="text-black" size={20} />
          </button>
          <button
            onClick={() => {
              setEditData(null);
              setFormOpen(true);
            }}
            className="p-2 rounded bg-black text-white flex items-center gap-1 hover:bg-green-700"
          >
            <Plus size={18} /> Add
          </button>
        </div>
      </div>

      <div className={view === 'grid' ? "grid grid-cols-3 gap-4" : ""}>
        {filtered.map((company) =>
          view === 'grid' ? (
            <CompanyCard
              key={company.iCompany_id}
              company={company}
              onEdit={() => {
                setEditData(company);
                setFormOpen(true);
              }}
              onDelete={() => handleDelete(company.iCompany_id)}
            />
          ) : (
            <CompanyRow
              key={company.iCompany_id}
              company={company}
              onEdit={() => {
                setEditData(company);
                setFormOpen(true);
              }}
              onDelete={() => handleDelete(company.iCompany_id)}
            />
          )
        )}
      </div>

      {formOpen && (
        <CompanyForm
          initialData={editData}
          onClose={() => {
            setFormOpen(false);
            setEditData(null);
            fetchCompanies();
          }}
        />
      )}
    </div>
  );
};

export default CompanyList;
