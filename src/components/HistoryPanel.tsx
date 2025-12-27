import React, { useState, useEffect } from 'react';
import { ScheduleHistory, loadHistory, deleteFromHistory, loadFromHistory } from '../services/storageService';
import { MonthSchedule } from '../types';
import { History, Trash2, Download, Calendar, Clock, X } from 'lucide-react';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSchedule: (schedule: MonthSchedule) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen,
  onClose,
  onLoadSchedule
}) => {
  const [history, setHistory] = useState<ScheduleHistory[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      refreshHistory();
    }
  }, [isOpen]);

  const refreshHistory = () => {
    const loaded = loadHistory();
    setHistory(loaded);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (window.confirm('¿Estás seguro de eliminar este cronograma del historial?')) {
      deleteFromHistory(id);
      refreshHistory();
    }
  };

  const handleLoad = (id: string) => {
    const schedule = loadFromHistory(id);
    if (schedule) {
      onLoadSchedule(schedule);
      onClose();
    }
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-accent-600 to-accent-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Historial de Cronogramas</h2>
              <p className="text-accent-100 text-sm">{history.length} cronogramas guardados</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <History className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No hay cronogramas guardados
              </h3>
              <p className="text-sm text-gray-500">
                Los cronogramas se guardarán automáticamente aquí cuando los generes
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleLoad(item.id)}
                  className={`
                    border-2 rounded-lg p-4 cursor-pointer transition-all
                    ${selectedId === item.id
                      ? 'border-accent-500 bg-accent-50'
                      : 'border-gray-200 hover:border-accent-300 hover:bg-gray-50'
                    }
                  `}
                  onMouseEnter={() => setSelectedId(item.id)}
                  onMouseLeave={() => setSelectedId(null)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Título */}
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-accent-600" />
                        <h3 className="text-lg font-semibold text-primary-900">
                          {item.label}
                        </h3>
                      </div>

                      {/* Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Guardado:</span>
                          <div className="flex items-center gap-1 text-gray-700 font-medium">
                            <Clock className="w-4 h-4" />
                            {formatDate(item.savedAt)}
                          </div>
                        </div>

                        <div>
                          <span className="text-gray-500">Días laborables:</span>
                          <div className="text-gray-700 font-medium">
                            {item.schedule.days.length} días
                          </div>
                        </div>

                        <div>
                          <span className="text-gray-500">Días completos:</span>
                          <div className="text-gray-700 font-medium">
                            {item.schedule.days.filter(d => d.isComplete).length} / {item.schedule.days.length}
                          </div>
                        </div>

                        <div>
                          <span className="text-gray-500">Asignaciones totales:</span>
                          <div className="text-gray-700 font-medium">
                            {item.schedule.days.reduce((sum, d) => sum + d.assignments.length, 0)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={(e) => handleLoad(item.id)}
                        className="px-4 py-2 bg-accent-600 text-white rounded-lg font-medium hover:bg-accent-700 transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Cargar
                      </button>
                      
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="px-4 py-2 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {/* Vista previa */}
                  {selectedId === item.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Vista previa (primeros 5 días):</p>
                      <div className="grid grid-cols-5 gap-2">
                        {item.schedule.days.slice(0, 5).map((day, index) => (
                          <div
                            key={index}
                            className={`
                              text-xs p-2 rounded border
                              ${day.isComplete
                                ? 'bg-emerald-50 border-emerald-200'
                                : 'bg-rose-50 border-rose-200'
                              }
                            `}
                          >
                            <div className="font-semibold text-center mb-1">
                              {new Date(day.date).getDate()}
                            </div>
                            <div className="text-center text-gray-600">
                              {day.assignments.length}/3
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                💡 <strong>Tip:</strong> Haz clic en un cronograma para cargarlo
              </span>
              <span>
                Límite: 50 cronogramas
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

