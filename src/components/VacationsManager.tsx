import React, { useState, useEffect } from 'react';
import { Vacation, Doctor } from '../types';
import { 
  loadVacations, 
  addVacation, 
  deleteVacation, 
  getVacationsInRange 
} from '../services/vacationsService';
import { loadDoctorsConfig } from '../services/doctorsService';
import { 
  Plane, 
  Plus, 
  Trash2, 
  Calendar,
  User,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface VacationsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonth: number;
  currentYear: number;
}

export const VacationsManager: React.FC<VacationsManagerProps> = ({ 
  isOpen, 
  onClose,
  currentMonth,
  currentYear
}) => {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVacation, setNewVacation] = useState({
    doctorId: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    if (isOpen) {
      setVacations(loadVacations());
      setDoctors(loadDoctorsConfig());
    }
  }, [isOpen]);

  const handleAdd = () => {
    if (!newVacation.doctorId || !newVacation.startDate || !newVacation.endDate) {
      alert('⚠️ Complete todos los campos obligatorios');
      return;
    }

    const doctor = doctors.find(d => d.id === newVacation.doctorId);
    if (!doctor) return;

    const vacation = addVacation({
      doctorId: newVacation.doctorId,
      doctorName: doctor.name,
      startDate: newVacation.startDate,
      endDate: newVacation.endDate,
      reason: newVacation.reason
    });

    setVacations([...vacations, vacation]);
    setNewVacation({ doctorId: '', startDate: '', endDate: '', reason: '' });
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Eliminar esta vacación?')) {
      deleteVacation(id);
      setVacations(vacations.filter(v => v.id !== id));
    }
  };

  // Filtrar vacaciones relevantes para el mes actual
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const relevantVacations = getVacationsInRange(
    firstDayOfMonth.toISOString(),
    lastDayOfMonth.toISOString()
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Plane className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Gestión de Vacaciones</h2>
                <p className="text-cyan-200 text-sm">Períodos de ausencia programados</p>
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
          <div className="bg-cyan-50 border-l-4 border-cyan-500 p-4 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-cyan-800">
                <p className="font-semibold mb-1">¿Cómo funcionan las vacaciones?</p>
                <ul className="space-y-1 ml-4 list-disc">
                  <li>Los médicos de vacaciones no serán asignados en esas fechas</li>
                  <li>Se aplica automáticamente al regenerar el cronograma</li>
                  <li>Puedes programar vacaciones con anticipación</li>
                  <li>Las vacaciones afectan la disponibilidad diaria</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Current Month Alert */}
          {relevantVacations.length > 0 && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold">
                    ⚠️ {relevantVacations.length} vacación(es) en el mes actual
                  </p>
                  <p className="mt-1">Regenera el cronograma para aplicar los cambios</p>
                </div>
              </div>
            </div>
          )}

          {/* Add Button */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-semibold"
            >
              <Plus className="w-5 h-5" />
              Añadir Nueva Vacación
            </button>
          )}

          {/* Add Form */}
          {showAddForm && (
            <div className="bg-cyan-50 border-2 border-cyan-300 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-800">Nueva Vacación</h3>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewVacation({ doctorId: '', startDate: '', endDate: '', reason: '' });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>

              {/* Doctor Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Médico *
                </label>
                <select
                  value={newVacation.doctorId}
                  onChange={(e) => setNewVacation({ ...newVacation, doctorId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">Seleccionar médico...</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialty}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Inicio *
                  </label>
                  <input
                    type="date"
                    value={newVacation.startDate}
                    onChange={(e) => setNewVacation({ ...newVacation, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Fin *
                  </label>
                  <input
                    type="date"
                    value={newVacation.endDate}
                    onChange={(e) => setNewVacation({ ...newVacation, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo (opcional)
                </label>
                <input
                  type="text"
                  value={newVacation.reason}
                  onChange={(e) => setNewVacation({ ...newVacation, reason: e.target.value })}
                  placeholder="Ej: Vacaciones anuales, licencia médica..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleAdd}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Guardar Vacación
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewVacation({ doctorId: '', startDate: '', endDate: '', reason: '' });
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Vacations List */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-600" />
              Vacaciones Programadas ({vacations.length})
            </h3>
            
            {vacations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Plane className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No hay vacaciones programadas</p>
                <p className="text-sm mt-1">Añade la primera para comenzar</p>
              </div>
            ) : (
              vacations
                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                .map(vacation => (
                  <VacationCard
                    key={vacation.id}
                    vacation={vacation}
                    onDelete={handleDelete}
                    isRelevant={relevantVacations.some(v => v.id === vacation.id)}
                  />
                ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 border-t border-gray-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

interface VacationCardProps {
  vacation: Vacation;
  onDelete: (id: string) => void;
  isRelevant: boolean;
}

const VacationCard: React.FC<VacationCardProps> = ({ vacation, onDelete, isRelevant }) => {
  const startDate = new Date(vacation.startDate);
  const endDate = new Date(vacation.endDate);
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-AR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className={`
      border-2 rounded-lg p-4 transition-all
      ${isRelevant 
        ? 'border-amber-400 bg-amber-50' 
        : 'border-gray-200 bg-white'
      }
    `}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-gray-600" />
            <h4 className="font-semibold text-gray-800">{vacation.doctorName}</h4>
            {isRelevant && (
              <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-bold rounded">
                ESTE MES
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDate(startDate)} → {formatDate(endDate)}
            </span>
            <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
              {days} {days === 1 ? 'día' : 'días'}
            </span>
          </div>
          
          {vacation.reason && (
            <p className="text-sm text-gray-500 italic">
              "{vacation.reason}"
            </p>
          )}
        </div>

        <button
          onClick={() => onDelete(vacation.id)}
          className="flex items-center gap-1 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Eliminar
        </button>
      </div>
    </div>
  );
};

