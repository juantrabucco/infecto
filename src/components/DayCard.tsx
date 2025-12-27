import React from 'react';
import { DaySchedule } from '../types';
import { AREAS, DAY_NAMES } from '../constants';
import { Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface DayCardProps {
  daySchedule: DaySchedule;
  onClick?: () => void;
}

export const DayCard: React.FC<DayCardProps> = ({ daySchedule, onClick }) => {
  const date = new Date(daySchedule.date);
  const dayNumber = date.getDate();
  const dayName = DAY_NAMES[daySchedule.dayOfWeek];

  // Crear un mapa de asignaciones por área
  const areaMap = new Map<string, string>();
  daySchedule.assignments.forEach(assignment => {
    areaMap.set(assignment.area, assignment.doctorName);
  });

  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-lg border-2 p-4 transition-all duration-200
        ${daySchedule.isComplete 
          ? 'border-emerald-200 bg-emerald-50 hover:border-emerald-300 hover:shadow-md' 
          : 'border-rose-200 bg-rose-50 hover:border-rose-300 hover:shadow-md'
        }
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      {/* Header del día */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary-600" />
          <span className="text-sm font-medium text-primary-700">{dayName}</span>
          <span className="text-2xl font-bold text-primary-900">{dayNumber}</span>
        </div>
        
        {/* Indicador de estado */}
        {daySchedule.isComplete ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-rose-600" />
        )}
      </div>

      {/* Asignaciones por área */}
      <div className="space-y-2">
        {AREAS.map(area => (
          <div 
            key={area}
            className="rounded-md bg-white/60 px-3 py-2 border border-gray-200"
          >
            <div className="text-xs font-semibold text-primary-500 uppercase tracking-wide mb-1">
              {area}
            </div>
            {areaMap.has(area) ? (
              <div className="text-sm font-medium text-primary-900">
                {areaMap.get(area)}
              </div>
            ) : (
              <div className="text-sm text-gray-400 italic">
                Sin asignar
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Badge de advertencia si incompleto */}
      {!daySchedule.isComplete && (
        <div className="mt-3 pt-2 border-t border-rose-200">
          <span className="text-xs font-medium text-rose-700">
            ⚠️ Cobertura incompleta ({daySchedule.assignments.length}/3)
          </span>
        </div>
      )}
    </div>
  );
};

