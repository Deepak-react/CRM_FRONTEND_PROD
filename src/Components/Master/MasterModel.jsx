import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { PlusCircle, Edit, Trash2, X } from 'lucide-react';

const getNestedObject = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export default function MasterModal({ master, onClose, companyId, userId, masterConfigs }) {
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [existingItems, setExistingItems] = useState([]);
  const [groupedHierarchicalItems, setGroupedHierarchicalItems] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState(null);
  const [parentOptions, setParentOptions] = useState([]);
  const [isLoadingParentOptions, setIsLoadingParentOptions] = useState(false);

  const isLabelMaster = useMemo(() => master?.title === "Label Master", [master]);

  // Helper to check if all label fields are empty (for Label Master)
  const areLabelFieldsEmpty = useMemo(() => {
    if (!isLabelMaster) return false;
    
    const requiredLabelFields = [
      'leadFormTitle',
      'section1Label',
      'section2Label',
      'section3Label'
    ];
    
    return requiredLabelFields.every(field => 
      !formData[field] || formData[field].length === 0
    );
  }, [formData, isLabelMaster]);

    // New state for all lead sources, used for filtering the dropdown
    const [allLeadSourceItems, setAllLeadSourceItems] = useState([]);
    const [isLoadingAllLeadSourceItems, setIsLoadingAllLeadSourceItems] = useState(false);

    // Get specific configs for hierarchical data processing
    const industryConfig = masterConfigs?.INDUSTRY;
    const subIndustryConfig = masterConfigs?.SUB_INDUSTRIES;
    const leadSourceConfig = masterConfigs?.LEAD_SOURCE; // Get LEAD_SOURCE config


    // Helper to evaluate conditional rendering rules
    const shouldFieldBeRendered = useCallback((fieldName, currentFormData) => {
        // This function will only be truly effective for fields explicitly listed in master.conditionalFields
        // The master.title checks in JSX will handle overall visibility for specific masters like "Order ID"
        if (!master.conditionalFields || master.conditionalFields.length === 0) {
            return true; // No conditional rules, so always render
        }

        const rule = master.conditionalFields.find(rule => rule.fieldName === fieldName);
        if (!rule) {
            return true; // No specific rule for this field, so always render
        }

        const dependsOnValue = currentFormData[rule.dependsOn];
        let conditionMet = false;

        switch (rule.operator) {
            case '===':
                conditionMet = dependsOnValue === rule.value;
                break;
            case '!==':
                conditionMet = dependsOnValue !== rule.value;
                break;
            case '>':
                conditionMet = dependsOnValue > rule.value;
                break;
            case '<':
                conditionMet = dependsOnValue < rule.value;
                break;
            case '>=':
                conditionMet = dependsOnValue >= rule.value;
                break;
            case '<=':
                conditionMet = dependsOnValue <= rule.value;
                break;
            case 'includes':
                conditionMet = Array.isArray(dependsOnValue) && dependsOnValue.includes(rule.value);
                break;
            case 'excludes':
                conditionMet = Array.isArray(dependsOnValue) && !dependsOnValue.includes(rule.value);
                break;
            case 'truthy': // Field must have a truthy value (not null, undefined, 0, false, empty string)
                conditionMet = !!dependsOnValue;
                break;
            case 'falsy': // Field must have a falsy value (null, undefined, 0, false, empty string)
                conditionMet = !dependsOnValue;
                break;
            default:
                conditionMet = true; // Fallback to rendering if operator is unknown
        }
        return conditionMet;
    }, [master.conditionalFields]);

    // Memoize fetchItems to prevent unnecessary re-creations
    const fetchItems = useCallback(async () => {
        if (!master || !master.get) {
            // console.warn("Master configuration or GET endpoint is missing. Cannot fetch items.");
            return;
        }

        setIsLoadingItems(true);
        setApiError(null);
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const response = await axios.get(master.get, { headers });

            // --- HIERARCHICAL DATA PROCESSING LOGIC (for Sub-Industries) ---
            if (master.title === subIndustryConfig?.title && master.get === industryConfig?.get) {
                const industries = getNestedObject(response.data, industryConfig.responseKey);
                const subindustries = getNestedObject(response.data, subIndustryConfig.responseKey);
                
                if (Array.isArray(industries) && Array.isArray(subindustries)) {
                    const grouped = industries.map(industry => {
                        return {
                            [industryConfig.idKey]: industry[industryConfig.idKey],
                            [industryConfig.payloadKey]: industry[industryConfig.payloadKey],
                            children: subindustries.filter(sub => 
                                sub[subIndustryConfig.parentMasterConfig?.parentIdInChildResponseKey || ''] === industry[industryConfig.idKey]
                            )
                        };
                    });
                    setGroupedHierarchicalItems(grouped);
                    setExistingItems([]); // Clear flat list if showing hierarchical
                } else {
                    console.warn("Hierarchical data expected but not found or not arrays.", { industries, subindustries });
                    setGroupedHierarchicalItems([]);
                    setExistingItems([]); // Fallback to empty
                }
            } else {
                // --- FLAT MASTER DATA PROCESSING (Existing Logic) ---
                let items = getNestedObject(response.data, master.responseKey);

                // For masters that return a single object (like LABEL_MASTER), wrap it in an array
                if (items && typeof items === 'object' && !Array.isArray(items)) {
                    items = [items];
                }
                
                setExistingItems(Array.isArray(items) ? items : []);
                setGroupedHierarchicalItems([]); // Clear hierarchical list if showing flat
            }
            setApiError(null);
        } catch (error) {
            let errorMessage = `Failed to fetch ${master.title} items.`;
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data.message || error.response.data.error || errorMessage;
            }
            setApiError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoadingItems(false);
        }
    }, [master, industryConfig, subIndustryConfig]);

    // Fetch all lead source items for filtering purposes
    const fetchAllLeadSourceItems = useCallback(async () => {
        if (!leadSourceConfig || !leadSourceConfig.get) {
            // console.warn("LEAD_SOURCE configuration or GET endpoint is missing. Cannot fetch all lead source items.");
            return;
        }
        setIsLoadingAllLeadSourceItems(true);
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const response = await axios.get(leadSourceConfig.get, { headers });
            const items = getNestedObject(response.data, leadSourceConfig.responseKey);
            setAllLeadSourceItems(Array.isArray(items) ? items : []);
        } catch (error) {
            console.error("Failed to fetch all lead source items for filtering:", error);
            toast.error("Failed to load lead source options for filtering.");
            setAllLeadSourceItems([]); // Ensure it's empty on error
        } finally {
            setIsLoadingAllLeadSourceItems(false);
        }
    }, [leadSourceConfig]);


    useEffect(() => {
        if (master) {
            setFormData({});
            setSelectedItemForEdit(null);
            fetchItems();
            // Fetch all lead source items if this is the LEAD_SOURCE master
            if (master.title === leadSourceConfig?.title) {
                fetchAllLeadSourceItems();
            }
        }
    }, [master, fetchItems, leadSourceConfig, fetchAllLeadSourceItems]);

    useEffect(() => {
        const fetchParentOptions = async () => {
            if (!master || !master.isHierarchical || !master.parentMasterConfig || !master.parentMasterConfig.getEndpoint) {
                setParentOptions([]);
                return;
            }

            setIsLoadingParentOptions(true);
            setApiError(null);
            const token = localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            try {
                const response = await axios.get(master.parentMasterConfig.getEndpoint, { headers });
                const parents = getNestedObject(response.data, master.parentMasterConfig.responseKey);

                if (Array.isArray(parents)) {
                    setParentOptions(parents);
                    // console.log("Fetched Parent Options for dropdown:", parents); // DEBUG
                } else {
                    setParentOptions([]);
                    toast.warn(`Could not load parent options for ${master.title}. Check parentMasterConfig.responseKey.`);
                }
            } catch (error) {
                let errorMessage = `Failed to fetch parent options for ${master.title}.`;
                if (axios.isAxiosError(error) && error.response) {
                    errorMessage = error.response.data.message || error.response.data.error || errorMessage;
                }
                setApiError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setIsLoadingParentOptions(false);
            }
        };

        if (master && master.isHierarchical && master.parentMasterConfig) {
            fetchParentOptions();
        } else {
            setParentOptions([]);
        }
    }, [master]);

    // Initialize formData when selectedItemForEdit or master changes
    useEffect(() => {
    if (!master) return;

    let newFormData = {};

    if (selectedItemForEdit) {
        if (selectedItemForEdit.isSubIndustry && subIndustryConfig) {
            // Handle sub-industry edit
            const parentIdKey = subIndustryConfig.parentMasterConfig?.parentIdInChildResponseKey || 'industryParent';
            const formParentKey = subIndustryConfig.parentMasterConfig?.formFieldKey || 'industryParent';
            
            newFormData = {
                [subIndustryConfig.payloadKey]: selectedItemForEdit[subIndustryConfig.payloadKey] || '',
                [formParentKey]: selectedItemForEdit[parentIdKey] !== undefined 
                    ? Number(selectedItemForEdit[parentIdKey])
                    : null,
                [subIndustryConfig.idKey]: selectedItemForEdit[subIndustryConfig.idKey],
                ...(subIndustryConfig.activeStatusPayloadKey && {
                    [subIndustryConfig.activeStatusPayloadKey]: selectedItemForEdit[subIndustryConfig.activeStatusPayloadKey] || false
                })
            };
        } else {
            // Handle non-sub-industry edits
            newFormData = { ...selectedItemForEdit };
        }
    } else {
        // For new entries
        newFormData = { ...master.basePostPayload };
        
        // Initialize parent industry for new sub-industry
        if (master.isHierarchical && master.parentMasterConfig) {
            const formParentKey = master.parentMasterConfig.formFieldKey || 'parentId';
            newFormData[formParentKey] = null;
        }
    }

    setFormData(newFormData);
},  [selectedItemForEdit, master, subIndustryConfig, industryConfig, leadSourceConfig]); 

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => {
            let newValue = value;
            if (master.isHierarchical && master.parentMasterConfig && name === (master.parentMasterConfig.formFieldKey || 'parentId')) {
                // Ensure the value stored in formData is a Number or null
                newValue = value === '' ? null : Number(value);
            } else if (type === 'checkbox') {
                newValue = checked;
            } else if (name === 'orderId' && type === 'number') { // Ensure orderId is stored as a number
                newValue = value === '' ? null : Number(value);
            } else if (name === 'parentLeadSourceId') { // For the new filtered lead source dropdown
                 newValue = value === '' ? null : Number(value);
            }
            // console.log(`handleChange: Name=${name}, Value=${value}, NewValueInState=${newValue}`); // DEBUG
            return {
                ...prev,
                [name]: newValue,
            };
        });
    };
    const validateMasterName = (name, masterType) => {
  if (!name) return `${masterType} name is required`;
  if (name.length < 3) return `${masterType} name must be at least 3 characters`;
  if (name.length > 50) return `${masterType} name cannot exceed 50 characters`;
  return null;
};

const handleSave = async () => {
  if (!master) {
    toast.error("Master configuration is missing. Cannot save.");
    return;
  }

  // Universal name validation for all masters
  const nameField = master.payloadKey; // e.g., 'clead_name', 'cindustry_name', etc.
  const nameValue = formData[nameField];
  const validationError = validateMasterName(nameValue, master.title);
  
  if (validationError) {
    setApiError(validationError);
    return;
  }

  // 👇 Add length validation for service name (applies to all masters using payloadKey)
  if (formData[master.payloadKey]?.length < 5 || formData[master.payloadKey]?.length > 50) {
    setApiError(`${master.modalKey || master.title} must be between 5-50 characters`);
    return; // Stop execution if validation fails
  }

  setIsSaving(true);
  setApiError(null);

        // Client-side validation for orderId if master is Lead Source and orderId must be 1
        if (master.title === leadSourceConfig?.title && formData.orderId !== undefined && master.orderIdMustBeOne && formData.orderId !== 1) {
            setApiError("Order ID for Lead Source must be 1.");
            toast.error("Order ID for Lead Source must be 1.");
            setIsSaving(false);
            return;
        }

        const isEditing = selectedItemForEdit && selectedItemForEdit[master.idKey];
        const currentSaveMasterConfig = (selectedItemForEdit?.isSubIndustry && subIndustryConfig) ? subIndustryConfig : master;

        const url = isEditing
            ? (typeof currentSaveMasterConfig.put === 'function' ? currentSaveMasterConfig.put(selectedItemForEdit[currentSaveMasterConfig.idKey]) : currentSaveMasterConfig.put)
            : currentSaveMasterConfig.post;
        const method = isEditing ? 'PUT' : 'POST';

        let payload = {};

        // Payload construction logic based on whether editing (PUT) or adding (POST)
        const fieldsToMap = isEditing && currentSaveMasterConfig.putPayloadFields && Array.isArray(currentSaveMasterConfig.putPayloadFields)
            ? currentSaveMasterConfig.putPayloadFields
            : (!isEditing && currentSaveMasterConfig.postPayloadFields && Array.isArray(currentSaveMasterConfig.postPayloadFields) 
                ? currentSaveMasterConfig.postPayloadFields
                : Object.keys(formData));
        
        fieldsToMap.forEach(field => {
            if (master.title === "Label Master" && isEditing) {
                if (field === "iformLabelMasterId") {
                    payload['formLabelMastersId'] = formData.iformLabelMasterId;
                    return;
                } else if (field === "icompany_id" && formData.icompany_id !== undefined) {
                     payload['icompany_id'] = formData.icompany_id;
                     return;
                }
            }

            // Default mapping: map formData field name to apiPayloadKey based on payloadMapping
            if (Object.hasOwn(formData, field) && formData[field] !== undefined) {
                const apiPayloadKey = currentSaveMasterConfig.payloadMapping?.[field] || field;
                payload[apiPayloadKey] = formData[field];
            }
        });


        // Apply base payloads (e.g., basePostPayload, basePutPayload)
        if (isEditing) {
            payload = { ...currentSaveMasterConfig.basePutPayload, ...payload };
            // Ensure primary ID is in payload if expected in body for PUT (for generic masters)
            if (currentSaveMasterConfig.idLocation === 'body' && currentSaveMasterConfig.idKey && selectedItemForEdit && master.title !== "Label Master") {
                const mappedIdKey = currentSaveMasterConfig.payloadMapping?.[currentSaveMasterConfig.idKey] || currentSaveMasterConfig.idKey;
                if (!Object.hasOwn(payload, mappedIdKey)) {
                    payload[mappedIdKey] = selectedItemForEdit[currentSaveMasterConfig.idKey];
                }
            }
        } else { // POST
            payload = { ...currentSaveMasterConfig.basePostPayload, ...payload };
            // Crucially, for POST, ensure the primary ID is NOT sent unless specifically desired (generic)
            const mappedIdKey = currentSaveMasterConfig.payloadMapping?.[currentSaveMasterConfig.idKey] || currentSaveMasterConfig.idKey;
            if (Object.hasOwn(payload, mappedIdKey) && !currentSaveMasterConfig.sendIdForPost && master.title !== "Label Master") {
                delete payload[mappedIdKey];
            }
        }

        // Inject company ID if not skipped and available (for generic masters)
        // For LABEL_MASTER, `icompany_id` is handled by `putPayloadFields` and `payloadMapping` directly.
        if (!currentSaveMasterConfig.skipCompanyIdInjection && companyId !== null && companyId !== undefined && master.title !== "Label Master") {
            const companyIdApiField = currentSaveMasterConfig.payloadMapping?.icompany_id || 'icompany_id';
            if (companyIdApiField) { 
                 payload[companyIdApiField] = companyId;
            }
        }

        // Inject modifier (created_by/updated_by) ID if configured
        const modifierKey = typeof currentSaveMasterConfig.modifierIdPayloadKey === 'object'
            ? (isEditing ? currentSaveMasterConfig.modifierIdPayloadKey.put : currentSaveMasterConfig.modifierIdPayloadKey.post)
            : currentSaveMasterConfig.modifierIdPayloadKey;
        if (modifierKey && userId !== null && userId !== undefined) {
            const mappedModifierKey = currentSaveMasterConfig.payloadMapping?.[modifierKey] || modifierKey; // Map the modifier key itself
            if (mappedModifierKey) {
                 payload[mappedModifierKey] = userId;
            }
        }

        // Inject updated/created timestamp if configured
        const updatedDtKey = typeof currentSaveMasterConfig.updatedDtPayloadKey === 'object'
            ? (isEditing ? currentSaveMasterConfig.updatedDtPayloadKey.put : currentSaveMasterConfig.updatedDtPayloadKey.post)
            : currentSaveMasterConfig.updatedDtPayloadKey;
        if (updatedDtKey) {
             const mappedUpdatedDtKey = currentSaveMasterConfig.payloadMapping?.[updatedDtKey] || updatedDtKey; // Map the timestamp key
             if (mappedUpdatedDtKey) {
                payload[mappedUpdatedDtKey] = new Date().toISOString();
            }
        }
        
        // console.log("Final Payload for API:", payload); // DEBUG
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            if (method === 'POST') {
                await axios.post(url, payload, { headers });
            } else if (method === 'PUT') {
                await axios.put(url, payload, { headers });
            } else {
                throw new Error('Unsupported HTTP method for saving.');
            }

            toast.success(`${currentSaveMasterConfig.title} saved successfully!`);

            setSelectedItemForEdit(null);
            const newEntryFormData = { ...currentSaveMasterConfig.basePostPayload };
            if (currentSaveMasterConfig.activeStatusPayloadKey && newEntryFormData[currentSaveMasterConfig.activeStatusPayloadKey] === undefined) {
                 newEntryFormData[currentSaveMasterConfig.activeStatusPayloadKey] = true;
            }
            if (currentSaveMasterConfig.isHierarchical && currentSaveMasterConfig.parentMasterConfig) {
                const formParentKey = currentSaveMasterConfig.parentMasterConfig.formFieldKey || 'parentId';
                newEntryFormData[formParentKey] = null;
            }
            // For new Lead Status/Potential entries, clear orderId after save
            if ((master.title === "Lead Status" || master.title === "Potential") && newEntryFormData.orderId !== undefined) {
                newEntryFormData.orderId = ''; 
            }
            // Clear parentLeadSourceId for new Lead Source entries after save
            if (master.title === leadSourceConfig?.title) {
                newEntryFormData.parentLeadSourceId = null;
            }
            setFormData(newEntryFormData);

            await fetchItems(); // Re-fetch current master items
            if (master.title === leadSourceConfig?.title) { // Re-fetch all lead sources for filtering
                fetchAllLeadSourceItems();
            }


        } catch (error) {
            let errorMessage = `Failed to save ${currentSaveMasterConfig.title}.`;
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.data && Array.isArray(error.response.data.issues) && error.response.data.issues.length > 0) {
                    errorMessage = `Validation Error: ${error.response.data.issues.map(issue => issue.message || issue.field || JSON.stringify(issue)).join('; ')}`;
                } else {
                    errorMessage = error.response.data.message || error.response.data.error || `Server Error: ${error.response.status}`;
                }
            } else if (axios.isAxiosError(error) && error.request) {
                errorMessage = "No response from server. Please check your network connection.";
            } else {
                errorMessage = error.message;
            }
            setApiError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    // Handles deletion for flat lists
    const handleDelete = async (itemId) => {
        if (!master) {
            toast.error("Master configuration is missing. Cannot delete.");
            return;
        }

        setIsDeleting(true);
        setApiError(null);

        const itemToDelete = existingItems.find(item => item[master.idKey] === itemId);
        
        if (!master.delete) {
            toast.error(`Delete endpoint not configured for ${master.title}.`);
            setIsDeleting(false);
            return;
        }

        const confirmDelete = window.confirm(`Are you sure you want to delete "${itemToDelete?.[master.payloadKey] || 'this item'}"?`);
        if (!confirmDelete) {
            setIsDeleting(false); // Reset isDeleting if user cancels
            return;
        }

        const url = (typeof master.delete === 'function')
            ? master.delete(itemId, itemToDelete)
            : master.delete;

        try {
            const token = localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            let deletePayload = {};
            const mappedIdKey = master.payloadMapping?.[master.idKey] || master.idKey;

            if (itemId !== undefined && itemId !== null) {
                deletePayload[mappedIdKey] = itemId;
            }

            if (master.baseDeletePayload) {
                deletePayload = { ...master.baseDeletePayload, ...deletePayload };
            }
            
            if (master.activeStatusPayloadKey && !Object.hasOwn(deletePayload, master.activeStatusPayloadKey)) {
                const mappedActiveKey = master.payloadMapping?.[master.activeStatusPayloadKey] || master.activeStatusPayloadKey;
                deletePayload[mappedActiveKey] = false; 
            }

            // Inject modifier (updated_by) ID for delete if configured
            const deleteModifierKey = typeof master.modifierIdPayloadKey === 'object'
                ? master.modifierIdPayloadKey.delete
                : master.modifierIdPayloadKey;
            if (deleteModifierKey && userId !== null && userId !== undefined) {
                const mappedDeleteModifierKey = master.payloadMapping?.[deleteModifierKey] || deleteModifierKey;
                if (mappedDeleteModifierKey) {
                    deletePayload[mappedDeleteModifierKey] = userId;
                }
            }

            // Inject updated timestamp for delete if configured
            const deleteUpdatedDtKey = typeof master.updatedDtPayloadKey === 'object'
                ? master.updatedDtPayloadKey.delete
                : master.updatedDtPayloadKey;
            if (deleteUpdatedDtKey) {
                const mappedDeleteUpdatedDtKey = master.payloadMapping?.[deleteUpdatedDtKey] || deleteUpdatedDtKey;
                if (mappedDeleteUpdatedDtKey) {
                    deletePayload[mappedDeleteUpdatedDtKey] = new Date().toISOString();
                }
            }


            // Determine if payload needs to be sent in the body
            const sendPayloadInBody = master.idLocation === 'body'; // Now strictly relies on idLocation being 'body'

            // console.log("DELETE Request - URL:", url); // DEBUG
            // console.log("DELETE Request - Payload (if body expected):", sendPayloadInBody ? deletePayload : "N/A - Query/Params Expected"); // DEBUG

            if (sendPayloadInBody) {
                if (Object.keys(deletePayload).length === 0) {
                    console.warn(`Attempting to send DELETE with empty body. Ensure master.idKey and baseDeletePayload are configured correctly for body-based DELETE.`);
                }
                await axios.delete(url, { data: deletePayload, headers: headers });
            } else {
                // If idLocation is not 'body' (e.g., 'query' or 'params'), body is NOT sent.
                await axios.delete(url, { headers: headers });
            }

            toast.success(`${master.title} deleted successfully!`);

            setSelectedItemForEdit(null);
            const newEntryFormData = { ...master.basePostPayload };
            if (master.activeStatusPayloadKey && newEntryFormData[master.activeStatusPayloadKey] === undefined) {
                 newEntryFormData[master.activeStatusPayloadKey] = true;
            }
            if (master.isHierarchical && master.parentMasterConfig) {
                const formParentKey = master.parentMasterConfig.formFieldKey || 'parentId';
                newEntryFormData[formParentKey] = null;
            }
            // For Lead Status/Potential, clear orderId after delete
            if ((master.title === "Lead Status" || master.title === "Potential") && newEntryFormData.orderId !== undefined) {
                newEntryFormData.orderId = ''; 
            }
             // Clear parentLeadSourceId for new Lead Source entries after delete
            if (master.title === leadSourceConfig?.title) {
                newEntryFormData.parentLeadSourceId = null;
            }
            setFormData(newEntryFormData);

            await fetchItems(); // Re-fetch current master items
            if (master.title === leadSourceConfig?.title) { // Re-fetch all lead sources for filtering
                fetchAllLeadSourceItems();
            }

        } catch (error) {
            let errorMessage = `Failed to delete ${master.title}.`;
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.data && Array.isArray(error.response.data.issues) && error.response.data.issues.length > 0) {
                    errorMessage = `Validation Error: ${error.response.data.issues.map(issue => issue.message || issue.field || JSON.stringify(issue)).join('; ')}`;
                } else {
                    errorMessage = error.response.data.message || error.response.data.error || `Server Error: ${error.response.status}`;
                }
            } else if (axios.isAxiosError(error) && error.request) {
                errorMessage = "No response from server during delete. Please check your network.";
            } else {
                errorMessage = error.message;
            }
            setApiError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };
const handleEditSubIndustryClick = (subIndustryItem) => {
    setSelectedItemForEdit({ ...subIndustryItem, isSubIndustry: true });

    if (subIndustryConfig) {
        // Get the parent ID key from the sub-industry config
        const parentIdKeyInResponse = subIndustryConfig.parentMasterConfig?.parentIdInChildResponseKey || 'industryParent';
        const formParentKey = subIndustryConfig.parentMasterConfig?.formFieldKey || 'industryParent';

        // Create the form data with proper parent industry mapping
        const newFormData = {
            // Main name field
            [subIndustryConfig.payloadKey]: subIndustryItem[subIndustryConfig.payloadKey] || '',

            // Parent ID - use the mapped key from payloadMapping if available
            [formParentKey]: subIndustryItem[parentIdKeyInResponse] !== undefined 
                ? Number(subIndustryItem[parentIdKeyInResponse])
                : null,

            // ID key (for update operation)
            [subIndustryConfig.idKey]: subIndustryItem[subIndustryConfig.idKey],

            // Active status (if used)
            ...(subIndustryConfig.activeStatusPayloadKey && {
                [subIndustryConfig.activeStatusPayloadKey]: subIndustryItem[subIndustryConfig.activeStatusPayloadKey] || false
            })
        };

        setFormData(newFormData);
    }
};


    const handleDeleteSubIndustryClick = async (subIndustryItem) => {
        if (!subIndustryConfig) {
            toast.error("Sub-Industry configuration not available for delete.");
            return;
        }

        const confirmDelete = window.confirm(`Are you sure you want to delete "${subIndustryItem[subIndustryConfig.payloadKey]}"?`);
        if (!confirmDelete) return;

        setIsDeleting(true);
        setApiError(null);

        try {
            const itemId = subIndustryItem[subIndustryConfig.idKey];
            if (!itemId) {
                throw new Error("Sub-Industry ID is missing for deletion.");
            }
            const deleteUrl = subIndustryConfig.delete(itemId, subIndustryItem);

            // Sub-Industry delete handles its own payload based on its config
            if (subIndustryConfig.idLocation === 'body' && Object.keys(subIndustryConfig.baseDeletePayload || {}).length > 0) {
                 const deletePayload = {
                    ...(subIndustryConfig.baseDeletePayload || {}),
                    [subIndustryConfig.payloadMapping?.[subIndustryConfig.idKey] || subIndustryConfig.idKey]: itemId,
                 };
                 const modifierKey = typeof subIndustryConfig.modifierIdPayloadKey === 'object'
                    ? subIndustryConfig.modifierIdPayloadKey.delete
                    : subIndustryConfig.modifierIdPayloadKey;
                if (modifierKey && userId !== null && userId !== undefined) {
                    deletePayload[modifierKey] = userId;
                }
                const updatedDtKey = typeof subIndustryConfig.updatedDtPayloadKey === 'object'
                    ? subIndustryConfig.updatedDtPayloadKey.delete
                    : undefined;
                if (updatedDtKey) {
                    deletePayload[updatedDtKey] = new Date().toISOString();
                }

                await axios.delete(deleteUrl, { data: deletePayload, headers: { 'Content-Type': 'application/json' } });

            } else {
                 await axios.delete(deleteUrl, { headers: { 'Content-Type': 'application/json' } });
            }
           
            toast.success(`${subIndustryItem[subIndustryConfig.payloadKey]} deleted successfully!`);
            await fetchItems();
        } catch (error) {
            let errorMessage = `Failed to delete ${subIndustryItem[subIndustryConfig.payloadKey]}.`;
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.data.message || error.response.data.error || `Server Error: ${error.response.status}`;
            } else if (axios.isAxiosError(error) && error.request) {
                errorMessage = "No response from server during delete. Please check your network.";
            } else {
                errorMessage = error.message;
            }
            setApiError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    // Filter lead source options based on the entered orderId
    const filteredLeadSourceOptions = React.useMemo(() => {
        if (master.title !== leadSourceConfig?.title || formData.orderId === undefined || formData.orderId === null || formData.orderId === '') {
            return []; // Only filter if it's Lead Source master and orderId is present
        }
        const orderIdValue = Number(formData.orderId);
        // Assuming lead source items have 'iorder_id' as the order ID from backend
        const mappedOrderIdKey = leadSourceConfig?.payloadMapping?.orderId || 'orderId'; // Get backend key for orderId

        // Filter out the currently selected item for edit from the parent source options
        return allLeadSourceItems.filter(item => 
            item[mappedOrderIdKey] === orderIdValue && 
            item[leadSourceConfig.idKey] !== (selectedItemForEdit ? selectedItemForEdit[leadSourceConfig.idKey] : null)
        );
    }, [formData.orderId, allLeadSourceItems, master.title, leadSourceConfig, selectedItemForEdit]);


    if (!master) {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl text-center">
                    <h2 className="text-xl font-bold mb-4 text-red-600">Error: Master configuration not provided.</h2>
                    <p>Please ensure a valid master configuration is passed to the modal.</p>
                    <button
                        onClick={onClose}
                        className="mt-4 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const parentLabel = master.isHierarchical && master.parentMasterConfig
        ? (master.parentMasterConfig.modalLabel || `Parent ${master.parentMasterConfig.title || 'Item'}`)
        : '';

    const formParentKey = master.isHierarchical && master.parentMasterConfig
        ? (master.parentMasterConfig.formFieldKey || 'parentId')
        : null;


    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl h-[90vh] flex flex-col">
                <h2 className="text-2xl font-bold mb-4 text-center text-blue-800">{master.title} Master</h2>
                <button
                    onClick={onClose}
                    className="related top-10 right-10 ms-[600px] mt-[-65px] text-gray-500 hover:text-gray-700 text-3xl font-bold"
                >
                    &times;
                </button>

                {apiError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{apiError}</div>}

                <div className="flex flex-1 mt-10 overflow-hidden">
                    {/* Existing Items List (Left Side) */}
                    <div className="w-1/2 pr-4 overflow-y-auto border-r border-gray-200">
                        <h3 className="text-xl font-semibold mb-3 text-blue-700">Existing {master.title}</h3>
                        {isLoadingItems ? (
                            <div className="flex justify-center items-center h-full">
                                <p>Loading items...</p>
                            </div>
                        ) : (
                            <>
                                {/* Conditional Rendering for Hierarchical vs. Flat List */}
                                {master.title === subIndustryConfig?.title && groupedHierarchicalItems.length > 0 ? (
                                    <div className="space-y-4">
                                        {groupedHierarchicalItems.map(industry => (
                                            <div key={industry[industryConfig.idKey]} className="border rounded-md p-3 bg-gray-50">
                                                <h4 className="text-lg font-bold text-blue-800 mb-2">{industry[industryConfig.payloadKey]}</h4>
                                                {industry.children && industry.children.length > 0 ? (
                                                    <ul className="pl-4 space-y-1">
                                                        {industry.children.map(subindustry => (
                                                            <li
                                                                key={subindustry[subIndustryConfig.idKey]}
                                                                className={`p-2 border rounded-md flex justify-between items-center bg-white hover:bg-gray-100 transition-colors duration-200 ${selectedItemForEdit && selectedItemForEdit.isSubIndustry && selectedItemForEdit[subIndustryConfig.idKey] === subindustry[subIndustryConfig.idKey] ? 'bg-blue-100 border-blue-400' : ''}`}
                                                            >
                                                                <span className="font-medium text-gray-700">
                                                                    {subindustry[subIndustryConfig.payloadKey]}
                                                                    {subIndustryConfig.activeStatusPayloadKey && typeof subindustry[subIndustryConfig.activeStatusPayloadKey] === 'boolean' && (
                                                                        <span className={`ml-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${subindustry[subIndustryConfig.activeStatusPayloadKey] ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                            {subindustry[subIndustryConfig.activeStatusPayloadKey] ? 'Active' : 'Inactive'}
                                                                        </span>
                                                                    )}
                                                                </span>
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        onClick={() => handleEditSubIndustryClick(subindustry)}
                                                                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-200 transition-colors"
                                                                        title="Edit Sub-Industry"
                                                                    >
                                                                        <Edit size={18} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteSubIndustryClick(subindustry)}
                                                                        disabled={isDeleting}
                                                                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-200 disabled:opacity-50 transition-colors"
                                                                        title="Delete Sub-Industry"
                                                                    >
                                                                        <Trash2 size={18} />
                                                                    </button>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-gray-600 text-sm italic ml-4">No sub-industries.</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : ( /* RENDER FLAT LIST FOR ALL OTHER MASTERS */
                                    existingItems.length === 0 ? (
                                        <p className="text-gray-600">No {master.title} items found. Add a new one!</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {existingItems.map(item => {
                                                return (
                                                <li
                                                    key={item[master.idKey]}
                                                    className={`p-3 border rounded-md flex justify-between items-center transition-colors duration-200
                                                        ${selectedItemForEdit && selectedItemForEdit[master.idKey] === item[master.idKey]
                                                            ? 'bg-blue-100 border-blue-400' : 'bg-gray-50 hover:bg-gray-100'}`}
                                                >
                                                    <span className="font-medium text-gray-800">
                                                        {item[master.payloadKey]}
                                                        {master.isHierarchical && master.parentMasterConfig && item[master.parentMasterConfig.parentIdInChildResponseKey || master.parentMasterConfig.idKey] && (
                                                            <span className="ml-2 text-sm text-gray-500">
                                                                (Parent: {
                                                                    parentOptions.find(
                                                                        p => p[master.parentMasterConfig.idKey] === item[master.parentMasterConfig.parentIdInChildResponseKey || master.parentMasterConfig.idKey]
                                                                    )?.[master.parentMasterConfig.nameKey] || 'N/A'
                                                                })
                                                            </span>
                                                        )}
                                                        {master.additionalFields && master.additionalFields.map(field => {
                                                            if (master.isHierarchical && master.parentMasterConfig && field === (master.parentMasterConfig.formFieldKey || 'parentId')) {
                                                                return null;
                                                            }
                                                            return item[field] && <span key={field} className="ml-2 text-sm text-gray-500">({item[field]})</span>;
                                                        })}
                                                        {master.activeStatusPayloadKey && typeof item[master.activeStatusPayloadKey] === 'boolean' && (
                                                            <span className={`ml-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${item[master.activeStatusPayloadKey] ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                {item[master.activeStatusPayloadKey] ? 'Active' : 'Inactive'}
                                                            </span>
                                                        )}
                                                    </span>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => setSelectedItemForEdit(item)}
                                                            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-200 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        {/* Hide delete button for Label Master */}
                                                        {!isLabelMaster && (
                                                            <button
                                                                onClick={() => handleDelete(item[master.idKey])}
                                                                disabled={isDeleting || !master.delete}
                                                                className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-200 disabled:opacity-50 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </li>
                                            );})}
                                        </ul>
                                    )
                                )}
                            </>
                        )}
                    </div>

                    {/* Form for Add/Edit (Right Side) */}
                    <div className="w-1/2 pl-4 flex flex-col">
                        <h3 className="text-xl font-semibold mb-3 text-blue-700">
                            {selectedItemForEdit ? `Edit Existing ${master.modalKey || master.title}` : `Add New ${master.modalKey || master.title}`}
                        </h3>
                        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                            {/* Parent Dropdown for Hierarchical Masters (e.g., Sub-Industries) */}
                           {master.isHierarchical && master.parentMasterConfig && formParentKey && (
    <div className="mb-4">
        <label htmlFor={formParentKey} className="block text-sm font-medium text-gray-700 mb-1">
            {parentLabel}:
        </label>
        <select
            id={formParentKey}
            name={formParentKey}
            value={formData[formParentKey] === null ? '' : String(formData[formParentKey])}
            onChange={handleChange}
            required={master.parentMasterConfig.required}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSaving}
        >
            <option value="">Select a {parentLabel}</option>
            {parentOptions.map((parent) => (
                <option
                    key={parent[master.parentMasterConfig.idKey]}
                    value={String(parent[master.parentMasterConfig.idKey])}
                >
                    {parent[master.parentMasterConfig.nameKey]}
                </option>
            ))}
        </select>
    </div>
)}

{/* Main Input Field (clead_name, subindustry_name, etc.) */}
<div className="mb-4">
  {selectedItemForEdit && master.payloadKey === 'subindustry_name' && (
    <div className="mb-3">
      <h3 className="text-lg font-semibold text-blue-700">
        Industry:{" "}
        {(() => {
          const matchedIndustry = parentOptions.find(
            (industry) =>
              String(industry.iindustry_id) ===
              String(selectedItemForEdit.iindustry_parent)
          );
          return matchedIndustry?.cindustry_name || "Not Found";
        })()}
      </h3>
    </div>
  )}

 <div className="mb-4">
  <label htmlFor={master.payloadKey} className="block text-sm font-medium text-gray-700 mb-1">
    {master.modalKey || master.title}:
    <span className="ml-2 text-xs text-green-500">
      {formData[master.payloadKey]?.length || 0}/50 characters
    </span>
  </label>
  <input
    id={master.payloadKey}
    name={master.payloadKey}
    type="text"
    className={`mt-1 block w-full border ${
      formData[master.payloadKey]?.length > 0 && 
      (formData[master.payloadKey]?.length < 3 || formData[master.payloadKey]?.length > 50)
        ? 'border-red-500' 
        : 'border-gray-300'
    } rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500`}
    value={formData[master.payloadKey] || ''}
    onChange={handleChange}
    required
    minLength={3}
    maxLength={50}
    disabled={isSaving}
  />
  {formData[master.payloadKey]?.length > 0 && (
    <p className={`mt-1 text-xs ${
      formData[master.payloadKey]?.length < 3 || formData[master.payloadKey]?.length > 50
        ? 'text-red-600'
        : 'text-green-600'
    }`}>
      {formData[master.payloadKey]?.length < 3
        ? 'Minimum 3 characters required'
        : formData[master.payloadKey]?.length > 50
        ? 'Maximum 50 characters exceeded'
        : 'Valid length'}
    </p>
  )}
</div>
</div>
                            {/* Order ID Input Field (Conditionally Rendered) */}
                            {master.title === "Status" && shouldFieldBeRendered('orderId', formData) && (
                                <div className="mb-4">
                                    <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-1">
                                        Order ID:
                                    </label>
                                    <input
                                        id="orderId"
                                        name="orderId"
                                        type="number"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={formData.orderId !== undefined && formData.orderId !== null ? formData.orderId : ''}
                                        onChange={handleChange}
                                        disabled={isSaving}
                                    />
                                </div>
                            )}

                            {/* Additional Fields if configured (Conditionally Rendered) */}
                            {master.additionalFields && master.additionalFields.map(field => {
                                // Don't render the parent field as an additional text input if it's handled by the dropdown
                                if (master.isHierarchical && master.parentMasterConfig && field === (master.parentMasterConfig.formFieldKey || 'parentId')) {
                                    return null;
                                }
                                // Conditional rendering for additional fields
                                return shouldFieldBeRendered(field, formData) && (
                                    <div className="mb-4" key={field}>
                                        <label htmlFor={field} className="block text-sm font-medium text-gray-700 mb-1">
                                            {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                                        </label>
                                        <input
                                            id={field}
                                            name={field}
                                            type="text"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                            value={formData[field] || ''}
                                            onChange={handleChange}
                                            disabled={isSaving}
                                        />
                                    </div>
                                );
                            })}

                            {/* Form Actions */}
                            <div className="flex justify-end space-x-2 mt-auto pt-4">
                                {selectedItemForEdit && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedItemForEdit(null)}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
                                        disabled={isSaving}
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                                {/* Show Add button only when all label fields are empty for Label Master */}
                                {(!isLabelMaster || (isLabelMaster && areLabelFieldsEmpty)) && (
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Saving...' : (selectedItemForEdit ? 'Update' : 'Add')}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}