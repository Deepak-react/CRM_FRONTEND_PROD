import React from "react";
import { Routes, Route } from "react-router-dom";

import ForgetPassword from "./Components/ForgetPassword";
import { ToastProvider } from "./context/ToastContext";
import SuccessMessage from "./pages/credential/SuccessMessage";
import VerifyCodePage from "./pages/credential/verify_code";
import Login from "./pages/credential/login";
import { PopupProvider } from "./context/PopupContext";
import SignupRes from "./pages/credential/signup_res";

import LeadTimeline from "./Components/LeadTimeline";
import HistoryPage from "./pages/history";
import CompanyList from "./Components/Company/CompanyList";
import CompanyPage from "./pages/companypage";
import AllLeadsPage from "./pages/dashboard/AllLeadsPage";
import LeadsDashboard from "./pages/dashboard/teamLeadDashboard";
import LeadManagePage from "./pages/LeadManagePage";
import LeadListViewPage from "./pages/dashboard/LeadListView";
import LeadCardViewPage from "./pages/dashboard/LeadcardView";
import UserAnalyticsPage from "./pages/user_analytics";
import CalendarPage from "./pages/calenderpage";
import Commandpage from "./pages/command";
import TeamviewDashboard from "./pages/dashboard/teamviewdashboard";
import { TabProvider } from "./context/TabContext";
import LeadDetailView from "./context/leaddetailsview";
import CreateUserForm from "./Components/registerUser";
import AppLayout from "./Components/AppLayout";

import SettingsPage from "./pages/settings/settingsPage";
import AccountSettings from "./pages/settings/accountSettings";
import NotificationSettings from "./pages/settings/notificationSettings";
import BillingSettings from "./pages/settings/billingSettings";
import MembersSettings from "./pages/settings/membersSettings";
import SupportSettings from "./pages/settings/supportSettings";
import SmtpSettings from "./pages/settings/smtpsettings";
import UserPage from "./pages/userPage/userPage";
import LostLeadReportPage from './Components/reports/LeadLostReport';
import SalesByStageReportPage from './Components/reports/salesByStageReport';
import CardsPage from './Components/reports/reports';

function App() {
  return (
    <PopupProvider>
      <ToastProvider>
        <TabProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/forgetpassword" element={<ForgetPassword />} />
            <Route path="/success" element={<SuccessMessage />} />
            <Route path="/verify" element={<VerifyCodePage />} />
            <Route path="/signupres" element={<SignupRes />} />

            {/* Protected Routes with Layout */}
            <Route element={<AppLayout />}>
              <Route path="calenderpage" element={<CalendarPage />} />
                <Route path="/reportpage" element={<CardsPage />} />
          <Route path="/sales-by-stage-analytics" element={<SalesByStageReportPage />} />

          <Route path="/lead-lost-analytics" element={<LostLeadReportPage />} />
              <Route path="userpage" element={<UserPage />} />
              <Route path="commandpage" element={<Commandpage />} />
              <Route path="users" element={<CreateUserForm />} />

              <Route path="leads" element={<LeadsDashboard />} />
              <Route path="leadlistview" element={<LeadListViewPage />} />
              <Route path="leadcardview" element={<LeadCardViewPage />} />
              <Route path="leadmanage" element={<LeadManagePage />} />
              <Route path="leadtimeline" element={<LeadTimeline />} />
              <Route path="allleadpage" element={<AllLeadsPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="companylist" element={<CompanyList />} />
              <Route path="companypage" element={<CompanyPage />} />
              <Route path="analytics" element={<UserAnalyticsPage />} />
              <Route path="teamview" element={<TeamviewDashboard />} />
              <Route path="leaddetailview/:leadId" element={<LeadDetailView />} />

              <Route path="settingspage" element={<SettingsPage />}>
                <Route path="account" element={<AccountSettings />} />
                <Route path="notification" element={<NotificationSettings />} />
                <Route path="billing" element={<BillingSettings />} />
                <Route path="members" element={<MembersSettings />} />
                <Route path="support" element={<SupportSettings />} />
                <Route path="smtpsettings" element={<SmtpSettings />} />
              </Route>
            </Route>
          </Routes>
        </TabProvider>
      </ToastProvider>
    </PopupProvider>
  );
}

export default App;
