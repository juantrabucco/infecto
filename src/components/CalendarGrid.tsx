import React from 'react';
import { DaySchedule } from '../types';
import { DayCard } from './DayCard';
import { MONTH_NAMES } from '../constants';

interface CalendarGridProps {
  schedule: DaySchedule[];
  month: number;
  year: number;
  onDayClick?: (day: DaySchedule) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  schedule,
  month,
  year,
  onDayClick
}) => {
  if (schedule.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-700 mb-2">
            No hay cronograma generado
          </p>
          <p className="text-sm text-gray-500">
            Haga clic en "Reasignar Turnos" para generar el cronograma del mes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header del mes */}
      <div className="bg-gradient-to-r from-accent-600 to-accent-700 rounded-lg px-6 py-4 shadow-md">
        <h2 className="text-2xl font-bold text-white text-center">
          {MONTH_NAMES[month]} {year}
        </h2>
        <p className="text-accent-100 text-center text-sm mt-1">
          {schedule.length} días laborables • {schedule.filter(d => d.isComplete).length} días completos
        </p>
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {schedule.map((daySchedule, index) => (
          <DayCard
            key={index}
            daySchedule={daySchedule}
            onClick={onDayClick ? () => onDayClick(daySchedule) : undefined}
          />
        ))}
      </div>

      {/* Resumen estadístico */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-primary-800 mb-4">Resumen del Mes</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Días Totales"
            value={schedule.length}
            color="blue"
          />
          <StatCard
            label="Días Completos"
            value={schedule.filter(d => d.isComplete).length}
            color="green"
          />
          <StatCard
            label="Días Incompletos"
            value={schedule.filter(d => !d.isComplete).length}
            color="red"
          />
          <StatCard
            label="Asignaciones"
            value={schedule.reduce((sum, d) => sum + d.assignments.length, 0)}
            color="purple"
          />
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  color: 'blue' | 'green' | 'red' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200'
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${colorClasses[color]}`}>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm font-medium opacity-80">{label}</div>
    </div>
  );
};

