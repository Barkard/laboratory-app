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
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors duration-200 ${active
            ? 'bg-linear-to-r from-sky-500 to-sky-600 text-white shadow-md'
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-sky-400'
            }`}
    >
        <Icon name={icon} size="sm" />
        <span className="font-semibold">{label}</span>
    </Link>
);

interface SidebarProps {
    isOpen?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    const pathname = usePathname();
    const [user, setUser] = React.useState<any>(null);

    React.useEffect(() => {
        const storedUser = localStorage.getItem('lab_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, []);

    const isAdmin = user?.id_role === 1;

    const handleLogout = () => {
        localStorage.removeItem('lab_user');
        window.location.href = '/';
    };

    return (
        <aside
            className={`
                fixed inset-y-0 left-0 z-30 w-64 bg-slate-950/65  backdrop-blur-xl border-r border-white/5 flex flex-col h-screen transition-transform duration-300 transform
                lg:translate-x-0 lg:static lg:inset-0 
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
        >
            <div className="p-6">
                <div className="flex items-center space-x-3 mb-10">
                    <div className="w-10 h-10 bg-linear-to-br from-sky-400 to-sky-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                        <Icon name="flask" size="md" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">LabSystem</span>
                </div>

                <nav className="space-y-2">
                    {/* Items visibles solo para Admin */}
                    {isAdmin && (
                        <>
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
                                icon="book"
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
                                icon="user"
                                label="Usuarios"
                                active={pathname === '/dashboard/users'}
                            />
                        </>
                    )}

                    {/* Si es paciente, la Vista Paciente es su 'Inicio' y va al principio */}
                    {!isAdmin && user && (
                        <SidebarItem
                            href="/dashboard/patient"
                            icon="home-alt"
                            label="Inicio"
                            active={pathname === '/dashboard/patient'}
                        />
                    )}
                </nav>
            </div>

            <div className="mt-auto p-6 space-y-2">
                {/* Vista Paciente para Admin (como vista de control) */}
                {isAdmin && (
                    <SidebarItem
                        href="/dashboard/patient"
                        icon="user-circle"
                        label="Vista Paciente"
                        active={pathname === '/dashboard/patient'}
                    />
                )}

                <SidebarItem
                    href="/dashboard/settings"
                    icon="cog"
                    label="Configuración"
                    active={pathname === '/dashboard/settings'}
                />
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors duration-200"
                >
                    <Icon name="log-out" size="sm" />
                    <span className="font-medium text-sm text-left">Salir</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
