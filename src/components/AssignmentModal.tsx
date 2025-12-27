import React, { useState } from 'react';
import { DaySchedule, Assignment, AreaType } from '../types';
import { DOCTORS, AREAS } from '../constants';
import { X, Save, AlertTriangle } from 'lucide-react';

interface AssignmentModalProps {
  daySchedule: DaySchedule;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedAssignments: Assignment[]) => void;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  daySchedule,
  isOpen,
  onClose,
  onSave
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>(daySchedule.assignments);
  const [warnings, setWarnings] = useState<string[]>([]);

  if (!isOpen) return null;

  const date = new Date(daySchedule.date);
  const dateStr = date.toLocaleDateString('es-AR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleAssignmentChange = (area: AreaType, doctorId: string) => {
    const doctor = DOCTORS.find(d => d.id === doctorId);
    if (!doctor) return;

    const newAssignments = assignments.filter(a => a.area !== area);
    if (doctorId !== '') {
      newAssignments.push({
        doctorId: doctor.id,
        doctorName: doctor.name,
        area: area
      });
    }

    // Validar restricciones
    const newWarnings: string[] = [];
    
    // R1.4: Cristina y Agustina
    const hasCristina = newAssignments.some(a => a.doctorId === 'cristina');
    const hasAgustina = newAssignments.some(a => a.doctorId === 'agustina');
    if (hasCristina && hasAgustina) {
      newWarnings.push('⚠️ ADVERTENCIA: Cristina y Agustina no pueden trabajar juntas (R1.4)');
    }

    // R1.2: Disponibilidad
    const dayOfWeek = date.getDay();
    for (const assignment of newAssignments) {
      const doc = DOCTORS.find(d => d.id === assignment.doctorId);
      if (doc && !doc.availableDays.includes(dayOfWeek as any)) {
        newWarnings.push(`⚠️ ${doc.name} no está disponible este día`);
      }
    }

    // Duplicados
    const doctorIds = newAssignments.map(a => a.doctorId);
    const hasDuplicates = doctorIds.length !== new Set(doctorIds).size;
    if (hasDuplicates) {
      newWarnings.push('⚠️ No puede asignar el mismo médico a múltiples áreas');
    }

    setWarnings(newWarnings);
    setAssignments(newAssignments);
  };

  const handleSave = () => {
    if (warnings.filter(w => w.includes('ADVERTENCIA')).length > 0) {
      const confirm = window.confirm(
        'Hay restricciones críticas violadas. ¿Desea guardar de todas formas?'
      );
      if (!confirm) return;
    }

    onSave(assignments);
    onClose();
  };

  // Crear mapa de asignaciones actuales
  const areaMap = new Map<AreaType, string>();
  assignments.forEach(a => {
    areaMap.set(a.area, a.doctorId);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-accent-600 to-accent-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Editar Asignaciones</h2>
            <p className="text-accent-100 text-sm mt-1 capitalize">{dateStr}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="bg-rose-50 border-2 border-rose-200 rounded-lg p-4 space-y-2">
              {warnings.map((warning, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-rose-700">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          )}

          {/* Asignaciones por área */}
          <div className="space-y-4">
            {AREAS.map(area => (
              <div key={area} className="border-2 border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-semibold text-primary-700 mb-2">
                  {area}
                </label>
                <select
                  value={areaMap.get(area) || ''}
                  onChange={(e) => handleAssignmentChange(area, e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-accent-500 focus:ring-2 focus:ring-accent-200 outline-none transition-all"
                >
                  <option value="">Sin asignar</option>
                  {DOCTORS.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialty}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Info de disponibilidad */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">
              Médicos disponibles este día:
            </h3>
            <div className="flex flex-wrap gap-2">
              {DOCTORS.filter(d => d.availableDays.includes(date.getDay() as any)).map(doctor => (
                <span
                  key={doctor.id}
                  className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-full"
                >
                  {doctor.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-accent-600 text-white rounded-lg font-medium hover:bg-accent-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

