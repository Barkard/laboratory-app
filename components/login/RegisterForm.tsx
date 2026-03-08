'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/utils/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Icon from '../ui/Icon';

const RegisterForm: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        cedula: '',
        nombre: '',
        apellido: '',
        correo: '',
        telefono: ''
    });

    const [errors, setErrors] = useState({
        nombre: '',
        apellido: '',
        correo: '',
        telefono: ''
    });

    useEffect(() => {
        const cedulaFromQuery = searchParams.get('cedula');
        if (cedulaFromQuery) {
            setFormData(prev => ({ ...prev, cedula: cedulaFromQuery }));
        }
    }, [searchParams]);

    const validateField = (name: string, value: string) => {
        let error = '';
        if (!value.trim()) {
            error = 'Este campo es obligatorio';
        } else if (name === 'correo' && !/\S+@\S+\.\S+/.test(value)) {
            error = 'Correo electrónico no válido';
        } else if (name === 'telefono' && !/^[0-9]{10,11}$/.test(value.replace(/\s/g, ''))) {
            error = 'Número de teléfono no válido (10-11 dígitos)';
        }
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    const isFormValid = () => {
        return (
            formData.cedula &&
            formData.nombre &&
            formData.apellido &&
            formData.correo &&
            formData.telefono &&
            Object.values(errors).every(err => err === '')
        );
    };

    const [apiError, setApiError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid()) return;

        setIsLoading(true);
        setApiError(null);

        try {
            await apiFetch('/auth/register', {
                method: 'POST',
                body: JSON.stringify(formData),
            });

            console.log('Registration successful, redirecting to login');
            router.push('/');
        } catch (error: any) {
            console.error('Registration error:', error);
            setApiError(error.message || 'Error al registrar el usuario');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            {apiError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                    {apiError}
                </div>
            )}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                    <Icon name="user-plus" type="solid" size="lg" className="text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Registro de Usuario</h1>
                <p className="text-gray-500 mt-2">Complete sus datos para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Cédula de Identidad"
                    name="cedula"
                    type="text"
                    value={formData.cedula}
                    readOnly
                    required
                    leftIcon={<Icon name="id-card" size="sm" />}
                />

                <Input
                    label="Correo Electrónico"
                    name="correo"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={formData.correo}
                    onChange={handleChange}
                    error={errors.correo}
                    required
                    leftIcon={<Icon name="envelope" size="sm" />}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Nombre"
                        name="nombre"
                        type="text"
                        placeholder="Ej: Juan"
                        value={formData.nombre}
                        onChange={handleChange}
                        error={errors.nombre}
                        required
                        leftIcon={<Icon name="user" size="sm" />}
                    />
                    <Input
                        label="Apellido"
                        name="apellido"
                        type="text"
                        placeholder="Ej: Pérez"
                        value={formData.apellido}
                        onChange={handleChange}
                        error={errors.apellido}
                        required
                        leftIcon={<Icon name="user" size="sm" />}
                    />
                </div>

                <Input
                    label="Número de Teléfono"
                    name="telefono"
                    type="tel"
                    placeholder="Ej: 04121234567"
                    value={formData.telefono}
                    onChange={handleChange}
                    error={errors.telefono}
                    required
                    leftIcon={<Icon name="phone" size="sm" />}
                />

                <Button
                    type="submit"
                    className="w-full mt-6"
                    isLoading={isLoading}
                    disabled={!isFormValid()}
                    rightIcon={<Icon name="check" size="sm" />}
                >
                    Finalizar Registro
                </Button>

                <div className="mt-4 text-center">
                    <button
                        type="button"
                        onClick={() => router.push('/')}
                        className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                    >
                        <Icon name="left-arrow-alt" size="xs" />
                        Volver al Inicio de Sesión
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterForm;
