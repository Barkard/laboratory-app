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
        <div className="relative flex h-screen bg-linear-to-br from-blue-500 via-cyan-700 to-emerald-800 overflow-hidden">
            {/* Background Texture & Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Laboratory Grid Texture */}
                <div
                    className="absolute inset-0 opacity-[0.1] text-cyan-100"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, currentColor 1px, transparent 1px),
                            linear-gradient(to bottom, currentColor 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px'
                    }}
                />

                {/* Glow Effects */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-400/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[0%] right-[-5%] w-[30%] h-[30%] bg-emerald-400/10 blur-[100px] rounded-full" />
            </div>

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
