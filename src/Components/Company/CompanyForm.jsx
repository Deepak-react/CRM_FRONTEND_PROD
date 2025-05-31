import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const CompanyForm = ({ initialData, onClose }) => {
  const [formData, setFormData] = useState({
    cCompany_name: '',
    cLogo_link: '',
    iPhone_no: '',
    cWebsite: '',
    caddress1: '',
    caddress2: '',
    caddress3: '',
    cGst_no: '',
    icin_no: '',
    bactive: true,
    iReseller_id: '',
    iUser_no: '',
    icity_id: ''
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = initialData ? 'PUT' : 'POST';
    const url = initialData ? `${API_URL}/${initialData.iCompany_id}` : API_URL;

    console.log('Submitting company data:', formData);
    console.log('Form submitted:', formData);

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(data => {
        console.log(`${method} success:`, data);
        onClose();
      })
      .catch(err => console.error(`${method} error:`, err));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded w-full max-w-2xl">
        <h2 className="text-xl mb-4">{initialData ? 'Edit' : 'Add'} Company</h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.keys(formData).map(key => (
            key !== 'iCompany_id' && (
              <input
                key={key}
                type={typeof formData[key] === 'boolean' ? 'checkbox' : 'text'}
                name={key}
                checked={typeof formData[key] === 'boolean' ? formData[key] : undefined}
                value={typeof formData[key] === 'boolean' ? undefined : formData[key]}
                onChange={handleChange}
                placeholder={key}
                className="border p-2 rounded"
              />
            )
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
        </div>
      </form>
    </div>
  );
};

export default CompanyForm;