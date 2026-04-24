import React, { useEffect, useState } from 'react';
import { formatFullName } from '@/utils/formatters';
import Icon from '@/components/ui/Icon';

interface HeaderProps {
    onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('lab_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, []);

    const roleName = user?.role?.name || (user?.id_role === 1 ? 'Administrador' : 'Usuario');

    return (
        <header className="h-20 bg-slate-950/20 backdrop-blur-md border-b border-white/5 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10 font-sans">
            <div className="flex items-center space-x-4">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={onMenuClick}
                    className="p-2 text-slate-400 hover:bg-white/5 rounded-lg lg:hidden transition-colors"
                    aria-label="Menu"
                >
                    <Icon name="menu" size="md" />
                </button>

                <div className="hidden xs:block">
                    <p className="text-sm text-slate-400 hidden sm:block">Gestión Laboratorio</p>
                </div>
            </div>

            <div className="flex items-center space-x-3 md:space-x-6">
                <button className="relative p-2 text-slate-400 hover:text-sky-400 transition-colors">
                    <Icon name="bell" size="sm" />
                </button>

                <div className="flex items-center space-x-3 pl-3 md:pl-6 border-l border-white/10">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-white">
                            {user
                                ? formatFullName(user.first_name, user.last_name)
                                : 'Cargando...'}
                        </p>
                        <p className="text-xs text-slate-400 capitalize">{roleName}</p>
                    </div>
                    <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-sky-400 overflow-hidden shrink-0">
                        <i className="bx bx-smile text-3xl" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

