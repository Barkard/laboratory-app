import React from 'react';
import Icon from '@/components/ui/Icon';

interface HeaderProps {
    onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    return (
        <header className="h-20 bg-white border-b border-gray-100 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10 font-sans">
            <div className="flex items-center space-x-4">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={onMenuClick}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden transition-colors"
                    aria-label="Menu"
                >
                    <Icon name="menu" size="md" />
                </button>

                <div className="hidden xs:block">
                    <h2 className="text-xl font-bold text-gray-800">Panel Principal</h2>
                    <p className="text-sm text-gray-500 hidden sm:block">Gestión de Laboratorio</p>
                </div>
            </div>

            <div className="flex items-center space-x-3 md:space-x-6">
                <button className="relative p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Icon name="bell" size="sm" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="flex items-center space-x-3 pl-3 md:pl-6 border-l border-gray-100">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-gray-900">Dr. Leon Pineda</p>
                        <p className="text-xs text-gray-500">Administrador</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 overflow-hidden shrink-0">
                        <Icon name="user" type="solid" size="md" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
