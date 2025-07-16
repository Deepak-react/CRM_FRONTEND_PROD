import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  FiEdit,
  FiPhone,
  FiChevronDown,
  FiMail,
  FiMapPin,
  FiUpload,
  FiSave,
  FiEye,
  FiX,
  FiMove,
  FiCodesandbox,
  FiCamera,
  FiDollarSign,
  FiUser
} from "react-icons/fi";
import { TbWorld } from "react-icons/tb";
import axios from "axios";
import { useParams } from "react-router-dom";
import Loader from "./Loader";
import { Dialog } from "@headlessui/react";
import { useDropzone } from "react-dropzone";
import FilePreviewer from "./FilePreviewer";
import DemoSessionDetails from "./demo_session_details";

const apiEndPoint = import.meta.env.VITE_API_URL;
const apiNoEndPoint = import.meta.env.VITE_NO_API_URL;

const EditProfileForm = ({ profile, onClose, onSave }) => {
  const token = localStorage.getItem("token");

  let userId = "";
  let company_id = "";

  if (token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(base64));
      userId = payload.user_id;
      company_id = payload.company_id;
    } catch (error) {
      console.error("Token decode error:", error);
    }
  } else {
    console.error("Invalid or missing JWT token");
  }

  const [form, setForm] = useState({
    iLeadpoten_id: profile?.iLeadpoten_id || "",
    iservice_id: profile?.iservice_id || "",
    ileadstatus_id: profile?.ileadstatus_id || 0,
    cindustry_id: profile?.cindustry_id || "",
    csubindustry_id: profile?.csubindustry_id || "",
    lead_source_id: profile?.lead_source_id || "",
    ino_employee: profile?.ino_employee || 0,
    iproject_value: profile?.iproject_value || 0,
    clead_name: profile?.clead_name || "",
    cemail: profile?.cemail || "",
    corganization: profile?.corganization || "",
    cwebsite: profile?.cwebsite || "",
    icity: profile?.icity || "",
    iphone_no: profile?.iphone_no ? profile.iphone_no.replace(profile?.phone_country_code || "+91", "") : "",
    phone_country_code: profile?.phone_country_code || "+91",
    cwhatsapp: profile?.cwhatsapp ? profile.cwhatsapp.replace(profile?.whatsapp_country_code || "+91", "") : "",
    whatsapp_country_code: profile?.whatsapp_country_code || "+91",
    cgender: profile?.cgender || 1,
    clogo: profile?.clogo || "logo.png",
    clead_address1: profile?.clead_address1 || "",
    clead_address2: profile?.clead_address2 || "",
    clead_address3: profile?.clead_address3 || "",
    cresponded_by: userId,
    icompany_id: company_id,
    modified_by: userId,
  });

  const [errors, setErrors] = useState({});
  const [Potential, setPotential] = useState([]);
  const [status, setStatus] = useState([]);
  const [leadIndustry, setIndustry] = useState([]);
  const [leadSubIndustry, setSubIndustry] = useState([]);
  const [cities, setCities] = useState([]);
  const [source, setSource] = useState([]);
  const [countryCodes, setCountryCodes] = useState([]);
  const [service, setService] = useState([]);
  const [searchCity, setSearchCity] = useState("");
  const [filteredCities, setFilteredCities] = useState([]);
  const [searchPotential, setSearchPotential] = useState("");
  const [searchService, setSearchService] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchIndustry, setSearchIndustry] = useState("");
  const [searchSubIndustry, setSearchSubIndustry] = useState("");
  const [searchSource, setSearchSource] = useState("");
  const [isUpdated, setIsUpdated] = useState(false);

  const cityDropdownRef = useRef(null);
  const potentialDropdownRef = useRef(null);
  const serviceDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const industryDropdownRef = useRef(null);
  const subIndustryDropdownRef = useRef(null);
  const sourceDropdownRef = useRef(null);
  const phoneCountryCodeRef = useRef(null);
  const whatsappCountryCodeRef = useRef(null);

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isPotentialDropdownOpen, setIsPotentialDropdownOpen] = useState(false);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isIndustryDropdownOpen, setIsIndustryDropdownOpen] = useState(false);
  const [isSubIndustryDropdownOpen, setIsSubIndustryDropdownOpen] = useState(false);
  const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);
  const [isPhoneCountryCodeOpen, setIsPhoneCountryCodeOpen] = useState(false);
  const [isWhatsappCountryCodeOpen, setIsWhatsappCountryCodeOpen] = useState(false);

  const fetchDropdownData = async (endpoint, setData, dataName, transformFn) => {
    try {
      const response = await fetch(`${apiEndPoint}/${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error(`Can't fetch ${dataName}. Status: ${response.status}`);
        return;
      }

      const rawData = await response.json();
      setData(transformFn(rawData));
    } catch (e) {
      console.error(`Error in fetching ${dataName}:`, e);
    }
  };

  const fetchCitiesData = async () => {
    try {
      const response = await fetch(`${apiEndPoint}/city`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error("Can't fetch cities, there was an error.");
        return;
      }

      const data = await response.json();
      if (data && Array.isArray(data.cities)) {
        setCities(data.cities);
        setFilteredCities(data.cities);
      }
    } catch (e) {
      console.error("Error in fetching cities:", e);
    }
  };

  const fetchCountryCodes = async () => {
    try {
      const response = await fetch(`${apiEndPoint}/country-codes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error("Can't fetch country codes");
        return;
      }

      const data = await response.json();
      if (data && Array.isArray(data.countryCodes)) {
        setCountryCodes(data.countryCodes);
      }
    } catch (e) {
      console.error("Error in fetching country codes:", e);
    }
  };

  const fetchService = async () => {
    try {
      const response = await fetch(`${apiEndPoint}/lead-service`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error("Can't fetch lead service");
        return;
      }

      const rawData = await response.json();
      setService(rawData.data || []);
    } catch (e) {
      console.error("Error in fetching lead services:", e);
    }
  };

  const fetchIndustryAndSubIndustry = async () => {
    try {
      const response = await fetch(`${apiEndPoint}/lead-industry/company-industry`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error("Can't fetch lead industry and sub-industry");
        return;
      }

      const rawData = await response.json();
      setIndustry(rawData.response?.industry || []);
      setSubIndustry(rawData.response?.subindustries || []);
    } catch (e) {
      console.error("Error in fetching lead industry and sub-industry:", e);
    }
  };

  useEffect(() => {
    fetchDropdownData("lead-potential/company-potential", setPotential, "lead potential", (res) => res.data || []);
    fetchDropdownData("lead-status/company-lead", setStatus, "lead status", (res) => res.response || []);
    fetchDropdownData("lead-source/company-src", setSource, "lead sources", (data) => data.data || []);
    fetchCitiesData();
    fetchCountryCodes();
    fetchService();
    fetchIndustryAndSubIndustry();
  }, [token]);

  useEffect(() => {
    if (profile) {
      const setInitialDropdownValue = (items, idKey, nameKey, formId, setSearch) => {
        const selectedItem = items.find(item => item[idKey] === profile[formId]);
        if (selectedItem) setSearch(selectedItem[nameKey]);
      };

      setInitialDropdownValue(Potential, 'ileadpoten_id', 'clead_name', 'iLeadpoten_id', setSearchPotential);
      setInitialDropdownValue(service, 'iservice_id', 'cservice_name', 'iservice_id', setSearchService);
      setInitialDropdownValue(status, 'ilead_status_id', 'clead_name', 'ilead_status_id', setSearchStatus);
      setInitialDropdownValue(leadIndustry, 'iindustry_id', 'cindustry_name', 'cindustry_id', setSearchIndustry);
      setInitialDropdownValue(leadSubIndustry, 'isubindustry', 'subindustry_name', 'csubindustry_id', setSearchSubIndustry);
      setInitialDropdownValue(source, 'source_id', 'source_name', 'lead_source_id', setSearchSource);
      setInitialDropdownValue(cities, 'icity_id', 'cCity_name', 'icity', setSearchCity);
    }
  }, [profile, Potential, status, leadIndustry, leadSubIndustry, source, cities, service]);

  const handleSearchCity = (e) => {
    const searchTerm = e.target.value;
    setSearchCity(searchTerm);
    const filtered = cities.filter((city) =>
      city.cCity_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCities(filtered);
    setIsCityDropdownOpen(true);
  };

  const handleCitySelect = (cityId, cityName) => {
    setForm((prev) => ({ ...prev, icity: cityId }));
    setSearchCity(cityName);
    setIsCityDropdownOpen(false);
    setErrors((prev) => ({ ...prev, icity: "" }));
  };

  const handlePotentialSelect = (potentialId, potentialName) => {
    setForm((prev) => ({ ...prev, iLeadpoten_id: potentialId }));
    setSearchPotential(potentialName);
    setIsPotentialDropdownOpen(false);
    setErrors((prev) => ({ ...prev, iLeadpoten_id: "" }));
  };

  const handleServiceSelect = (iservice_id, cservice_name) => {
    setForm((prev) => ({ ...prev, iservice_id: iservice_id }));
    setSearchService(cservice_name);
    setIsServiceDropdownOpen(false);
    setErrors((prev) => ({ ...prev, iservice_id: "" }));
  };

  const handleStatusSelect = (statusId, statusName) => {
    setForm((prev) => ({ ...prev, ilead_status_id: statusId }));
    setSearchStatus(statusName);
    setIsStatusDropdownOpen(false);
    setErrors((prev) => ({ ...prev, ilead_status_id: "" }));
  };

  const handleIndustrySelect = (industryId, industryName) => {
    setForm((prev) => ({ ...prev, cindustry_id: industryId, csubindustry_id: "" }));
    setSearchIndustry(industryName);
    setIsIndustryDropdownOpen(false);
    setSearchSubIndustry("");
    setErrors((prev) => ({ ...prev, cindustry_id: "" }));
    setErrors((prev) => ({ ...prev, csubindustry_id: "" }));
  };

  const handleSubIndustrySelect = (subIndustryId, subIndustryName) => {
    setForm((prev) => ({ ...prev, csubindustry_id: subIndustryId }));
    setSearchSubIndustry(subIndustryName);
    setIsSubIndustryDropdownOpen(false);
    setErrors((prev) => ({ ...prev, csubindustry_id: "" }));
  };

  const handleSourceSelect = (sourceId, sourceName) => {
    setForm((prev) => ({ ...prev, lead_source_id: sourceId }));
    setSearchSource(sourceName);
    setIsSourceDropdownOpen(false);
    setErrors((prev) => ({ ...prev, lead_source_id: "" }));
  };

  const handlePhoneCountryCodeSelect = (code) => {
    setForm((prev) => ({ ...prev, phone_country_code: code }));
    setIsPhoneCountryCodeOpen(false);
  };

  const handleWhatsappCountryCodeSelect = (code) => {
    setForm((prev) => ({ ...prev, whatsapp_country_code: code }));
    setIsWhatsappCountryCodeOpen(false);
  };

  const filteredSubIndustries = leadSubIndustry.filter(
    (sub) => sub.iindustry_parent === form.cindustry_id
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setIsCityDropdownOpen(false);
      }
      if (potentialDropdownRef.current && !potentialDropdownRef.current.contains(event.target)) {
        setIsPotentialDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
      if (industryDropdownRef.current && !industryDropdownRef.current.contains(event.target)) {
        setIsIndustryDropdownOpen(false);
      }
      if (subIndustryDropdownRef.current && !subIndustryDropdownRef.current.contains(event.target)) {
        setIsSubIndustryDropdownOpen(false);
      }
      if (sourceDropdownRef.current && !sourceDropdownRef.current.contains(event.target)) {
        setIsSourceDropdownOpen(false);
      }
      if (phoneCountryCodeRef.current && !phoneCountryCodeRef.current.contains(event.target)) {
        setIsPhoneCountryCodeOpen(false);
      }
      if (whatsappCountryCodeRef.current && !whatsappCountryCodeRef.current.contains(event.target)) {
        setIsWhatsappCountryCodeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    let newErrors = {};
    const isNumeric = (value) => /^\d+$/.test(value);

    if (!form.clead_name.trim()) {
      newErrors.clead_name = "Name is required.";
    } else if (form.clead_name.trim().length > 20) {
      newErrors.clead_name = "Name cannot exceed 20 characters.";
    }

    if (!form.iphone_no.trim()) {
      newErrors.iphone_no = "Phone number is required.";
    } else if (!isNumeric(form.iphone_no)) {
      newErrors.iphone_no = "Phone number must contain only digits.";
    } else if (!/^\d{10}$/.test(form.iphone_no)) {
      newErrors.iphone_no = "Phone number must be 10 digits.";
    }

    if (form.cwhatsapp.trim()) {
      if (!isNumeric(form.cwhatsapp)) {
        newErrors.cwhatsapp = "WhatsApp number must contain only digits.";
      } else if (!/^\d{10}$/.test(form.cwhatsapp)) {
        newErrors.cwhatsapp = "WhatsApp number must be 10 digits.";
      }
    }

    if (form.cemail.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.cemail)) {
        newErrors.cemail = "Invalid email format.";
      } else if (form.cemail.trim().length > 30) {
        newErrors.cemail = "Email cannot exceed 30 characters.";
      }
    }

    if (form.cwebsite.trim()) {
      if (!/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/.test(form.cwebsite)) {
        newErrors.cwebsite = "Invalid website format.";
      }
    }

    if (!form.iLeadpoten_id) {
      newErrors.iLeadpoten_id = "Potential is required.";
    }
    if (!form.cindustry_id) {
      newErrors.cindustry_id = "Industry is required.";
    }
    if (!form.corganization.trim()) {
      newErrors.corganization = "Organization is required.";
    }
    if (!form.lead_source_id) {
      newErrors.lead_source_id = "Lead source is required.";
    }
    if (form.cindustry_id && !form.csubindustry_id && filteredSubIndustries.length > 0) {
      newErrors.csubindustry_id = "Sub-Industry is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const formDataToSave = {
        ...form,
        iphone_no: form.phone_country_code + form.iphone_no,
        cwhatsapp: form.cwhatsapp ? form.whatsapp_country_code + form.cwhatsapp : "",
      };
      onSave(formDataToSave);
    } else {
      console.log("Form has validation errors:", errors);
    }
  };

  // --- Blue Theme Classes ---
  const commonInputClasses = "mt-1 block w-full border rounded-lg shadow-sm py-2 px-3 text-gray-800 focus:outline-none focus:ring-blue-600 focus:border-blue-600 transition-all duration-200 text-sm";
  const errorInputClasses = "border-red-500 focus:ring-red-500 focus:border-red-500";
  const labelClasses = "block text-sm font-medium text-blue-800 mb-1";
  const errorTextClasses = "text-red-500 text-xs mt-1";
  const dropdownItemClasses = "cursor-pointer hover:bg-blue-100 px-4 py-2 text-blue-900";
  const countryCodeButtonClasses = "w-20 border border-blue-300 rounded-lg py-2 px-3 text-gray-800 text-sm bg-blue-50 flex items-center justify-between";

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 md:p-8">
      <div className="block bg-white p-4 sm:p-8 rounded-2xl max-w-5xl w-full shadow-lg overflow-y-auto h-[90vh] relative border-2 border-blue-500">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-blue-700 transition-colors"
        >
          <FiX size={24} />
        </button>

        <h3 className="text-xl sm:text-2xl font-semibold text-blue-900 mb-6 border-b pb-3 border-blue-200">
          Edit Lead Profile
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Name Field */}
            <div>
              <label htmlFor="clead_name" className={labelClasses}>
                Name: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="clead_name"
                name="clead_name"
                value={form.clead_name}
                onChange={handleFieldChange}
                className={`${commonInputClasses} ${errors.clead_name ? errorInputClasses : "border-blue-300"}`}
              />
              {errors.clead_name && <p className={errorTextClasses}>{errors.clead_name}</p>}
            </div>

            {/* Organization Field */}
            <div>
              <label htmlFor="corganization" className={labelClasses}>
                Organization: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="corganization"
                name="corganization"
                value={form.corganization}
                onChange={handleFieldChange}
                className={`${commonInputClasses} ${errors.corganization ? errorInputClasses : "border-blue-300"}`}
              />
              {errors.corganization && <p className={errorTextClasses}>{errors.corganization}</p>}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="iphone_no" className={labelClasses}>
                Phone: <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative" ref={phoneCountryCodeRef}>
                  <button
                    type="button"
                    onClick={() => setIsPhoneCountryCodeOpen(!isPhoneCountryCodeOpen)}
                    className={countryCodeButtonClasses}
                  >
                    {form.phone_country_code}
                    <FiChevronDown size={16} className="ml-1" />
                  </button>
                  {isPhoneCountryCodeOpen && countryCodes.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-blue-500 ring-opacity-50 overflow-auto focus:outline-none sm:text-sm">
                      {countryCodes.map((code) => (
                        <div
                          key={code}
                          className={dropdownItemClasses}
                          onClick={() => {
                            handlePhoneCountryCodeSelect(code);
                            setErrors(prev => ({ ...prev, iphone_no: "" }));
                          }}
                        >
                          {code}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  id="iphone_no"
                  name="iphone_no"
                  value={form.iphone_no}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setForm(prev => ({ ...prev, iphone_no: value }));
                    setErrors(prev => ({ ...prev, iphone_no: "" }));
                  }}
                  className={`flex-1 ${commonInputClasses} ${errors.iphone_no ? errorInputClasses : "border-blue-300"}`}
                />
              </div>
              {errors.iphone_no && <p className={errorTextClasses}>{errors.iphone_no}</p>}
            </div>

            {/* WhatsApp Field */}
            <div>
              <label htmlFor="cwhatsapp" className={labelClasses}>
                WhatsApp:
              </label>
              <div className="flex gap-2">
                <div className="relative" ref={whatsappCountryCodeRef}>
                  <button
                    type="button"
                    onClick={() => setIsWhatsappCountryCodeOpen(!isWhatsappCountryCodeOpen)}
                    className={countryCodeButtonClasses}
                  >
                    {form.whatsapp_country_code}
                    <FiChevronDown size={16} className="ml-1" />
                  </button>
                  {isWhatsappCountryCodeOpen && countryCodes.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-blue-500 ring-opacity-50 overflow-auto focus:outline-none sm:text-sm">
                      {countryCodes.map((code) => (
                        <div
                          key={code}
                          className={dropdownItemClasses}
                          onClick={() => {
                            handleWhatsappCountryCodeSelect(code);
                            setErrors(prev => ({ ...prev, cwhatsapp: "" }));
                          }}
                        >
                          {code}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  id="cwhatsapp"
                  name="cwhatsapp"
                  value={form.cwhatsapp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setForm(prev => ({ ...prev, cwhatsapp: value }));
                    setErrors(prev => ({ ...prev, cwhatsapp: "" }));
                  }}
                  className={`flex-1 ${commonInputClasses} ${errors.cwhatsapp ? errorInputClasses : "border-blue-300"}`}
                />
              </div>
              {errors.cwhatsapp && <p className={errorTextClasses}>{errors.cwhatsapp}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="cemail" className={labelClasses}>
                Email:
              </label>
              <input
                type="email"
                id="cemail"
                name="cemail"
                value={form.cemail}
                onChange={handleFieldChange}
                className={`${commonInputClasses} ${errors.cemail ? errorInputClasses : "border-blue-300"}`}
              />
              {errors.cemail && <p className={errorTextClasses}>{errors.cemail}</p>}
            </div>

            {/* Website Field */}
            <div>
              <label htmlFor="cwebsite" className={labelClasses}>
                Website:
              </label>
              <input
                type="text"
                id="cwebsite"
                name="cwebsite"
                value={form.cwebsite}
                onChange={handleFieldChange}
                className={`${commonInputClasses} ${errors.cwebsite ? errorInputClasses : "border-blue-300"}`}
              />
              {errors.cwebsite && <p className={errorTextClasses}>{errors.cwebsite}</p>}
            </div>

            {/* Lead Potential Dropdown */}
            <div className="relative" ref={potentialDropdownRef}>
              <label htmlFor="iLeadpoten_id" className={labelClasses}>
                Potential: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={searchPotential}
                onChange={(e) => {
                  setSearchPotential(e.target.value);
                  setIsPotentialDropdownOpen(true);
                  setErrors((prev) => ({ ...prev, iLeadpoten_id: "" }));
                }}
                onClick={() => setIsPotentialDropdownOpen(true)}
                className={`${commonInputClasses} ${errors.iLeadpoten_id ? errorInputClasses : "border-blue-300"}`}
                placeholder="Select potential"
                readOnly={Potential.length === 0}
              />
              {isPotentialDropdownOpen && Potential.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-blue-500 ring-opacity-50 overflow-auto focus:outline-none sm:text-sm">
                  {Potential.filter(potential =>
                    potential.clead_name.toLowerCase().includes(searchPotential.toLowerCase())
                  ).map((potential) => (
                    <div
                      key={potential.ileadpoten_id}
                      className={dropdownItemClasses}
                      onClick={() => handlePotentialSelect(potential.ileadpoten_id, potential.clead_name)}
                    >
                      {potential.clead_name}
                    </div>
                  ))}
                </div>
              )}
              {errors.iLeadpoten_id && <p className={errorTextClasses}>{errors.iLeadpoten_id}</p>}
            </div>

            {/* Lead Source Dropdown */}
            <div className="relative" ref={sourceDropdownRef}>
              <label htmlFor="lead_source_id" className={labelClasses}>
                Lead Source: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={searchSource}
                onChange={(e) => {
                  setSearchSource(e.target.value);
                  setIsSourceDropdownOpen(true);
                  setErrors((prev) => ({ ...prev, lead_source_id: "" }));
                }}
                onClick={() => setIsSourceDropdownOpen(true)}
                className={`${commonInputClasses} ${errors.lead_source_id ? errorInputClasses : "border-blue-300"}`}
                placeholder="Select source"
                readOnly={source.length === 0}
              />
              {isSourceDropdownOpen && source.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-blue-500 ring-opacity-50 overflow-auto focus:outline-none sm:text-sm">
                  {source.filter(sourceItem =>
                    sourceItem.source_name.toLowerCase().includes(searchSource.toLowerCase())
                  ).map((sourceItem) => (
                    <div
                      key={sourceItem.source_id}
                      className={dropdownItemClasses}
                      onClick={() => handleSourceSelect(sourceItem.source_id, sourceItem.source_name)}
                    >
                      {sourceItem.source_name}
                    </div>
                  ))}
                </div>
              )}
              {errors.lead_source_id && <p className={errorTextClasses}>{errors.lead_source_id}</p>}
            </div>

            {/* Industry Dropdown */}
            <div className="relative" ref={industryDropdownRef}>
              <label htmlFor="cindustry_id" className={labelClasses}>
                Industry: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={searchIndustry}
                onChange={(e) => {
                  setSearchIndustry(e.target.value);
                  setIsIndustryDropdownOpen(true);
                  setErrors((prev) => ({ ...prev, cindustry_id: "" }));
                }}
                onClick={() => setIsIndustryDropdownOpen(true)}
                className={`${commonInputClasses} ${errors.cindustry_id ? errorInputClasses : "border-blue-300"}`}
                placeholder="Select industry"
                readOnly={leadIndustry.length === 0}
              />
              {isIndustryDropdownOpen && leadIndustry.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-blue-500 ring-opacity-50 overflow-auto focus:outline-none sm:text-sm">
                  {leadIndustry.filter(industry =>
                    industry.cindustry_name.toLowerCase().includes(searchIndustry.toLowerCase())
                  ).map((industry) => (
                    <div
                      key={industry.iindustry_id}
                      className={dropdownItemClasses}
                      onClick={() => handleIndustrySelect(industry.iindustry_id, industry.cindustry_name)}
                    >
                      {industry.cindustry_name}
                    </div>
                  ))}
                </div>
              )}
              {errors.cindustry_id && <p className={errorTextClasses}>{errors.cindustry_id}</p>}
            </div>

            {/* Sub-Industry Dropdown */}
            <div className="relative" ref={subIndustryDropdownRef}>
              <label htmlFor="csubindustry_id" className={labelClasses}>
                Sub-Industry: {form.cindustry_id && filteredSubIndustries.length > 0 && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={searchSubIndustry}
                onChange={(e) => {
                  setSearchSubIndustry(e.target.value);
                  setIsSubIndustryDropdownOpen(true);
                  setErrors((prev) => ({ ...prev, csubindustry_id: "" }));
                }}
                onClick={() => setIsSubIndustryDropdownOpen(true)}
                className={`${commonInputClasses} ${errors.csubindustry_id ? errorInputClasses : "border-blue-300"}`}
                placeholder="Select sub-industry"
                disabled={!form.cindustry_id || filteredSubIndustries.length === 0}
                readOnly={filteredSubIndustries.length === 0}
              />
              {isSubIndustryDropdownOpen && form.cindustry_id && filteredSubIndustries.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-blue-500 ring-opacity-50 overflow-auto focus:outline-none sm:text-sm">
                  {filteredSubIndustries.filter(subIndustry =>
                    subIndustry.subindustry_name.toLowerCase().includes(searchSubIndustry.toLowerCase())
                  ).map((subIndustry) => (
                    <div
                      key={subIndustry.isubindustry}
                      className={dropdownItemClasses}
                      onClick={() => handleSubIndustrySelect(subIndustry.isubindustry, subIndustry.subindustry_name)}
                    >
                      {subIndustry.subindustry_name}
                    </div>
                  ))}
                </div>
              )}
              {errors.csubindustry_id && <p className={errorTextClasses}>{errors.csubindustry_id}</p>}
            </div>

            {/* Services Dropdown */}
            <div className="relative" ref={serviceDropdownRef}>
              <label htmlFor="iservice_id" className={labelClasses}>
                Services:
              </label>
              <input
                type="text"
                value={searchService}
                onChange={(e) => {
                  setSearchService(e.target.value);
                  setIsServiceDropdownOpen(true);
                  setErrors((prev) => ({ ...prev, iservice_id: "" }));
                }}
                onClick={() => setIsServiceDropdownOpen(true)}
                className={`${commonInputClasses} ${errors.iservice_id ? errorInputClasses : "border-blue-300"}`}
                placeholder="Select Services"
                readOnly={service.length === 0}
              />
              {isServiceDropdownOpen && service.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-blue-500 ring-opacity-50 overflow-auto focus:outline-none sm:text-sm">
                  {service.filter(serviceItem =>
                    serviceItem.cservice_name.toLowerCase().includes(searchService.toLowerCase())
                  ).map((serviceItem) => (
                    <div
                      key={serviceItem.iservice_id}
                      className={dropdownItemClasses}
                      onClick={() => handleServiceSelect(serviceItem.iservice_id, serviceItem.cservice_name)}
                    >
                      {serviceItem.cservice_name}
                    </div>
                  ))}
                </div>
              )}
              {errors.iservice_id && <p className={errorTextClasses}>{errors.iservice_id}</p>}
            </div>

            {/* City Dropdown */}
            <div className="relative" ref={cityDropdownRef}>
              <label htmlFor="icity" className={labelClasses}>
                City: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={searchCity}
                onChange={handleSearchCity}
                onClick={() => setIsCityDropdownOpen(true)}
                className={`${commonInputClasses} ${errors.icity ? errorInputClasses : "border-blue-300"}`}
                placeholder="Search city"
                readOnly={cities.length === 0}
              />
              {isCityDropdownOpen && cities.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-blue-500 ring-opacity-50 overflow-auto focus:outline-none sm:text-sm">
                  {filteredCities.map((city) => (
                    <div
                      key={city.icity_id}
                      className={dropdownItemClasses}
                      onClick={() => handleCitySelect(city.icity_id, city.cCity_name)}
                    >
                      {city.cCity_name}
                    </div>
                  ))}
                </div>
              )}
              {errors.icity && <p className={errorTextClasses}>{errors.icity}</p>}
            </div>

            {/* Address 1 Field */}
            <div>
              <label htmlFor="clead_address1" className={labelClasses}>
                Address 1: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="clead_address1"
                name="clead_address1"
                value={form.clead_address1}
                onChange={handleFieldChange}
                className={`${commonInputClasses} ${errors.clead_address1 ? errorInputClasses : "border-blue-300"}`}
              />
              {errors.clead_address1 && <p className={errorTextClasses}>{errors.clead_address1}</p>}
            </div>

            {/* Address 2 Field */}
            <div>
              <label htmlFor="clead_address2" className={labelClasses}>
                Address 2:
              </label>
              <input
                type="text"
                id="clead_address2"
                name="clead_address2"
                value={form.clead_address2}
                onChange={handleFieldChange}
                className={`${commonInputClasses} border-blue-300`}
              />
            </div>

            {/* Address 3 Field */}
            <div>
              <label htmlFor="clead_address3" className={labelClasses}>
                Address 3:
              </label>
              <input
                type="text"
                id="clead_address3"
                name="clead_address3"
                value={form.clead_address3}
                onChange={handleFieldChange}
                className={`${commonInputClasses} border-blue-300`}
              />
              {errors.clead_address3 && <p className={errorTextClasses}>{errors.clead_address3}</p>}
            </div>

            {/* Project Value Field */}
            <div>
              <label htmlFor="iproject_value" className={labelClasses}>
                Project Value:
              </label>
              <input
                type="number"
                id="iproject_value"
                name="iproject_value"
                value={form.iproject_value}
                onChange={handleFieldChange}
                className={`${commonInputClasses} ${errors.iproject_value ? errorInputClasses : "border-blue-300"}`}
              />
              {errors.iproject_value && <p className={errorTextClasses}>{errors.iproject_value}</p>}
            </div>

            {/* Number of Employees Field */}
            <div>
              <label htmlFor="ino_employee" className={labelClasses}>
                Number of Employees:
              </label>
              <input
                type="number"
                id="ino_employee"
                name="ino_employee"
                value={form.ino_employee}
                onChange={handleFieldChange}
                className={`${commonInputClasses} ${errors.ino_employee ? errorInputClasses : "border-blue-300"}`}
              />
              {errors.ino_employee && <p className={errorTextClasses}>{errors.ino_employee}</p>}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-blue-200 mt-6">
            <button
              type="submit"
              className="bg-blue-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 transition-colors duration-200"
            >
              <FiSave size={16} />
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-blue-200 text-blue-800 px-5 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};




const ProfileCard = () => {
  const { leadId } = useParams();
  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [selectedAssignToUser, setSelectedAssignToUser] = useState(null);
  const [selectedNotifyToUser, setSelectedNotifyToUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [assignedToList, setAssignedToList] = useState([]);
  const [isAssignedToModalOpen, setIsAssignedToModalOpen] = useState(false);
  const [showAssignConfirmation, setShowAssignConfirmation] = useState(false);

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");

   // console.log("Token from localStorage:", token);
    
    // console.log("Token", token);
    if (token) {
      try {
        const base64Payload = token.split(".")[1];
        const decodedPayload = atob(base64Payload);
        const payloadObject = JSON.parse(decodedPayload);
        return payloadObject.user_id;
      } catch (e) {
        console.error("Error decoding token:", e);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchLeadDetails = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get(`${apiEndPoint}/lead/${leadId}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
       console.log("lead details",response.data);
        setProfile(response.data);
       
      } catch (err) {
        console.error("Failed to load lead details", err);
        setError("Failed to load lead details.");
      } finally {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${apiEndPoint}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };

    if (leadId) {
      fetchLeadDetails();
      fetchUsers();
    }
  }, [leadId]);

  const handleNotifyLead = (event) => {
    const userId = event.target.value === "" ? null : event.target.value;
    setSelectedNotifyToUser(userId);
  };

  const fetchAttachments = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await axios.get(`${apiEndPoint}/lead-attachments/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetched = Array.isArray(res.data.data) ? res.data.data : [];
      setAttachments(fetched);
    } catch (err) {
      console.error("Failed to fetch attachments", err);
      setAttachments([]);
    }
  };

  const fetchAssignedToList = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${apiEndPoint}/assigned-to/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sortedList = res.data.sort(
        (a, b) => new Date(b.dcreate_dt) - new Date(a.dcreate_dt)
      );
      setAssignedToList(sortedList);
    } catch (err) {
      console.error("Failed to fetch assigned to list", err);
      setAssignedToList([]);
    }
  };

  useEffect(() => {
    fetchAttachments();
    fetchAssignedToList();
  }, [leadId]);

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditSuccess(false);
  };

  const handleSaveProfile = async (updatedFormData) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(`${apiEndPoint}/lead/${leadId}`, updatedFormData, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      setEditSuccess(true);
      setIsEditModalOpen(false);
      setProfile(updatedFormData);

      setHistory([
        {
          date: new Date().toLocaleString(),
          updatedProfile: updatedFormData,
        },
        ...history,
      ]);
    } catch (err) {
      console.error("Failed to save profile", err);
      alert("Failed to save profile.");
    }
  };

  const handleAssignButtonClick = () => {
    if (!selectedAssignToUser) {
      alert("Please select a user to assign to.");
      return;
    }
    setShowAssignConfirmation(true);
  };

  const confirmAssignment = async () => {
    setShowAssignConfirmation(false);


    const userIdToAssign = Number(selectedAssignToUser);
    const notifyUserId = selectedNotifyToUser;
    const token = localStorage.getItem("token");
    const loggedInUserId = getUserIdFromToken();

    if (!loggedInUserId) {
        alert("User not logged in or token invalid.");
        return;
    }

    if (!userIdToAssign || userIdToAssign === 0) {
        alert("Please select a valid user to assign the lead to.");
        return;
    }

    // ✅ Visually reset selection before long operations
    setSelectedAssignToUser(null);
    setSelectedNotifyToUser(null);

    try {
         axios.post(
            `${apiEndPoint}/assigned-to`,
            {
                iassigned_by: loggedInUserId,
                iassigned_to: userIdToAssign,
                ilead_id: Number(leadId),
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        const isConverted = profile?.bisConverted === true || profile?.bisConverted === 'true';
        const successMessage = isConverted ? "Deal assigned successfully." : "Lead assigned successfully.";
        alert(successMessage);

        fetchAssignedToList();

        const assignedUser = users.find(
            (user) => String(user.iUser_id) === String(userIdToAssign)
        );
        const notifiedPerson = users.find(
            (user) => String(user.iUser_id) === String(notifyUserId)
        );

        if (assignedUser && profile) {
            const mailPayload = {
                userName: assignedUser.cUser_name,
                time: new Date().toISOString(),
                leadName: profile.clead_name,
                leadURL: window.location.href,
                mailId: assignedUser.cEmail,
                assignedTo: assignedUser.cUser_name,
                notifyTo: notifiedPerson ? notifiedPerson.cEmail : null,
            };

            try {
                 axios.post(`${apiEndPoint}/assigned-to-mail`, mailPayload, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
            } catch (mailErr) {
                console.error("Failed to send notification email:", mailErr);
            }
        } else {
            console.warn(
                "Could not send notification email: Assigned user or lead profile not found."
            );
        }
    } catch (err) {
        console.error("Failed to assign lead", err);
        alert("Failed to assign lead.");
    }
 };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
      }
    },
  });

  const handleFileUpload = async () => {
    const token = localStorage.getItem("token");
    const userId = getUserIdFromToken();

    if (!userId) {
      alert("User not logged in or token invalid.");
      return;
    }

    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("attachment", selectedFile);
    formData.append("created_by", userId);
    formData.append("lead_id", Number(leadId));
    setUploading(true);

    try {
      await axios.post(`${apiEndPoint}/lead-attachments`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchAttachments();
      alert("File uploaded successfully.");
      setSelectedFile(null);
      setIsAttachmentModalOpen(false);
    } catch (err) {
      console.error("Failed to upload attachment", err);
      alert("Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!profile)
    return (
      <div className="p-4 text-gray-700">No profile found.</div>
    );

  // const latestAssignments = assignedToList.slice(0, 2);
  // const usersForNotify = users.filter(
  //   (user) => String(user.iUser_id) !== String(selectedAssignToUser)
  // );

   const latestAssignments = assignedToList.slice(0, 2);
   const activeUsers = users.filter(user => user.bactive === true);
   const usersForNotify = activeUsers.filter(
        (user) => String(user.iUser_id) !== String(selectedAssignToUser)
    );

  return (
    <>
    <div className="max-w-2xl sm:max-w-xl md:max-w-2xl lg:max-w-2xl xl:max-w-3xl mx-auto p-4 sm:p-4 md:p-4 bg-white rounded-2xl shadow-lg space-y-6 ">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <h2 className="text-sm sm:text-sm md:text-xl font-semibold text-gray-800">
          Lead Details
        </h2>
        <div className="flex items-center space-x-2 sm:space-x-3">
         
          <button
            onClick={() => setShowDetails(true)}
            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            aria-label="View Full Details"
          >
            <FiEye size={15} className="sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={handleEditProfile}
            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-md"
            aria-label="Edit Profile"
          >
            <FiEdit size={15} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
              {profile.isUpdated === true && (
  <h3 className="text-sm sm:text-sm font-bold break-words bg-green-100 rounded-xl w-[150px] p-4 text-grey-900">
Edited Profile  </h3>
)}


      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 pt-4">

        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
          <img

            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              profile.clead_name
            )}&background=random&color=fff&rounded=true`}
            alt="Profile"
            className="w-20 h-20 shadow-lg shadow-fuchsia-200 rounded-full object-cover" />
        </div>
        <div className="text-center sm:text-left mt-5">
          <h3 className="text-lg sm:text-xl font-bold break-words text-gray-900">
            {profile.clead_name || "-"}
          </h3>
          <p className="text-sm sm:text-base break-words text-gray-500">
            {profile.corganization || "-"}
          </p>
        </div>
      </div>

      <div className="text-sm sm:text-base text-gray-700 break-words space-y-3 pt-4">
        <div className="flex items-center gap-3">
          <FiPhone className="text-gray-500 break-words w-4 h-4 sm:w-5 sm:h-5" />
          <span className="break-words">{profile.iphone_no || "-"}</span>
        </div>
        <div className="flex items-center gap-3">
          <FiMail className="text-gray-500 w-4 h-4 words sm:w-5 sm:h-5" />
          <span className="break-words">{profile.cemail || "-"}</span>
        </div>
        <div className="flex items-start gap-3">
          <FiMapPin className="text-gray-500 w-4 h-4 sm:w-5 sm:h-5 mt-1" />
          <span className="break-words">{profile.clead_address1 || "-"}</span>
        </div>
        <div className="flex items-start gap-3">
          <FiMove className="text-gray-500 w-4 h-4 sm:w-5 sm:h-5 mt-1" />
          <span className="break-words">{profile.clead_address2 || "-"}</span>
        </div>
        <div className="flex items-start gap-3">
          <TbWorld className="text-gray-500 w-4 h-4 sm:w-5 sm:h-5 mt-1" />
          {profile.cwebsite ? (
            <a
              href={profile.cwebsite.startsWith("http")
                ? profile.cwebsite
                : `https://${profile.cwebsite}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {profile.cwebsite}
            </a>
          ) : (
            <span>-</span>
          )}
        </div>

        <div className="flex items-start gap-3">
          <FiCodesandbox className="text-gray-500 w-4 h-4 sm:w-5 sm:h-5 mt-1" />
          <span className="break-words">{profile.corganization || "-"}</span>
        </div>

        {profile.bactive === false && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold text-center mt-4">
            LOST LEAD
          </div>
        )}

        {(profile.website_lead === true || profile.remarks) && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl shadow-sm mt-5 text-sm text-green-800 flex flex-col gap-3">
            {profile.website_lead === true && (
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-600 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.083 9.922A6.955 6.955 0 0010 16a6.955 6.955 0 005.917-6.078 2.5 2.5 0 010-4.844A6.955 6.955 0 0010 4a6.955 6.955 0 00-5.917 6.078 2.5 2.5 0 010 4.844zM10 18a8 8 0 100-16 8 8 0 000 16zm-7.5-8a7.5 7.5 0 1015 0 7.5 7.5 0 00-15 0zM10 7a3 3 0 100 6 3 3 0 000-6z"
                    clipRule="evenodd" />
                </svg>
                <p className="font-semibold">This is a Website Lead.</p>
              </div>
            )}

            {profile.remarks && (
              <div className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-600 flex-shrink-0 mt-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-9-4a1 1 0 112 0v4a1 1 0 01-2 0V6zm1 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                    clipRule="evenodd" />
                </svg>
                <p className="font-medium break-words">
                  <span className="text-gray-700 font-semibold">Remarks:</span> {profile.remarks}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm mt-5 space-y-4">
          

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5">
            <label
              htmlFor="notifyUser"
              className="text-sm font-semibold text-gray-700 min-w-[90px]"
            >
              Notify to:
            </label>
            <div className="relative w-full sm:w-64">
              <select
                id="notifyUser"
                className="appearance-none w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm text-gray-800 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                onChange={handleNotifyLead}
                value={selectedNotifyToUser || ""}
              >
                <option value="">
                  Select User
                </option>
                {usersForNotify.map((user) => (
                  <option key={user.iUser_id} value={user.iUser_id}>
                    {user.cUser_name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                <svg
                  className="w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          {/* Assign To */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5">
            <label
              htmlFor="assignUser"
              className="text-sm font-semibold text-gray-700 min-w-[90px]"
            >
              Assign to:
            </label>
            <div className="relative w-full sm:w-64">
              <select
                id="assignUser"
                className="appearance-none w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm text-gray-800 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                onChange={(e) => setSelectedAssignToUser(e.target.value === "" ? null : e.target.value)}
                value={selectedAssignToUser || ""}
              >
                <option value="" disabled>
                  Select User
                </option>
                {activeUsers.map((user) => (
                  <option key={user.iUser_id} value={user.iUser_id}>
                    {user.cUser_name}
                  </option>
                ))}

              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                <svg
                  className="w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          
        </div>

        {/* Assign Button */}
        <div className="flex justify-center">
          <button
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!selectedAssignToUser}
            onClick={handleAssignButtonClick}
          >
            Assign Lead
          </button>
        </div>
      </div>
      {/* Assigned to me list */}
      <div className="p-4 sm:p-6 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-700">
            Lead Assigned to
          </h3>
          {assignedToList.length > 2 && (
            <button
              onClick={() => setIsAssignedToModalOpen(true)}
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              View All
            </button>
          )}
        </div>
        {latestAssignments.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No assignment history available.
          </p>
        ) : (
          <div className="space-y-3">
            {latestAssignments.map((assignment) => (
              <div
                key={assignment.iassigned_id}
                className="text-sm text-gray-800 bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
              >
                <p>
                  <span className="font-medium">Assigned To:</span>{" "}
                  {assignment.user_assigned_to_iassigned_toTouser?.cFull_name || "-"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-medium">Assigned By:</span>{" "}
                  {assignment.user_assigned_to_iassigned_byTouser?.cFull_name || "-"} on{" "}
                  {new Date(assignment.dcreate_dt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
     </div><div className="p-4 sm:p-6 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Manage Attachments
        </label>

        <button
          onClick={() => setIsAttachmentModalOpen(true)}
          className="inline-flex items-center px-4 sm:px-6 py-2 bg-blue-500 text-white text-sm font-semibold rounded-full hover:bg-blue-600 transition-colors shadow-md"
        >
          <FiUpload className="mr-2" /> Upload New File
        </button>

        <div className="mt-5 space-y-3">
          {attachments.length === 0 && (
            <p className="text-sm text-gray-500 italic">
              No attachments uploaded yet.
            </p>
          )}

          {attachments.map((file) => {
            const filePath = file?.cattechment_path;
            const filename = filePath?.split("/").pop();

            return (
              <div
                key={file.ilead_id || filename}
                className="text-sm text-gray-800 bg-white border border-gray-200 rounded-lg p-3 shadow-sm flex justify-between items-center"
              >
                <span className="font-medium truncate max-w-[70%] sm:max-w-[80%]">
                  {filename}
                </span>
                <FilePreviewer filePath={filePath} apiBaseUrl={apiNoEndPoint} />
              </div>
            );
          })}
        </div>
      </div><Dialog
        open={isAttachmentModalOpen}
        onClose={() => setIsAttachmentModalOpen(false)}
        className="relative z-50"
      >
        <div
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
          aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm sm:max-w-md bg-white p-6 rounded-2xl shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-800 mb-4">
              Upload File
            </Dialog.Title>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400 bg-gray-50"}`}
            >
              <input {...getInputProps()} />
              {selectedFile ? (
                <p className="text-sm text-gray-700 font-medium">
                  {selectedFile.name}
                </p>
              ) : (
                <>
                  <p className="text-sm text-gray-500">
                    Drag & drop a file here, or{" "}
                    <span className="text-blue-500 font-medium">
                      click to select
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">
                    Only PDF,PNG and JPEG files can be uploaded
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsAttachmentModalOpen(false);
                  setSelectedFile(null);
                } }
                className="px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleFileUpload}
                disabled={!selectedFile || uploading}
                className={`px-5 py-2 text-sm font-semibold rounded-lg text-white shadow-md ${uploading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"} transition-colors`}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog><Dialog
        open={isAssignedToModalOpen}
        onClose={() => setIsAssignedToModalOpen(false)}
        className="relative z-50"
      >
        <div
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
          aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm sm:max-w-md bg-white p-6 rounded-2xl shadow-lg max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-lg font-semibold text-gray-800 mb-4 flex justify-between items-center">
              All Assigned To History
              <button
                onClick={() => setIsAssignedToModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FiX size={20} />
              </button>
            </Dialog.Title>

            {assignedToList.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No assignment history available.
              </p>
            ) : (
              <div className="space-y-3">
                {assignedToList.map((assignment) => (
                  <div
                    key={assignment.iassigned_id}
                    className="text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-3 shadow-sm"
                  >
                    <p>
                      <span className="font-medium">Assigned To:</span>{" "}
                      {assignment.user_assigned_to_iassigned_toTouser?.cFull_name || "-"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="font-medium">Assigned By:</span>{" "}
                      {assignment.user_assigned_to_iassigned_byTouser?.cFull_name || "-"}{" "}
                      on {new Date(assignment.dcreate_dt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog><Dialog
        open={showAssignConfirmation}
        onClose={() => setShowAssignConfirmation(false)}
        className="relative z-50"
      >
        <div
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
          aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-xs bg-white p-6 rounded-2xl shadow-lg text-center">
            <Dialog.Title className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Assignment
            </Dialog.Title>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to assign this lead?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowAssignConfirmation(false)}
                className="px-5 py-2 text-sm font-semibold rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAssignment}
                className="px-5 py-2 text-sm font-semibold rounded-lg text-white bg-blue-700 hover:bg-blue-600 transition-colors"
              >
                Confirm
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
      {/* Move the following JSX inside the main return statement */}
      {editSuccess && (
        <div className="text-blue-600 bg-green-50 border border-blue-200 rounded-lg p-3 text-center text-sm mt-5">
          Profile updated successfully!
        </div>
      )}

      {isEditModalOpen && profile && (
        <EditProfileForm
          profile={profile}
          onClose={handleCloseEditModal}
          onSave={handleSaveProfile}
        />
      )}

      {showDetails && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6 md:p-8">
          <div className="bg-white p-6 sm:p-8 rounded-2xl max-w-lg sm:max-w-xl md:max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-lg relative">
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FiX size={24} />
            </button>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
              Full Profile Details
            </h3>
            <div className="space-y-4 text-sm sm:text-base text-gray-700">
              <div className="flex items-center gap-3">
                <FiPhone className="text-gray-500 w-4 h-4 sm:w-5 sm:h-5" />
                <span>
                  <span className="font-medium">Phone:</span>{" "}
                  {profile.iphone_no || "-"}
                </span>
              </div>
              <div className="flex items-center break-words gap-3">
                <FiMail className="text-gray-500 break-words w-4 h-4 sm:w-5 sm:h-5" />
                <span>
                  <span className="font-medium">Email:</span>{" "}
                  {profile.cemail || "-"}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <FiMapPin className="text-gray-500 w-4 h-4 sm:w-5 sm:h-5 mt-1" />
                <span>
                  <span className="font-medium">Address:</span>{" "}
                  {profile.clead_address1 || "-"}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <FiMove className="text-gray-500 w-4 h-4 sm:w-5 sm:h-5 mt-1" />
                <span>
                  <span className="font-medium">Address 2:</span>{" "}
                  {profile.clead_address2 || "-"}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <TbWorld className="text-gray-500 w-4 h-4 sm:w-5 sm:h-5 mt-1" />
                <span>
                  <span className="font-medium">Website:</span>{" "}
                  {profile.cwebsite || "-"}
                </span>
              </div>

              <div className="flex items-start gap-3">
                <FiCodesandbox className="text-gray-500 w-4 h-4 sm:w-5 sm:h-5 mt-1" />
                <span>
                  <span className="font-medium">Organisation:</span>{" "}
                  {profile.corganization || "-"}
                </span>{" "}
              </div>
              
              <div className="flex items-start gap-3">
                <FiDollarSign className="text-gray-500 w-4 h-4 sm:w-5 sm:h-5 mt-1" />
                <span>
                  <span className="font-medium">Project Value:</span>{" "}
                  {profile.iproject_value || "-"}
                </span>
              </div>
              {/* <div className="flex items-start gap-3">
                <TbWorld className="text-gray-500 w-4 h-4 sm:w-5 sm:h-5 mt-1" />
                <span>
                  <span className="font-medium">Potential:</span>{" "}
                  {profile.lead_potential?.clead_name || "-"}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <TbWorld className="text-gray-500 w-4 h-4 sm:w-5 sm:h-5 mt-1" />
                <span>
                  <span className="font-medium">Status:</span>{" "}
                  {profile.lead_status?.clead_name || "-"}
                </span>
              </div> */}
              <div className="flex items-start gap-3">
                <FiUser className="text-gray-500 w-4 h-4 sm:w-5 sm:h-5 mt-1" />
                <span>
                  <span className="font-medium">Employee:</span>{" "}
                  {profile.ino_employee || "-"}
                </span>
              </div>
            </div>

            {profile.website_lead === true && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl shadow-sm text-sm mt-10 text-yellow-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.344a1.5 1.5 0 012.986 0l2.376 6.07a1.5 1.5 0 01-.734 1.944l-4.136 1.84a1.5 1.5 0 01-1.944-.734l-6.07-2.376a1.5 1.5 0 01-.734-1.944l1.84-4.136a1.5 1.5 0 011.944-.734l2.376 6.07a.5.5 0 00.986-.388l-2.136-5.462a.5.5 0 00-.986.388l2.136 5.462a.5.5 0 00.388.986l5.462 2.136a.5.5 0 00.388-.986l-5.462-2.136a.5.5 0 00-.986-.388l5.462-2.136z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-7.75a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5zM10 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
                <p className="font-semibold">This lead originated from the website.</p>
              </div>
            )}
          </div>
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="text-gray-500 italic">
              </div>
            ) : (
              history.map((entry, index) => (
                <div
                  key={index}
                  className="p-3 sm:p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-100"
                >
                  <p className="font-semibold text-sm sm:text-base text-gray-700 mb-2">
                    Updated on: {entry.date}
                  </p>
                  <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                    {entry.updatedProfile?.clead_name && (
                      <div>
                        <span className="font-medium">Name:</span>{" "}
                        {entry.updatedProfile.clead_name}
                      </div>
                    )}
                    {entry.updatedProfile?.cemail && (
                      <div>
                        <span className="font-medium">Email:</span>{" "}
                        {entry.updatedProfile.cemail}
                      </div>
                    )}
                    {entry.updatedProfile?.iphone_no && (
                      <div>
                        <span className="font-medium">Phone:</span>{" "}
                        {entry.updatedProfile.iphone_no}
                      </div>
                    )}
                    {entry.updatedProfile?.caddress && (
                      <div>
                        <span className="font-medium">Address:</span>{" "}
                        {entry.updatedProfile.icity}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <DemoSessionDetails leadId={leadId} />
      </>
    
    
  )
};


export default ProfileCard;