

export const BASE_URL = import.meta.env.VITE_API_URL;


export const ENDPOINTS = {  
  BASE_URL_IS: BASE_URL,
  LOGIN: `${BASE_URL}/login`,
  PLAN_TYPE: `${BASE_URL}/pricing-plans`,
  RESELLER: `${BASE_URL}/reseller`,
  LEAD_STATUS: `${BASE_URL}/lead-status/company-lead`, // UPDATED 20/6
  LEAD_STATUS_ACTION : `${BASE_URL}/lead-status/action-logs`,
  LEAD: `${BASE_URL}/lead/user/`,
  USERS: `${BASE_URL}/users`,
  ROLE: `${BASE_URL}/role`,
  FOLLOW_UP: `${BASE_URL}/calender-event`,
  DASHBOARD_USER: `${BASE_URL}/lead/dashboard`,
  CREATE_EVENT: `${BASE_URL}/calender-event`,
  DASHBOARD_MANAGER: `${BASE_URL}/lead/manager`,
  REMINDERS: `${BASE_URL}/reminder/get-reminder`,
  LEAD_STATUS_UPDATE: `${BASE_URL}/lead`,
  CONVERT_TO_DEAL: `${BASE_URL}/lead/convert-to-deal`,
  USER_REMINDER:`${BASE_URL}/reminder/user-reminder`,
  USER_CREATION: `${BASE_URL}/users`,
  GET_USERS: `${BASE_URL}/users`,
  CONVERT_TO_LOST: `${BASE_URL}/lead`,
  EXPORT_LEADS: `${BASE_URL}/lead/download`,
  LOST_LEADS: `${BASE_URL}/reports/lost-leads`,
  STAGE_LEADS: `${BASE_URL}/reports/sales-stage-leads`,
  COMPANY_GET: `${BASE_URL}/lead/company-dashboard/`,
  USER_GET: `${BASE_URL}/users`,
  NOTIFICATIONS: `${BASE_URL}/notifications`,
  TERRITORY_LEADS: `${BASE_URL}/reports/territory-leads`,
  FEEDBACK: `${BASE_URL}/reports/feedback`,
  FORGOT_PASSWORD: `${BASE_URL}/forgot-password`,
  UPDATE_PASSWORD: `${BASE_URL}/update-password`,
  GET_DEALS: `${BASE_URL}/lead/deals`,
  DEMO_MAIL: `${BASE_URL}/sentmail`,
  ASSIGN_TO_ME: `${BASE_URL}/assigned-to/get-asssigned-leads`,
  TEAM_KPI: `${BASE_URL}/lead/manager`,
  TEAM_LEAD: `${BASE_URL}/lead/manager`,
  LOST_DETAILS:`${BASE_URL}/lead/lost-leads`,
  MANAGER_REMINDER: `${BASE_URL}/lead/manager`,
  SENTMAIL: `${BASE_URL}/sentmail`,
  DEMO_SESSION_DETAILS: `${BASE_URL}/demo-session`,
  DEMO_SESSION_GET: `${BASE_URL}/demo-session`,
  DEMO_SESSION_EDIT: `${BASE_URL}/demo-session`,
  LOST_REASON:`${BASE_URL}/lead-lostreason`,
  LEAD_DETAILS: `${BASE_URL}/lead/`,
   COMPANY_GET: `${BASE_URL}/lead/company-dashboard/`,
  NOTIFICATIONS: `${BASE_URL}/notifications`,
  GET_DEALS: `${BASE_URL}/lead/deals`,
  GET_SETTINGS: `${BASE_URL}/general-setting/info`,
  GET_PARAMS_TARGET: `${BASE_URL}/user-target/get-user-target`,
  GET_ASSIGN: `${BASE_URL}/assigned-to`,
  GET_METRICS_TARGET: `${BASE_URL}/user-target`,
  GET_USER_HISTORY: `${BASE_URL}/user-target/user-activity-history`,
  UPDATE_PASSWORD: `${BASE_URL}/update-password`,
  LEAD_CONVERSION: `${BASE_URL}/reports/get-conversion-time`,
  ACTIVITY_HISTORY: `${BASE_URL}/user-target/user-activity-data`,
  GENERAL_SETTINGS_UPDATE: `${BASE_URL}/general-setting/edit`,
  USER_ACHIEVEMENTS: `${BASE_URL}/user-target/user-achievements`,
  USER_POST: `${BASE_URL}/user-target`,
  SENTMAIL: `${BASE_URL}/sentmail`,
  MANAGER_REMINDER: `${BASE_URL}/lead/manager`,

  // Master endpoints
  MASTER_STATUS_GET: `${BASE_URL}/lead-status/company-lead`,
  MASTER_STATUS_POST: `${BASE_URL}/lead-status`,
  MASTER_STATUS_PUT: `${BASE_URL}/lead-status`,
  MASTER_STATUS_DELETE: `${BASE_URL}/lead-status`,

  MASTER_INDUSTRY_GET: `${BASE_URL}/lead-industry/company-industry`,
  MASTER_INDUSTRY_POST: `${BASE_URL}/lead-industry`,
  MASTER_INDUSTRY_PUT: `${BASE_URL}/lead-industry`,
  MASTER_INDUSTRY_DELETE: `${BASE_URL}/lead-industry`,

  MASTER_SUB_INDUSTRY: `${BASE_URL}/sub-industry`,
  MASTER_SUB_INDUSTRY_DELETE: `${BASE_URL}/sub-industry`,

  MASTER_SOURCE_GET: `${BASE_URL}/lead-source/company-src`,
  MASTER_SOURCE_POST: `${BASE_URL}/lead-source`,
  MASTER_SOURCE_PUT: `${BASE_URL}/lead-source`,
  MASTER_SOURCE_DELETE: `${BASE_URL}/lead-source`,

  MASTER_POTENTIAL_GET: `${BASE_URL}/lead-potential/company-potential`,
  MASTER_POTENTIAL_POST: `${BASE_URL}/lead-potential`,
  MASTER_POTENTIAL_PUT: `${BASE_URL}/lead-potential`,
  MASTER_POTENTIAL_DELETE: `${BASE_URL}/lead-potential`,

  MASTER_LOST_REASON_GET: `${BASE_URL}/lead-lostreason`,
  MASTER_LOST_REASON_POST: `${BASE_URL}/lead-lostreason`,
  MASTER_LOST_REASON_PUT: `${BASE_URL}/lead-lostreason`,
  MASTER_LOST_REASON_DELETE: `${BASE_URL}/lead-lostreason`,

  MASTER_LABEL_GET: `${BASE_URL}/lead-form-label`,
  MASTER_LABEL_POST: `${BASE_URL}/lead-form-label`,
  MASTER_LABEL_PUT: `${BASE_URL}/lead-form-label`,

  DEMO_MAIL: `${BASE_URL}/request-demo`,
  COMPANY_LEADS:`${BASE_URL}/reports/company-all-leads`,
  LEAD_OWNER_FIRST_RES: `${BASE_URL}/reports/lead-owner-efficiency`,
  SALES_PIPLINE_ANALYSIS: `${BASE_URL}/reports/sales-pipline-report`,
  PROSPECTS_LOST_LEADS: `${BASE_URL}/reports/prospects-lost-leads`,
  STATUS_REMARKS:`${BASE_URL}/lead-status-remark`

 
};

