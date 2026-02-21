'use client';

import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Icon from '../ui/Icon';
import { useRouter } from 'next/navigation';

const LoginForm: React.FC = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [identityCard, setIdentityCard] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            console.log('Login attempt with identityCard:', identityCard);
            router.push('/dashboard');
        }, 1500);
    };

    return (
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                    <Icon name="user-detail" type="solid" size="lg" className="text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Bienvenido</h1>
                <p className="text-gray-500 mt-2">Ingrese su documento para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="Cédula de Identidad"
                    type="text"
                    placeholder="Ej: 12345678"
                    required
                    value={identityCard}
                    onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        target.value = target.value.replace(/[^0-9]/g, '');
                        setIdentityCard(target.value);
                    }}
                    leftIcon={<Icon name="id-card" size="sm" />}
                />

                <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                        <span className="text-sm text-gray-600">Recordarme</span>
                    </label>
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    isLoading={isLoading}
                    rightIcon={<Icon name="right-arrow-alt" size="sm" />}
                >
                    Entrar al Sistema
                </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-600">
                    ¿Problemas para ingresar?{' '}
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                        Contacta a soporte
                    </a>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;
