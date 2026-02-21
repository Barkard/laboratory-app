'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/Icon';

interface SidebarItemProps {
    href: string;
    icon: string;
    label: string;
    active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ href, icon, label, active }) => (
    <Link
        href={href}
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
    >
        <Icon name={icon} type={active ? 'solid' : 'regular'} size="sm" />
        <span className="font-medium">{label}</span>
    </Link>
);

interface SidebarProps {
    isOpen?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    const pathname = usePathname();

    return (
        <aside
            className={`
                fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-100 flex flex-col h-screen transition-transform duration-300 transform
                lg:translate-x-0 lg:static lg:inset-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
        >
            <div className="p-6">
                <div className="flex items-center space-x-3 mb-10">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                        <Icon name="flask" size="md" />
                    </div>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">LabSystem</span>
                </div>

                <nav className="space-y-2">
                    <SidebarItem
                        href="/dashboard"
                        icon="grid-alt"
                        label="Dashboard"
                        active={pathname === '/dashboard'}
                    />
                    <SidebarItem
                        href="/dashboard/appointments"
                        icon="calendar"
                        label="Citas"
                        active={pathname === '/dashboard/appointments'}
                    />
                    <SidebarItem
                        href="/dashboard/exams"
                        icon="vial"
                        label="Exámenes"
                        active={pathname === '/dashboard/exams'}
                    />
                    <SidebarItem
                        href="/dashboard/results"
                        icon="file-find"
                        label="Resultados"
                        active={pathname === '/dashboard/results'}
                    />
                    <SidebarItem
                        href="/dashboard/users"
                        icon="group"
                        label="Usuarios"
                        active={pathname === '/dashboard/users'}
                    />
                </nav>
            </div>

            <div className="mt-auto p-6 space-y-2">
                <SidebarItem
                    href="/dashboard/settings"
                    icon="cog"
                    label="Configuración"
                    active={pathname === '/dashboard/settings'}
                />
                <Link
                    href="/"
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                    <Icon name="log-out" size="sm" />
                    <span className="font-medium">Salir</span>
                </Link>
            </div>
        </aside>
    );
};

export default Sidebar;
