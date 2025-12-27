import React from 'react';
import { DOCTORS, AREAS, INITIAL_CONSTRAINTS, DAY_NAMES } from '../constants';
import { Users, MapPin, Shield, Calendar } from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Logo / Header */}
        <div className="text-center pb-6 border-b border-gray-200">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-100 mb-3">
            <Calendar className="w-8 h-8 text-accent-600" />
          </div>
          <h1 className="text-2xl font-bold text-primary-900">InfectoPlan</h1>
          <p className="text-sm text-gray-500 mt-1">Sistema de Gestión de Guardias</p>
        </div>

        {/* Personal médico */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-primary-800">Personal Médico</h2>
          </div>
          <div className="space-y-2">
            {DOCTORS.map(doctor => (
              <div
                key={doctor.id}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
              >
                <div className="font-medium text-primary-900">{doctor.name}</div>
                <div className="text-xs text-gray-600 mt-1">{doctor.specialty}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {doctor.availableDays.map(day => (
                    <span
                      key={day}
                      className="inline-block px-2 py-1 text-xs font-medium bg-accent-100 text-accent-700 rounded"
                    >
                      {DAY_NAMES[day]}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Áreas de cobertura */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-primary-800">Áreas de Cobertura</h2>
          </div>
          <div className="space-y-2">
            {AREAS.map((area, index) => (
              <div
                key={area}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent-600 text-white text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="font-medium text-primary-900 text-sm">{area}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Restricciones activas */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-primary-800">Restricciones Activas</h2>
          </div>
          <div className="space-y-2">
            {INITIAL_CONSTRAINTS.filter(c => c.active).map(constraint => (
              <div
                key={constraint.id}
                className={`rounded-lg p-3 border-2 ${
                  constraint.type === 'HARD'
                    ? 'bg-rose-50 border-rose-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className={`text-xs font-bold uppercase tracking-wide ${
                    constraint.type === 'HARD' ? 'text-rose-600' : 'text-blue-600'
                  }`}>
                    {constraint.id}
                  </span>
                  {constraint.weight && (
                    <span className={`text-xs font-medium ${
                      constraint.weight > 0 ? 'text-emerald-600' : 'text-orange-600'
                    }`}>
                      {constraint.weight > 0 ? '+' : ''}{constraint.weight}
                    </span>
                  )}
                </div>
                <div className="text-xs font-medium text-gray-700 mb-1">
                  {constraint.name}
                </div>
                <div className="text-xs text-gray-600">
                  {constraint.description}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Leyenda */}
        <section className="text-xs text-gray-500 space-y-2 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-rose-200 border-2 border-rose-300"></div>
            <span>Restricción Dura (obligatoria)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-200 border-2 border-blue-300"></div>
            <span>Restricción Blanda (preferencia)</span>
          </div>
        </section>
      </div>
    </aside>
  );
};

