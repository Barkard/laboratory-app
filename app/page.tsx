import React from 'react';
import Image from 'next/image';
import LoginForm from '@/components/login/LoginForm';
import Icon from '@/components/ui/Icon';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Left side: Visual/Marketing - Hidden on mobile */}
      <div className="hidden md:flex md:w-1/2 bg-blue-600 relative overflow-hidden items-center justify-center p-12">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/login.jpg"
            alt="Laboratory Background"
            fill
            className="object-cover opacity-30 mix-blend-overlay"
            priority
          />
        </div>

        <div className="absolute top-0 left-0 w-full h-full opacity-10 z-0">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-white blur-2xl"></div>
        </div>

        <div className="relative z-10 text-white max-w-lg">
          <div className="flex items-center space-x-3 mb-8">
            <Icon name="flask" size="xl" className="text-blue-200" />
            <span className="text-3xl font-bold tracking-tight">Laboratorio</span>
          </div>
          <h2 className="text-4xl font-extrabold mb-6 leading-tight">
            Hostipal Carlos Roa Moreno
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <Icon name="check-circle" className="text-blue-300 mt-1" />
              <div>
                <h4 className="font-semibold">Seguro</h4>
                <p className="text-sm text-blue-200">Resultados en tiempo real</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Icon name="bolt" className="text-blue-300 mt-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <LoginForm />
      </div>
    </main>
  );
}
