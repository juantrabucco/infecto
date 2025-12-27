import React, { useState, useEffect } from 'react';
import { Doctor, DayOfWeek } from '../types';
import { loadDoctorsConfig, saveDoctorsConfig, resetDoctorsConfig, getDoctorStats } from '../services/doctorsService';
import { 
  Users, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  RotateCcw,
  Calendar,
  Briefcase,
  AlertCircle
} from 'lucide-react';

interface DoctorsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onDoctorsChange: (doctors: Doctor[]) => void;
}

const DAY_NAMES: Record<DayOfWeek, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado'
};

const WORKDAYS: DayOfWeek[] = [1, 2, 3, 4, 5]; // Lunes a Viernes

export const DoctorsManager: React.FC<DoctorsManagerProps> = ({ 
  isOpen, 
  onClose, 
  onDoctorsChange 
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Doctor | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loaded = loadDoctorsConfig();
      setDoctors(loaded);
    }
  }, [isOpen]);

  const handleEdit = (doctor: Doctor) => {
    setEditingId(doctor.id);
    setEditForm({ ...doctor });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleSaveEdit = () => {
    if (!editForm) return;

    const updated = doctors.map(d => 
      d.id === editForm.id ? editForm : d
    );
    
    setDoctors(updated);
    saveDoctorsConfig(updated);
    onDoctorsChange(updated);
    
    setEditingId(null);
    setEditForm(null);
    setHasChanges(false);
  };

  const handleToggleDay = (day: DayOfWeek) => {
    if (!editForm) return;

    const availableDays = editForm.availableDays.includes(day)
      ? editForm.availableDays.filter(d => d !== day)
      : [...editForm.availableDays, day].sort((a, b) => a - b);

    setEditForm({ ...editForm, availableDays });
  };

  const handleReset = () => {
    if (window.confirm('¿Restaurar configuración predeterminada de médicos? Se perderán todas las personalizaciones.')) {
      resetDoctorsConfig();
      const defaults = loadDoctorsConfig();
      setDoctors(defaults);
      saveDoctorsConfig(defaults);
      onDoctorsChange(defaults);
      setHasChanges(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Gestión de Médicos</h2>
                <p className="text-purple-200 text-sm">Personaliza disponibilidad y datos de cada profesional</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Info Box */}
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-purple-800">
                <p className="font-semibold mb-1">Configuración de Disponibilidad</p>
                <ul className="space-y-1 ml-4 list-disc">
                  <li>Selecciona los días que cada médico puede trabajar</li>
                  <li>Edita especialidades para mejorar las asignaciones automáticas</li>
                  <li>Los cambios se aplican al regenerar el cronograma</li>
                  <li>Las vacaciones se gestionan en el módulo separado</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Doctors List */}
          <div className="space-y-3">
            {doctors.map(doctor => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                isEditing={editingId === doctor.id}
                editForm={editForm}
                onEdit={handleEdit}
                onCancelEdit={handleCancelEdit}
                onSaveEdit={handleSaveEdit}
                onToggleDay={handleToggleDay}
                onUpdateField={(field, value) => {
                  if (editForm) {
                    setEditForm({ ...editForm, [field]: value });
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restaurar predeterminado
          </button>
          
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

interface DoctorCardProps {
  doctor: Doctor;
  isEditing: boolean;
  editForm: Doctor | null;
  onEdit: (doctor: Doctor) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onToggleDay: (day: DayOfWeek) => void;
  onUpdateField: (field: string, value: any) => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  isEditing,
  editForm,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onToggleDay,
  onUpdateField
}) => {
  const stats = getDoctorStats(doctor.id);
  const currentDoctor = isEditing && editForm ? editForm : doctor;

  return (
    <div className={`
      border-2 rounded-xl p-5 transition-all
      ${isEditing 
        ? 'border-purple-400 bg-purple-50 shadow-lg' 
        : 'border-gray-200 bg-white hover:border-purple-200 hover:shadow-md'
      }
    `}>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
          {doctor.name.charAt(0)}
        </div>

        {/* Content */}
        <div className="flex-1">
          {isEditing ? (
            // Edit Mode
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={currentDoctor.name}
                  onChange={(e) => onUpdateField('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ej: Dr. Juan Pérez"
                />
              </div>

              {/* Specialty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Especialidad
                </label>
                <input
                  type="text"
                  value={currentDoctor.specialty}
                  onChange={(e) => onUpdateField('specialty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ej: Infectología Clínica"
                />
              </div>

              {/* Available Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Días Disponibles (Lunes - Viernes)
                </label>
                <div className="flex gap-2 flex-wrap">
                  {WORKDAYS.map(day => (
                    <button
                      key={day}
                      onClick={() => onToggleDay(day)}
                      className={`
                        px-4 py-2 rounded-lg font-medium transition-all
                        ${currentDoctor.availableDays.includes(day)
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }
                      `}
                    >
                      {DAY_NAMES[day]}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Días seleccionados: {currentDoctor.availableDays.length}/5
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={onSaveEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </button>
                <button
                  onClick={onCancelEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{doctor.name}</h3>
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-sm">{doctor.specialty}</span>
                  </div>
                </div>
                <button
                  onClick={() => onEdit(doctor)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
              </div>

              {/* Available Days Display */}
              <div className="mb-3">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  Disponibilidad Semanal
                </label>
                <div className="flex gap-2 flex-wrap">
                  {WORKDAYS.map(day => (
                    <span
                      key={day}
                      className={`
                        px-3 py-1 rounded-full text-sm font-medium
                        ${doctor.availableDays.includes(day)
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-400 line-through'
                        }
                      `}
                    >
                      {DAY_NAMES[day]}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">
                    {stats.totalDaysAvailable} días disponibles
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="text-gray-600">
                    {stats.percentage.toFixed(0)}% disponibilidad
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

