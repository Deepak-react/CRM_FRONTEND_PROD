import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Search } from "lucide-react";
const apiEndPoint = import.meta.env.VITE_API_URL;

const LeadForm = ({ onClose }) => {
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
 iLeadpoten_id: "",
 ileadstatus_id: "",
 cindustry_id: "",
 csubindustry_id: "",
 lead_source_id: "",
 ino_employee: 0,
 iproject_value: 0,
 clead_name: "",
 cemail: "",
 corganization: "",
 cwebsite: "",
 icity: "",
 iphone_no: "",
 phone_country_code: "+91",
 cgender: 1,
 clogo: "logo.png",
 clead_address1: "",
 cwhatsapp: "",
 whatsapp_country_code: "+91",
 clead_address2: "",
 clead_address3: "",
 cstate: "",
 cdistrict: "",
 cpincode: "",
 ccountry: "",
 clead_owner: userId,
 clead_source: "",
 cresponded_by: userId,
 modified_by: userId,
 iservice_id:""
 });

 const [formLabels, setFormLabels] = useState({
 leadFormTitle: "🚀 Let's Get Started - Create a New Lead",
 section1Label: "Lead Details",
 section2Label: "Contact Information",
 section3Label: "Address Details",
 });

 const [errors, setErrors] = useState({});
 const [sameAsPhone, setSameAsPhone] = useState(false);
 const [Potential, setPotential] = useState([]);
 const [status, setStatus] = useState([]);
 const [leadIndustry, setIndustry] = useState([]);
 const [leadSubIndustry, setSubIndustry] = useState([]);
 const [cities, setCities] = useState([]);
 const [searchCity, setSearchCity] = useState("");
 const [filteredCities, setFilteredCities] = useState([]);
 const [loading, setLoading] = useState(false);
 const [source, setSource] = useState([]);
 const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
 const [isPopupVisible, setIsPopupVisible] = useState(false);
 const [popupMessage, setPopupMessage] = useState("");
 const [isAlertVisible, setIsAlertVisible] = useState(false);
 const [alertMessage, setAlertMessage] = useState("");
 
 const [searchPotential, setSearchPotential] = useState("");
 const [isPotentialDropdownOpen, setIsPotentialDropdownOpen] = useState(false);
 const [searchStatus, setSearchStatus] = useState("");
 const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
 const [searchIndustry, setSearchIndustry] = useState("");
 const [isIndustryDropdownOpen, setIsIndustryDropdownOpen] = useState(false);
 const [searchSubIndustry, setSearchSubIndustry] = useState("");
 const [isSubIndustryDropdownOpen, setIsSubIndustryDropdownOpen] = useState(false);
 const [searchSource, setSearchSource] = useState("");
 const [isSourceDropdownOpen, setIsSourceDropdownOpen] = useState(false);
 const[ searchService,setSearchService]=useState('');
 const [ isServiceDropdownOpen, setIsServiceDropdownOpen]=useState(false);
 const [countryCodes, setCountryCodes] = useState([]);
 const [searchMobileCountryCode, setSearchMobileCountryCode] = useState(form.phone_country_code);
 const [isMobileCountryCodeDropdownOpen, setIsMobileCountryCodeDropdownOpen] = useState(false);
 const [filteredMobileCountryCodes, setFilteredMobileCountryCodes] = useState([]);
 const [searchWhatsappCountryCode, setSearchWhatsappCountryCode] = useState(form.whatsapp_country_code);
 const [isWhatsappCountryCodeDropdownOpen, setIsWhatsappCountryCodeDropdownOpen] = useState(false);
 const [filteredWhatsappCountryCodes, setFilteredWhatsappCountryCodes] = useState([]);
 const [service,setService]=useState([])
 const [isSave, setIsSave] = useState(false);

 const formRef = useRef(null);
 const saveTriggerRef = useRef(false);

 const cityDropdownRef = useRef(null);
 const potentialDropdownRef = useRef(null);
 const statusDropdownRef = useRef(null);
 const industryDropdownRef = useRef(null);
 const subIndustryDropdownRef = useRef(null);
 const sourceDropdownRef = useRef(null);
 const serviceDropdownRef = useRef(null);

 const mobileCountryCodeRef = useRef(null);
 const whatsappCountryCodeRef = useRef(null);

 const fetchDropdownData = useCallback(
 async (endpoint, setter, errorMessage, transform = (data) => Array.isArray(data) ? data : []) => {
 try {
 const response = await fetch(`${apiEndPoint}/${endpoint}`, {
 method: "GET",
 headers: {
 "Content-Type": "application/json",
 Authorization: `Bearer ${token}`,
 },
 });

 if (!response.ok) {
 setter([]);
 return;
 }

 const rawData = await response.json();
 const processedData = transform(rawData);
 setter(Array.isArray(processedData) ? processedData : []);
 } catch (e) {
 console.log(`Error in fetching ${errorMessage}:`, e);
 setter([]);
 }
 },
 [token]
 );

 useEffect(() => {
 const fetchCountryCodes = async () => {
 try {
 const response = await fetch("https://restcountries.com/v3.1/all?fields=name,idd");
 if (!response.ok) {
 throw new Error("Failed to fetch country codes");
 }
 const data = await response.json();
 const codes = data
 .map((country) => {
 if (country.idd && country.idd.root && country.idd.suffixes) {
 const fullCode = `${country.idd.root}${country.idd.suffixes[0] || ""}`;
 return {
 name: country.name.common,
 code: fullCode,
 };
 }
 return null;
 })
 .filter(Boolean)
 .sort((a, b) => a.name.localeCompare(b.name));
 setCountryCodes(codes);
 setFilteredMobileCountryCodes(codes);
 setFilteredWhatsappCountryCodes(codes);
 } catch (error) {
 console.error("Error fetching country codes:", error);
 setCountryCodes([{ name: "India", code: "+91" }, { name: "USA", code: "+1" }]);
 setFilteredMobileCountryCodes([{ name: "India", code: "+91" }, { name: "USA", code: "+1" }]);
 setFilteredWhatsappCountryCodes([{ name: "India", code: "+91" }, { name: "USA", code: "+1" }]);
 }
 };
 fetchCountryCodes();
 }, []);

 useEffect(() => {
 if (countryCodes.length > 0) {
 const currentPhoneCode = form.phone_country_code;
 const currentWhatsappCode = form.whatsapp_country_code;

 if (searchMobileCountryCode !== currentPhoneCode) {
 setSearchMobileCountryCode(currentPhoneCode);
 }

 if (searchWhatsappCountryCode !== currentWhatsappCode) {
 setSearchWhatsappCountryCode(currentWhatsappCode);
 }
 }
 }, [form.phone_country_code, form.whatsapp_country_code, countryCodes, searchMobileCountryCode, searchWhatsappCountryCode]);

 // API calls for dropdown data
 useEffect(() => {
 fetchDropdownData(
 "lead-potential/company-potential", 
 setPotential, 
 "lead potential", 
 (res) => Array.isArray(res?.data) ? res.data : []
 );
 

 

 fetchDropdownData(
 "lead-status/company-lead", 
 setStatus, 
 "lead status", 
 (res) => Array.isArray(res?.response) ? res.response : []
 );
 
 fetchDropdownData(
 "lead-source/company-src", 
 setSource, 
 "lead sources", 
 (data) => Array.isArray(data?.data) ? data.data : []
 );
 //service 
 fetchDropdownData(
 "lead-service", 
 setService, 
 "service", 
 (res) => Array.isArray(res?.data) ? res.data : []
 );

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
 console.error(`Can't fetch lead industry and sub-industry. Status: ${response.status}`);
 setIndustry([]);
 setSubIndustry([]);
 return;
 }

 const rawData = await response.json();
 setIndustry(Array.isArray(rawData.response?.industry) ? rawData.response.industry : []);
 setSubIndustry(Array.isArray(rawData.response?.subindustries) ? rawData.response.subindustries : []); 
 } catch (e) {
 console.error(`Error in fetching lead industry and sub-industry:`, e);
 setIndustry([]);
 setSubIndustry([]);
 }
 };

 fetchIndustryAndSubIndustry();
 fetchCitiesData(); 
 }, [fetchDropdownData, token]);

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
 alert("Can't fetch cities, there was an error.");
 return;
 }

 const data = await response.json();
 if (data && Array.isArray(data.cities)) {
 setCities(data.cities);
 setFilteredCities(data.cities);
 } else {
 alert("Invalid city data received.");
 }
 } catch (e) {
 console.log("Error in fetching cities:", e);
 alert("Error fetching cities.");
 }
 };

 const handleSearchCity = (e) => {
 const searchTerm = e.target.value;
 setSearchCity(searchTerm);
 const filtered = Array.isArray(cities) ? cities.filter((city) =>
 city.cCity_name?.toLowerCase().includes(searchTerm.toLowerCase())
 ) : [];
 setFilteredCities(filtered);
 setIsCityDropdownOpen(true);

 if (!searchTerm) {
 setForm((prev) => ({ ...prev, icity: "" }));
 setErrors((prev) => ({ ...prev, icity: validateField("icity", "") }));
 }
 };

 useEffect(() => {
 const fetchCityDetails = async (cityId) => {
 if (cityId) {
 try {
 const response = await fetch(`${apiEndPoint}/city/${cityId}`, {
 method: "GET",
 headers: {
 "Content-Type": "application/json",
 Authorization: `Bearer ${token}`,
 },
 });

 if (!response.ok) {
 setForm((prev) => ({
 ...prev,
 cstate: "",
 cdistrict: "",
 ccountry: "",
 cpincode: "",
 }));
 return;
 }

 const data = await response.json();
 if (data) {
 setForm((prev) => ({
 ...prev,
 cstate: data.state || "",
 cdistrict: data.district || "",
 ccountry: data.country || "",
 cpincode: data.cpincode || "",
 }));
 }
 } catch (error) {
 console.error("Error fetching city details:", error);
 setForm((prev) => ({
 ...prev,
 cstate: "",
 cdistrict: "",
 ccountry: "",
 cpincode: "",
 }));
 }
 }
 };

 if (form.icity) {
 fetchCityDetails(form.icity);
 const selectedCity = Array.isArray(cities) ? cities.find((city) => city.icity_id === form.icity) : null;
 setSearchCity(selectedCity ? selectedCity.cCity_name : "");
 } else {
 setForm((prev) => ({
 ...prev,
 cstate: "",
 cdistrict: "",
 ccountry: "",
 cpincode: "",
 }));
 setSearchCity("");
 }
 }, [form.icity, token, cities]);

 useEffect(() => {
 const fetchFormLabels = async () => {
 try {
 const res = await fetch(`${apiEndPoint}/lead-form-label`, {
 method: "GET",
 headers: {
 "Content-Type": "application/json",
 Authorization: `Bearer ${token}`,
 },
 });

 const data = await res.json();

 if (data?.Message) {
 setFormLabels({
 leadFormTitle: data.Message.leadFormTitle || "🚀 Let's Get Started - Create a New Lead",
 section1Label: data.Message.section1Label || "Lead Details",
 section2Label: data.Message.section2Label || "Contact Information",
 section3Label: data.Message.section3Label || "Address Details",
 });
 }
 } catch (err) {
 console.error("Failed to load lead form labels", err);
 }
 };

 if (token && company_id) {
 fetchFormLabels();
 }
 }, [token, company_id]);

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
 if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target)) {
 setIsServiceDropdownOpen(false);
 }
 if (mobileCountryCodeRef.current && !mobileCountryCodeRef.current.contains(event.target)) {
 setIsMobileCountryCodeDropdownOpen(false);
 }
 if (whatsappCountryCodeRef.current && !whatsappCountryCodeRef.current.contains(event.target)) {
 setIsWhatsappCountryCodeDropdownOpen(false);
 }
 };

 document.addEventListener("mousedown", handleClickOutside);
 return () => {
 document.removeEventListener("mousedown", handleClickOutside);
 };
 }, []);

 const validateField = (name, value) => {
 let error = "";
 if (
 (name === "iphone_no" || name === "cwhatsapp") &&
 value &&
 !/^\d{10}$/.test(value)
 ) {
 error = "Must be exactly 10 digits";
 }
 if (name === "cemail") {
 const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
 if (value && !emailRegex.test(value)) {
 error = "Invalid email format";
 }
 else if (value.length > 50) {
 error = "Lead Name cannot exceed 50 characters";
 }
 }
 if (name === "cpincode" && value && !/^\d{6}$/.test(value)) {
 error = "Upto 6-digit pincode allowed";
 }
 if (name === "clead_name") {
 if (!value) {
 error = "Lead Name is required";
 } else if (!/^[A-Za-z\s]+$/.test(value)) {
 error = "Lead Name can only contain letters and spaces";
 } else if (value.length > 20) {
 error = "Lead Name cannot exceed 20 characters";
 }
 }
 if (name === "clead_address1") {
 if (!value) {
 error = "Lead Address is required";
 } else if (value.length > 150) {
 error = "Lead Address cannot exceed 150 characters";
 }
 }
 if (name === "clead_address2") {
 if (value.length > 150) {
 error = "Lead Address cannot exceed 150 characters";
 }
 }
 if (name === "clead_address3") {
 if (value.length > 150) {
 error = "Lead Address cannot exceed 150 characters";
 }
 }
 if (name === "cwebsite") {
 const urlRegex = /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})$/i;
 if (value && !urlRegex.test(value)) {
 error = "Invalid website URL format";
 }
 }

 if (name === "corganization") {
 if (!value) {
 error = "Organization Name is required";
 } else if (!/^[A-Za-z\s]+$/.test(value)) {
 error = "Organization Name can only contain letters and spaces";
 } else if (value.length > 70) {
 error = "Organization Name cannot exceed 70 characters";
 }
 }
 

 if (name === "iphone_no" && !value) {
 error = "Mobile Number is required";
 }
 if (name === "clead_address1" && !value) {
 error = "Address Line 1 is required";
 }
 if (name === "icity" && !value) {
 error = "City is required";
 }
 if (name === "iLeadpoten_id" && !value) {
 error = "Lead Potential is required";
 }
 if (name === "iservice_id" && !value) {
 error = "service is required";
 }
 if (name === "ileadstatus_id" && !value) {
 error = "Lead Status is required";
 }
 if (name === "cindustry_id" && !value) {
 error = "Industry is required";
 }
 if (name === "lead_source_id" && !value) {
 error = "Lead Source is required";
 }
 if (name === "ino_employee") {
 const num = Number(value);
 if (value !== "" && (isNaN(num) || !Number.isInteger(num))) {
 error = "Must be a valid whole number";
 } else if (value !== "" && num <= 0) {
 error = "Number must be greater than 0";
 } else if (value !== "" && num > 999999) {
 error = "Number must be less than 1 million";
 }
 }

 if (name === "iproject_value") {
 const amount = parseFloat(value);
 if (value !== "" && isNaN(amount)) {
 error = "Must be a valid number";
 } else if (value !== "" && amount < 0) {
 error = "Value cannot be negative";
 } else if (value !== "" && !/^\d+(\.\d{1,2})?$/.test(value)) {
 error = "Only up to 2 decimal places allowed";
 } else if (value !== "" && amount > 1000000000) {
 error = "Value must be less than 1 billion";
 }
 }

 return error;
 };

 const handleChange = (e) => {
 const { name, value } = e.target;

 if (name === "searchMobileCountryCode") {
 setSearchMobileCountryCode(value);
 const filtered = Array.isArray(countryCodes) ? countryCodes.filter(cc =>
 cc.code?.toLowerCase().includes(value.toLowerCase()) ||
 cc.name?.toLowerCase().includes(value.toLowerCase())
 ) : [];
 setFilteredMobileCountryCodes(filtered);
 setIsMobileCountryCodeDropdownOpen(true);
 } else if (name === "searchWhatsappCountryCode") {
 setSearchWhatsappCountryCode(value);
 const filtered = Array.isArray(countryCodes) ? countryCodes.filter(cc =>
 cc.code?.toLowerCase().includes(value.toLowerCase()) ||
 cc.name?.toLowerCase().includes(value.toLowerCase())
 ) : [];
 setFilteredWhatsappCountryCodes(filtered);
 setIsWhatsappCountryCodeDropdownOpen(true);
 } else if (name === "ino_employee" || name === "iproject_value") { 
 setForm((prev) => ({
 ...prev,
 [name]: value === "" ? "" : Number(value) 
 }));
 setErrors((prev) => ({
 ...prev,
 [name]: validateField(name, value),
 }));
 }
 else {
 setForm((prev) => {
 const updated = { ...prev, [name]: value };

 if (name === "iphone_no" && sameAsPhone) {
 updated.cwhatsapp = value;
 setErrors((prevErr) => ({
 ...prevErr,
 cwhatsapp: validateField("cwhatsapp", value),
 }));
 }
 if (name === "phone_country_code" && sameAsPhone) {
 updated.whatsapp_country_code = value;
 setSearchWhatsappCountryCode(value);
 }

 if (name === "cindustry_id" && prev.cindustry_id !== value) {
 updated.csubindustry_id = "";
 setSearchSubIndustry("");
 }

 return updated;
 });

 setErrors((prev) => ({
 ...prev,
 [name]: validateField(name, value),
 }));
 }

 if (name === "searchCity") {
 handleSearchCity(e);
 } else if (name === "searchPotential") {
 setSearchPotential(value);
 setIsPotentialDropdownOpen(true);
 if (!value) {
 setForm((prev) => ({ ...prev, iLeadpoten_id: "" }));
 setErrors((prev) => ({ ...prev, iLeadpoten_id: validateField("iLeadpoten_id", "") }));
 }
 } else if (name === "searchStatus") {
 setSearchStatus(value);
 setIsStatusDropdownOpen(true);
 if (!value) {
 setForm((prev) => ({ ...prev, ileadstatus_id: "" }));
 setErrors((prev) => ({ ...prev, ileadstatus_id: validateField("ileadstatus_id", "") }));
 }
 } else if (name === "searchIndustry") {
 setSearchIndustry(value);
 setIsIndustryDropdownOpen(true);
 if (!value) {
 setForm((prev) => ({ ...prev, cindustry_id: "" }));
 setErrors((prev) => ({ ...prev, cindustry_id: validateField("cindustry_id", "") }));
 }
 } else if (name === "searchSubIndustry") {
 setSearchSubIndustry(value);
 setIsSubIndustryDropdownOpen(true);
 }
 else if (name === "searchSource") {
 setSearchSource(value);
 setIsSourceDropdownOpen(true);
 if (!value) {
 setForm((prev) => ({ ...prev, lead_source_id: "" }));
 setErrors((prev) => ({ ...prev, lead_source_id: validateField("lead_source_id", "") }));
 }
 }
 else if (name === "searchService") {
 setSearchService(value);
 setIsServiceDropdownOpen(true);
 if (!value) {
 setForm((prev) => ({ ...prev, iservice_id: "" }));
 setErrors((prev) => ({ ...prev, iservice_id: validateField("iservice_id", "") }));
 }
 }
 };

 const handleSelectDropdownItem = (
 fieldName,
 itemId,
 itemName,
 setSearchTerm,
 setIsDropdownOpen
 ) => {
 setForm((prev) => ({ ...prev, [fieldName]: itemId }));
 setSearchTerm(itemName);
 setIsDropdownOpen(false);
 setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
 };

 const handleSelectCountryCode = (type, codeToSet, codeToDisplay) => {
 const countryCodeFieldName = type === "phone" ? "phone_country_code" : "whatsapp_country_code";

 setForm((prev) => ({ ...prev, [countryCodeFieldName]: codeToSet }));

 if (type === "phone") {
 setSearchMobileCountryCode(codeToDisplay);
 setIsMobileCountryCodeDropdownOpen(false);
 if (sameAsPhone) {
 setForm((prev) => ({ ...prev, whatsapp_country_code: codeToSet }));
 setSearchWhatsappCountryCode(codeToDisplay);
 }
 } else if (type === "whatsapp") {
 setSearchWhatsappCountryCode(codeToDisplay);
 setIsWhatsappCountryCodeDropdownOpen(false);
 }
 setErrors((prev) => ({ ...prev, [countryCodeFieldName]: undefined }));
 };

 const checkExisting = async (fieldName, value) => {
 if (!value || (fieldName !== "cemail" && !/^\d{10}$/.test(value))) return;
 if (fieldName === "cemail" && value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return;

 try {
 const response = await fetch(`${apiEndPoint}/check-existing-lead`, {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 Authorization: `Bearer ${token}`,
 },
 body: JSON.stringify({
 field: fieldName,
 value: value,
 company_id: company_id,
 }),
 });

 if (!response.ok) {
 return;
 }

 const data = await response.json();
 if (data.exists) {
 const message = `This ${fieldName
 .replace("iphone_no", "phone")
 .replace("cwhatsapp", "WhatsApp")
 .replace("cemail", "email")} already exists.`;
 setAlertMessage(message);
 setIsAlertVisible(true);
 setTimeout(() => {
 setIsAlertVisible(false);
 }, 10000);
 setErrors((prev) => ({ ...prev, [fieldName]: message }));
 } else {
 setErrors((prev) => {
 const newErrors = { ...prev };
 if (newErrors[fieldName]?.includes("already exists")) {
 newErrors[fieldName] = undefined;
 }
 newErrors[fieldName] = validateField(fieldName, value) || newErrors[fieldName];
 return newErrors;
 });
 }
 } catch (error) {
 console.error(`Error checking existing ${fieldName}:`, error);
 }
 };
 

 const handleBlur = (e) => {
 const { name, value } = e.target;
 if (name === "searchMobileCountryCode") {
 if (!Array.isArray(countryCodes) || !countryCodes.some(cc => cc.code === value)) {
 setSearchMobileCountryCode(form.phone_country_code || "+91");
 }
 setIsMobileCountryCodeDropdownOpen(false);
 } else if (name === "searchWhatsappCountryCode") {
 if (!Array.isArray(countryCodes) || !countryCodes.some(cc => cc.code === value)) {
 setSearchWhatsappCountryCode(form.whatsapp_country_code || "+91");
 }
 setIsWhatsappCountryCodeDropdownOpen(false);
 } else if (name === "searchIndustry") {
 const selectedIndustry = Array.isArray(leadIndustry) ? leadIndustry.find(ind => ind.iindustry_id === form.cindustry_id) : null;
 if (!selectedIndustry || selectedIndustry.cindustry_name !== value) {
 setSearchIndustry(selectedIndustry ? selectedIndustry.cindustry_name : "");
 setForm((prev) => ({ ...prev, cindustry_id: selectedIndustry ? selectedIndustry.iindustry_id : "" }));
 }
 setIsIndustryDropdownOpen(false);
 } else if (name === "searchSubIndustry") {
 const selectedSubIndustry = Array.isArray(leadSubIndustry) ? leadSubIndustry.find(subInd => subInd.isubindustry === form.csubindustry_id) : null; 
 if (!selectedSubIndustry || selectedSubIndustry.subindustry_name !== value) {
 setSearchSubIndustry(selectedSubIndustry ? selectedSubIndustry.subindustry_name : "");
 setForm((prev) => ({ ...prev, csubindustry_id: selectedSubIndustry ? selectedSubIndustry.isubindustry : "" })); 
 }
 setIsSubIndustryDropdownOpen(false);
 } else if (name === "searchPotential") {
 const selectedPotential = Array.isArray(Potential) ? Potential.find(pot => pot.ileadpoten_id === form.iLeadpoten_id) : null;
 if (!selectedPotential || selectedPotential.clead_name !== value) {
 setSearchPotential(selectedPotential ? selectedPotential.clead_name : "");
 setForm((prev) => ({ ...prev, iLeadpoten_id: selectedPotential ? selectedPotential.ileadpoten_id : "" }));
 }
 setIsPotentialDropdownOpen(false);
 } else if (name === "searchStatus") {
 const selectedStatus = Array.isArray(status) ? status.find(stat => stat.ilead_status_id === form.ileadstatus_id) : null;
 if (!selectedStatus || selectedStatus.clead_name !== value) {
 setSearchStatus(selectedStatus ? selectedStatus.clead_name : "");
 setForm((prev) => ({ ...prev, ileadstatus_id: selectedStatus ? selectedStatus.ilead_status_id : "" }));
 }
 setIsStatusDropdownOpen(false);
 } else if (name === "searchSource") {
 const selectedSource = Array.isArray(source) ? source.find(src => src.source_id === form.lead_source_id) : null;
 if (!selectedSource || selectedSource.source_name !== value) {
 setSearchSource(selectedSource ? selectedSource.source_name : "");
 setForm((prev) => ({ ...prev, lead_source_id: selectedSource ? selectedSource.source_id : "" }));
 }
 setIsSourceDropdownOpen(false);
 }
 else if (name === "searchService") {
 const selectedService = Array.isArray(service) ? service.find(service => service.iservice_id === form.iservice_id) : null;
 if (!selectedService || selectedService.source_name !== value) {
 setSearchService(selectedService ? selectedService.cservice_name : "");
 setForm((prev) => ({ ...prev, iservice_id: selectedService ? selectedService.iservice_id : "" }));
 }
 setIsServiceDropdownOpen(false);
 }

 if (name === "iphone_no" || name === "cwhatsapp" || name === "cemail") {
 checkExisting(name, value);
 }
 setErrors((prev) => ({
 ...prev,
 [name]: validateField(name, value),
 }));
 };

 const toggleSame = (e) => {
 const checked = e.target.checked;
 setSameAsPhone(checked);
 if (checked) {
 setForm((prev) => {
 const newWhatsapp = prev.iphone_no;
 const newWhatsappCountryCode = prev.phone_country_code;
 setErrors((prevErr) => ({
 ...prevErr,
 cwhatsapp: validateField("cwhatsapp", newWhatsapp),
 }));
 
 setSearchWhatsappCountryCode(newWhatsappCountryCode);
 return {
 ...prev,
 cwhatsapp: newWhatsapp,
 whatsapp_country_code: newWhatsappCountryCode,
 };
 });
 if (errors.iphone_no && !errors.cwhatsapp) {
 setErrors((prev) => ({ ...prev, cwhatsapp: errors.iphone_no }));
 } else if (
 !errors.iphone_no &&
 errors.cwhatsapp === `This whatsapp number already exists.`
 ) {
 setErrors((prev) => ({ ...prev, cwhatsapp: undefined }));
 }
 } else {
 setForm((prev) => ({ ...prev, cwhatsapp: "", whatsapp_country_code: "" }));
 setSearchWhatsappCountryCode(""); 
 setErrors((prev) => ({ ...prev, cwhatsapp: undefined }));
 }
 };

 const validateForm = () => {
 const newErrors = {};
 Object.keys(form).forEach((key) => {
 if (!["cstate", "cdistrict", "ccountry", "clogo", "cgender", "clead_owner", "cresponded_by", "modified_by", "clead_source", "phone_country_code", "whatsapp_country_code", "csubindustry_id", "ino_employee", "iproject_value"].includes(key)) {
 const error = validateField(key, form[key]);
 if (error) {
 newErrors[key] = error;
 }
 }
 });

 if (!form.clead_name) newErrors.clead_name = "Lead Name is required";
 if (form.clead_name && !/^[A-Za-z\s]+$/.test(form.clead_name)) {
 newErrors.clead_name = "Lead Name can only contain letters and spaces";
 }
 if (!form.corganization) newErrors.corganization = "Organization Name is required";
 if (form.cwebsite && !/^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})$/i.test(form.cwebsite)) {
 newErrors.cwebsite = "Invalid website URL format";
 }
 if (!form.iphone_no) newErrors.iphone_no = "Mobile Number is required";
 if (!form.clead_address1) newErrors.clead_address1 = "Address Line 1 is required";
 if (!form.icity) newErrors.icity = "City is required";

 if (!form.iLeadpoten_id) newErrors.iLeadpoten_id = "Lead Potential is required";
 if (!form.ileadstatus_id) newErrors.ileadstatus_id = "Lead Status is required";
 if (!form.cindustry_id) newErrors.cindustry_id = "Industry is required";
 if (!form.lead_source_id) newErrors.lead_source_id = "Lead Source is required";

 return { ...errors, ...newErrors };
 };

 const [backendError, setBackendError] = useState("");
 const handleSubmit = async (e) => {
 e.preventDefault();
 setLoading(true);

 const validationErrors = validateForm();
 setErrors(validationErrors);

 const hasErrors = Object.keys(validationErrors).some((key) => validationErrors[key]);

 if (hasErrors) {
 const combinedErrorMessages = Object.values(validationErrors).filter(Boolean).join(", ");
 setAlertMessage(`Please correct the following errors: ${combinedErrorMessages}`);
 setIsAlertVisible(true);
 setTimeout(() => {
 setIsAlertVisible(false);
 }, 10000);
 setLoading(false);
 return;
 }

 try {
 console.log("Form data before submission:", form); // Debug log

 const formData = {
 bactive: true,
 cemail: form.cemail,
 cgender: 1,
 cimage: "noimg.png",
 clead_address1: form.clead_address1,
 clead_address2: form.clead_address2,
 clead_address3: form.clead_address3,
 clead_city: Number(form.icity),
 clead_name: form.clead_name,
 clead_owner: userId,
 clogo: "logo.png",
 corganization: form.corganization,
 cresponded_by: userId,
 ileadstatus_id: Number(form.ileadstatus_id),
 cindustry_id: Number(form.cindustry_id),
 isubindustry: form.csubindustry_id ? Number(form.csubindustry_id) : null,
 iLeadpoten_id: Number(form.iLeadpoten_id),
 cwebsite: form.cwebsite,
 dmodified_dt: new Date().toISOString(),
 ino_employee: form.ino_employee === "" ? 0 : Number(form.ino_employee),
 icity: Number(form.icity),
 icompany_id: company_id,
 iphone_no: `${form.phone_country_code}${form.iphone_no}`,
 iproject_value: form.iproject_value === "" ? 0 : Number(form.iproject_value),
 modified_by: userId,
 iuser_tags: userId,
 iservice_id:form.iservice_id,
 lead_source_id: Number(form.lead_source_id),
 whatsapp_number: `${form.whatsapp_country_code}${form.cwhatsapp}`,
 };

 if (saveTriggerRef.current) {
 formData.save = true;
 saveTriggerRef.current = false;
 }

 const res = await fetch(`${apiEndPoint}/lead`, {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 Authorization: `Bearer ${token}`,
 },
 body: JSON.stringify(formData),
 });

 const resData = await res.json();

 if (res.ok) {
 setPopupMessage("Lead created successfully!");
 setIsPopupVisible(true);

 setTimeout(() => {
 setIsPopupVisible(false);
 onClose();
 }, 3000);
 } else {
 const errorMessage =
 resData.details ||
 resData.message ||
 resData.error ||
 "Failed to create lead.";

 setPopupMessage(errorMessage);
 setIsPopupVisible(true);
 setTimeout(() => {
 setIsPopupVisible(false);
 }, 10000);
 }
 } catch (error) {
 console.error("Submit error:", error);
 setPopupMessage("Failed to create lead due to an error.");
 setIsPopupVisible(true);
 setTimeout(() => {
 setIsPopupVisible(false);
 }, 3000);
 } finally {
 setLoading(false);
 }
 };

 const filteredPotential = Array.isArray(Potential) 
 ? Potential.filter((item) =>
 item.clead_name?.toLowerCase().includes(searchPotential.toLowerCase())
 )
 : [];

 const filteredStatus = Array.isArray(status) 
 ? status.filter((item) =>
 item.clead_name?.toLowerCase().includes(searchStatus.toLowerCase())
 )
 : [];

 const filteredIndustry = Array.isArray(leadIndustry) 
 ? leadIndustry.filter((item) =>
 item.cindustry_name?.toLowerCase().includes(searchIndustry.toLowerCase())
 )
 : [];

 const filteredSubIndustry = Array.isArray(leadSubIndustry) && form.cindustry_id
 ? leadSubIndustry.filter((item) =>
 item.iindustry_parent === Number(form.cindustry_id) &&
 item.subindustry_name?.toLowerCase().includes(searchSubIndustry.toLowerCase())
 )
 : [];

 const filteredSource = Array.isArray(source) 
 ? source.filter((item) =>
 item.source_name?.toLowerCase().includes(searchSource.toLowerCase())
 )
 : [];
 const filterService = Array.isArray(service) 
 ? service.filter((item) =>
 item.cservice_name?.toLowerCase().includes(searchService.toLowerCase())
 )
 : [];

 const EmptyDropdownMessage = ({ type }) => {
 const messages = {
 potential: "No lead potentials found. Please create potentials in the master section.",
 status: "No lead statuses found. Please create statuses in the master section.",
 industry: "No industries found. Please create industries in the master section.",
 subindustry: form.cindustry_id 
 ? "No sub-industries found for this industry. Please create sub-industries in the master section."
 : "Please select an industry first",
 source: "No lead sources found. Please create sources in the master section.",
 city: "No cities found. Please create cities in the master section.",
 default: "Data not available. Please check your connection or contact support."
 };

 return (
 <div className="px-4 py-2 text-sm text-gray-500 italic">
 {messages[type] || messages.default}
 </div>
 );
 };

 const popupStyle = {
 position: "fixed",
 bottom: "20px",
 left: "50%",
 transform: "translateX(-50%)",
 backgroundColor:
 popupMessage.includes("Failed") || popupMessage.includes("Duplicate") ? "#dc3545" : "#28a745",
 color: "white",
 padding: "16px 24px",
 borderRadius: "8px",
 boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
 zIndex: 50,
 opacity: 1,
 transition: "opacity 0.3s ease-in-out",
 display: "flex",
 alignItems: "center",
 justifyContent: "space-between",
 };

 const closeButtonStyle = {
 background: "none",
 border: "none",
 color: "white",
 fontSize: "1em",
 cursor: "pointer",
 marginLeft: "16px",
 };

 const alertStyle = {
 position: "fixed",
 top: "20px",
 left: "50%",
 transform: "translateX(-50%)",
 backgroundColor: "#f8d7da",
 color: "#721c24",
 padding: "16px 24px",
 borderRadius: "8px",
 boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
 zIndex: 50,
 opacity: 1,
 transition: "opacity 0.3s ease-in-out",
 textAlign: "center",
 };

 const buttonStyle = {
 padding: "8px 16px",
 border: "none",
 borderRadius: "4px",
 cursor: "pointer",
 fontWeight: "bold",
 };

 const basicLeadFields = [
 { label: "Lead Name", name: "clead_name", required: true },
 { label: "Organization Name", name: "corganization", required: true },
 { label: "Website", name: "cwebsite", required: false },
 ];

 const contactInfoFields = [
 { label: "E-mail ID", name: "cemail", required: false },
 { label: "Mobile Number", name: "iphone_no", required: true, type: "phone" },
 { label: "WhatsApp Number", name: "cwhatsapp", required: false, type: "whatsapp" },
 ];

 const addressDetailsFields = [
 { label: "Address Line 1", name: "clead_address1", required: true },
 { label: "Address Line 2", name: "clead_address2", required: false },
 { label: "Address Line 3", name: "clead_address3", required: false },
 { label: "City", name: "icity", type: "searchable-select-city", required: true },
 { label: "Country", name: "ccountry", value: form.ccountry, readOnly: true },
 { label: "State", name: "cstate", value: form.cstate, readOnly: true },
 { label: "District", name: "cdistrict", value: form.cdistrict, readOnly: true },
 { label: "Pincode", name: "cpincode", required: false },
 ];

 return (
 <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-start pt-10 z-50 overflow-y-auto hide-scrollbar px-8">
 <form
 ref={formRef}
 onSubmit={handleSubmit}
 className="relative bg-white w-[95%] max-w-[1060px] rounded-2xl shadow-3xl p-6 space-y-6"
 >
 <button
 type="button"
 onClick={onClose}
 className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
 >
 <X size={24} />
 </button>

 <h2 className="text-2xl font-bold text-center">
 {formLabels.leadFormTitle}
 </h2>

 <h3 className="text-lg font-semibold mt-6">{formLabels.section1Label}</h3>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {basicLeadFields.map(({ label, name, required, value, readOnly }) => (
 <div key={name}>
 <label className="text-sm font-medium">
 {label} {required && <span className="text-red-500">*</span>}
 </label>
 <input
 type="text"
 name={name}
 value={value !== undefined ? value : form[name]}
 onChange={handleChange}
 onBlur={handleBlur}
 placeholder={`Enter ${label.toLowerCase()}`}
 className="mt-1 w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
 readOnly={readOnly}
 />
 {errors[name] && (
 <p className="text-red-600 text-sm">{errors[name]}</p>
 )}
 </div>
 ))}
 {[
 {
 label: "Lead Potential",
 ref: potentialDropdownRef,
 inputName: "searchPotential",
 searchValue: searchPotential,
 setSearch: setSearchPotential,
 open: isPotentialDropdownOpen,
 setOpen: setIsPotentialDropdownOpen,
 list: filteredPotential,
 keyField: "ileadpoten_id",
 displayField: "clead_name",
 formField: "iLeadpoten_id",
 error: errors.iLeadpoten_id,
 required: true,
 emptyType: "potential"
 },
 {
 label: "Lead Status",
 ref: statusDropdownRef,
 inputName: "searchStatus",
 searchValue: searchStatus,
 setSearch: setSearchStatus,
 open: isStatusDropdownOpen,
 setOpen: setIsStatusDropdownOpen,
 list: filteredStatus,
 keyField: "ilead_status_id",
 displayField: "clead_name",
 formField: "ileadstatus_id",
 error: errors.ileadstatus_id,
 required: true,
 emptyType: "status"
 },
 {
 label: "Industry",
 ref: industryDropdownRef,
 inputName: "searchIndustry",
 searchValue: searchIndustry,
 setSearch: setSearchIndustry,
 open: isIndustryDropdownOpen,
 setOpen: setIsIndustryDropdownOpen,
 list: filteredIndustry,
 keyField: "iindustry_id",
 displayField: "cindustry_name",
 formField: "cindustry_id",
 error: errors.cindustry_id,
 required: true,
 emptyType: "industry"
 },
 {
 label: "Sub-Industry",
 ref: subIndustryDropdownRef,
 inputName: "searchSubIndustry",
 searchValue: searchSubIndustry,
 setSearch: setSearchSubIndustry,
 open: isSubIndustryDropdownOpen,
 setOpen: setIsSubIndustryDropdownOpen,
 list: filteredSubIndustry,
 keyField: "isubindustry",
 displayField: "subindustry_name",
 formField: "csubindustry_id",
 error: errors.csubindustry_id,
 disabled: !form.cindustry_id,
 required: false,
 emptyType: "subindustry"
 },
 {
 label: "Lead Source",
 ref: sourceDropdownRef,
 inputName: "searchSource",
 searchValue: searchSource,
 setSearch: setSearchSource,
 open: isSourceDropdownOpen,
 setOpen: setIsSourceDropdownOpen,
 list: filteredSource,
 keyField: "source_id",
 displayField: "source_name",
 formField: "lead_source_id",
 error: errors.lead_source_id,
 required: true,
 emptyType: "source"
 },
 {
 label: "Lead Service",
 ref: serviceDropdownRef,
 inputName: "searchService",
 searchValue: searchService,
 setSearch: setSearchService, // Changed from setService to setSearchService
 open: isServiceDropdownOpen,
 setOpen: setIsServiceDropdownOpen,
 list: filterService,
 keyField: "iservice_id",
 displayField: "cservice_name",
 formField: "iservice_id",
 error: errors.iservice_id,
 required: true,
 emptyType: "service"
}
 ].map(
 ({
 label,
 ref,
 inputName,
 searchValue,
 setSearch,
 open,
 setOpen,
 list,
 keyField,
 displayField,
 formField,
 error,
 disabled = false,
 required = false,
 emptyType
 }) => (
 <div className="flex flex-col relative" key={formField} ref={ref}>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 {label}
 {required && <span className="text-red-500">*</span>}
 </label>
 <input
 type="text"
 placeholder={`Search ${label.toLowerCase()}...`}
 className={`w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none ${
 disabled ? "bg-gray-100 cursor-not-allowed" : ""
 }`}
 value={searchValue}
 onChange={(e) => handleChange({ target: { name: inputName, value: e.target.value } })}
 onFocus={() => !disabled && setOpen(true)}
 disabled={disabled}
 />
 {open && (
 <div className="absolute z-10 top-full mt-1 w-full bg-white border rounded shadow-md max-h-40 overflow-y-auto">
 {Array.isArray(list) && list.length > 0 ? (
 list.map((item) => (
 <div
 key={item[keyField]}
 onMouseDown={(e) => e.preventDefault()}
 onClick={() =>
 handleSelectDropdownItem(
 formField,
 item[keyField],
 item[displayField],
 setSearch,
 setOpen
 )
 }
 className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
 >
 {item[displayField]}
 </div>
 ))
 ) : (
 <EmptyDropdownMessage type={emptyType} />
 )}
 </div>
 )}
 {error && <p className="text-red-600 text-sm">{error}</p>}
 </div>
 )
 )}
 <div>
 <label className="text-sm font-medium">No. of employees</label>
 <input
 type="number"
 name="ino_employee"
 value={form.ino_employee === 0 ? "" : form.ino_employee}
 onChange={handleChange}
 onBlur={handleBlur}
 placeholder="Enter number of employees"
 className="mt-1 w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
 min="0"
 />
 {errors.ino_employee && (
 <p className="text-red-600 text-sm">{errors.ino_employee}</p>
 )}
 </div>
 <div>
 <label className="text-sm font-medium">Project Value</label>
 <input
 type="number"
 name="iproject_value"
 value={form.iproject_value === 0 ? "" : form.iproject_value}
 onChange={handleChange}
 onBlur={handleBlur}
 placeholder="Enter project value"
 className="mt-1 w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
 min="0"
 />
 {errors.iproject_value && (
 <p className="text-red-600 text-sm">{errors.iproject_value}</p>
 )}
 </div>
 </div>

 <hr className="my-6 " />

 <h3 className="text-lg font-semibold mt-6">{formLabels.section2Label}</h3>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {contactInfoFields.map(({ label, name, required, type, value, readOnly }) => {
 if (type === "phone" || type === "whatsapp") {
 const numberFieldName = type === "phone" ? "iphone_no" : "cwhatsapp";
 const searchCountryCodeState = type === "phone" ? searchMobileCountryCode : searchWhatsappCountryCode;
 const isDropdownOpen = type === "phone" ? isMobileCountryCodeDropdownOpen : isWhatsappCountryCodeDropdownOpen;
 const setIsDropdownOpen = type === "phone" ? setIsMobileCountryCodeDropdownOpen : setIsWhatsappCountryCodeDropdownOpen;
 const filteredCodes = type === "phone" ? filteredMobileCountryCodes : filteredWhatsappCountryCodes;
 const dropdownRef = type === "phone" ? mobileCountryCodeRef : whatsappCountryCodeRef;
 const searchInputName = type === "phone" ? "searchMobileCountryCode" : "searchWhatsappCountryCode";

 return (
 <div key={name}>
 <label className="text-sm font-medium">
 {label} {required && <span className="text-red-500">*</span>}
 </label>
 <div className="flex mt-1">
 <div className="relative" ref={dropdownRef}>
 <input
 type="text"
 name={searchInputName}
 value={searchCountryCodeState}
 onChange={handleChange}
 onFocus={() => setIsDropdownOpen(true)}
 onBlur={handleBlur}
 placeholder="+XXX"
 className="border px-2 py-2 rounded-l-md focus:ring-2 focus:ring-blue-500 outline-none w-[100px] flex-none"
 disabled={name === "cwhatsapp" && sameAsPhone}
 />
 {isDropdownOpen && (
 <div className="absolute z-10 top-full mt-1 bg-white border rounded shadow-md max-h-40 overflow-y-auto min-w-[250px] w-max">
 {Array.isArray(filteredCodes) && filteredCodes.length > 0 ? (
 filteredCodes.map((cc) => (
 <div
 key={cc.code}
 onMouseDown={(e) => e.preventDefault()}
 onClick={() => {
 handleSelectCountryCode(type, cc.code, cc.code);
 }}
 className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
 >
 {cc.code} ({cc.name})
 </div>
 ))
 ) : (
 <EmptyDropdownMessage type="country" />
 )}
 </div>
 )}
 </div>
 <input
 type="text"
 name={numberFieldName}
 value={form[numberFieldName]}
 onChange={handleChange}
 onBlur={handleBlur}
 placeholder={`Enter ${label.toLowerCase()}`}
 className="flex-1 border px-3 py-2 rounded-r-md focus:ring-2 focus:ring-blue-500 outline-none"
 disabled={name === "cwhatsapp" && sameAsPhone}
 />
 </div>
 {errors[numberFieldName] && (
 <p className="text-red-600 text-sm">{errors[numberFieldName]}</p>
 )}
 {name === "iphone_no" && (
 <label className="inline-flex items-center mt-2">
 <input
 type="checkbox"
 checked={sameAsPhone}
 onChange={toggleSame}
 className="mr-2"
 />
 WhatsApp same as phone
 </label>
 )}
 </div>
 );
 } else {
 return (
 <div key={name}>
 <label className="text-sm font-medium">
 {label} {required && <span className="text-red-500">*</span>}
 </label>
 <input
 type="text"
 name={name}
 value={value !== undefined ? value : form[name]}
 onChange={handleChange}
 onBlur={handleBlur}
 placeholder={`Enter ${label.toLowerCase()}`}
 className="mt-1 w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
 readOnly={readOnly}
 />
 {errors[name] && (
 <p className="text-red-600 text-sm">{errors[name]}</p>
 )}
 </div>
 );
 }
 })}
 </div>

 <hr className="my-6 " />

 <h3 className="text-lg font-semibold mt-6">{formLabels.section3Label}</h3>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {addressDetailsFields.map(({ label, name, required, type, value, readOnly }) => {
 if (type === "searchable-select-city") {
 return (
 <div key={name}>
 <label className="text-sm font-medium">
 {label} {required && <span className="text-red-500">*</span>}
 </label>
 <div className="relative mt-1" ref={cityDropdownRef}>
 <input
 type="text"
 placeholder={`Search ${label.toLowerCase()}`}
 className="w-full border px-3 py-2 rounded pr-10 focus:ring-2 focus:ring-blue-500 outline-none"
 value={searchCity}
 onChange={handleSearchCity}
 onFocus={() => setIsCityDropdownOpen(true)}
 />
 {isCityDropdownOpen && (
 <div className="absolute z-10 top-full mt-1 w-full bg-white border rounded shadow-md max-h-40 overflow-y-auto">
 {Array.isArray(filteredCities) && filteredCities.length > 0 ? (
 filteredCities.map((city) => (
 <div
 key={city.icity_id}
 onMouseDown={(e) => e.preventDefault()}
 onClick={() => {
 handleSelectDropdownItem(
 "icity",
 city.icity_id,
 city.cCity_name,
 setSearchCity,
 setIsCityDropdownOpen
 );
 }}
 className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
 >
 {city.cCity_name}
 </div>
 ))
 ) : (
 <EmptyDropdownMessage type="city" />
 )}
 </div>
 )}
 </div>
 {errors.icity && (
 <p className="text-red-600 text-sm">{errors.icity}</p>
 )}
 </div>
 );
 } else {
 return (
 <div key={name}>
 <label className="text-sm font-medium">
 {label} {required && <span className="text-red-500">*</span>}
 </label>
 <input
 type="text"
 name={name}
 value={value !== undefined ? value : form[name]}
 onChange={handleChange}
 onBlur={handleBlur}
 placeholder={`Enter ${label.toLowerCase()}`}
 className="mt-1 w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
 readOnly={readOnly}
 />
 {errors[name] && (
 <p className="text-red-600 text-sm">{errors[name]}</p>
 )}
 </div>
 );
 }
 })}
 </div>

 <div className="flex justify-end gap-4 pt-4">
 <button
 type="submit"
 disabled={loading || Object.keys(errors).some((key) => errors[key])}
 className={`w-[150px] flex justify-center items-center bg-blue-600 text-white py-2 font-semibold rounded-md hover:bg-blue-700 transition ${
 loading || Object.keys(errors).some((key) => errors[key])
 ? "opacity-70 cursor-not-allowed"
 : ""
 }`}
 >
 {loading ? (
 <svg
 className="animate-spin h-5 w-5 text-white"
 xmlns="http://www.w3.org/2000/svg"
 fill="none"
 viewBox="0 0 24 24"
 >
 <circle
 className="opacity-25"
 cx="12"
 cy="12"
 r="10"
 stroke="currentColor"
 strokeWidth="4"
 />
 <path
 className="opacity-75"
 fill="currentColor"
 d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
 />
 </svg>
 ) : (
 "Create Lead"
 )}
 </button>
 </div>

 {isAlertVisible && (
 <div style={alertStyle}>
 <span>{alertMessage}</span>
 </div>
 )}
 </form>
 {isPopupVisible && (
 <div style={popupStyle}>
 <span>{popupMessage}</span>
 {popupMessage.includes("already exists") ? (
 <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
 <button
 onClick={() => setIsPopupVisible(false)}
 style={{ ...buttonStyle, backgroundColor: "#ccc" }}
 >
 Cancel
 </button>
 <button
 onClick={() => {
 saveTriggerRef.current = true;
 formRef.current?.requestSubmit();
 setIsPopupVisible(false);
 }}
 style={{ ...buttonStyle, backgroundColor: "#28a745" }}
 >
 Save Anyway
 </button>
 </div>
 ) : (
 <button
 onClick={() => setIsPopupVisible(false)}
 style={closeButtonStyle}
 aria-label="Close popup"
 >
 &times;
 </button>
 )}
 </div>
 )}
 </div>
 );
};

export default LeadForm;