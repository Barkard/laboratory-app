'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex h-screen bg-celeste-gradient overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            <div
                className={`fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-20 lg:hidden transition-all duration-300 ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                    }`}
                onClick={toggleSidebar}
            ></div>

            <Sidebar isOpen={isSidebarOpen} />

            <div className="flex-1 flex flex-col min-w-0">
                <Header onMenuClick={toggleSidebar} />
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
