import React from 'react';
import Sidebar from '@/Components/common/Sidebar';
import { Outlet } from 'react-router-dom';

const AppLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 h-screen overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
