import React, { useState, useEffect } from 'react';
import { Constraint } from '../types';
import { loadConstraints, saveConstraints } from '../services/storageService';
import { INITIAL_CONSTRAINTS } from '../constants';
import { 
  Settings, 
  ToggleLeft, 
  ToggleRight, 
  AlertTriangle, 
  CheckCircle2,
  Info,
  RotateCcw,
  Save
} from 'lucide-react';

interface RulesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onRulesChange: (constraints: Constraint[]) => void;
}

export const RulesManager: React.FC<RulesManagerProps> = ({ 
  isOpen, 
  onClose, 
  onRulesChange 
}) => {
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const loaded = loadConstraints();
    setConstraints(loaded && loaded.length > 0 ? loaded : INITIAL_CONSTRAINTS);
  }, [isOpen]);

  const handleToggle = (id: string) => {
    const updated = constraints.map(c => 
      c.id === id ? { ...c, active: !c.active } : c
    );
    setConstraints(updated);
    setHasChanges(true);
  };

  const handleWeightChange = (id: string, weight: number) => {
    const updated = constraints.map(c => 
      c.id === id ? { ...c, weight } : c
    );
    setConstraints(updated);
    setHasChanges(true);
  };

  const handleSave = () => {
    saveConstraints(constraints);
    onRulesChange(constraints);
    setHasChanges(false);
    alert('✅ Reglas guardadas correctamente. Regenere el cronograma para aplicar los cambios.');
  };

  const handleReset = () => {
    if (window.confirm('¿Restaurar configuración predeterminada? Se perderán los cambios personalizados.')) {
      setConstraints(INITIAL_CONSTRAINTS);
      saveConstraints(INITIAL_CONSTRAINTS);
      onRulesChange(INITIAL_CONSTRAINTS);
      setHasChanges(false);
    }
  };

  if (!isOpen) return null;

  const hardConstraints = constraints.filter(c => c.type === 'HARD');
  const softConstraints = constraints.filter(c => c.type === 'SOFT');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Gestión de Reglas</h2>
                <p className="text-indigo-200 text-sm">Personaliza las restricciones del sistema</p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Info Box */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">¿Cómo funcionan las reglas?</p>
                <ul className="space-y-1 ml-4 list-disc">
                  <li><strong>HARD:</strong> Restricciones obligatorias (errores si se violan)</li>
                  <li><strong>SOFT:</strong> Preferencias con peso numérico (se optimizan pero no son obligatorias)</li>
                  <li>Desactiva reglas temporalmente para situaciones especiales</li>
                  <li>Ajusta pesos para cambiar prioridades (mayor peso = mayor prioridad)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Hard Constraints */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h3 className="text-lg font-bold text-gray-800">Restricciones HARD</h3>
              <span className="text-sm text-gray-500">(Obligatorias cuando activas)</span>
            </div>
            <div className="space-y-3">
              {hardConstraints.map(constraint => (
                <ConstraintCard
                  key={constraint.id}
                  constraint={constraint}
                  onToggle={handleToggle}
                  onWeightChange={handleWeightChange}
                />
              ))}
            </div>
          </div>

          {/* Soft Constraints */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-bold text-gray-800">Restricciones SOFT</h3>
              <span className="text-sm text-gray-500">(Preferencias optimizables)</span>
            </div>
            <div className="space-y-3">
              {softConstraints.map(constraint => (
                <ConstraintCard
                  key={constraint.id}
                  constraint={constraint}
                  onToggle={handleToggle}
                  onWeightChange={handleWeightChange}
                />
              ))}
            </div>
          </div>

          {/* Warning about changes */}
          {hasChanges && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold">Hay cambios sin guardar</p>
                  <p>Guarda y regenera el cronograma para aplicar las nuevas reglas.</p>
                </div>
              </div>
            </div>
          )}
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
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg border-2 border-gray-300 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`
                flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors
                ${hasChanges
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              <Save className="w-4 h-4" />
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ConstraintCardProps {
  constraint: Constraint;
  onToggle: (id: string) => void;
  onWeightChange: (id: string, weight: number) => void;
}

const ConstraintCard: React.FC<ConstraintCardProps> = ({ 
  constraint, 
  onToggle, 
  onWeightChange 
}) => {
  return (
    <div className={`
      border-2 rounded-lg p-4 transition-all
      ${constraint.active 
        ? 'border-green-300 bg-green-50' 
        : 'border-gray-300 bg-gray-50'
      }
    `}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`
              px-2 py-0.5 rounded text-xs font-bold
              ${constraint.type === 'HARD' 
                ? 'bg-rose-100 text-rose-700' 
                : 'bg-blue-100 text-blue-700'
              }
            `}>
              {constraint.id}
            </span>
            <h4 className="font-semibold text-gray-800">{constraint.name}</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">{constraint.description}</p>
          
          {/* Weight Control (solo para SOFT) */}
          {constraint.type === 'SOFT' && constraint.active && (
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">
                Peso:
              </label>
              <input
                type="range"
                min="-100"
                max="200"
                step="10"
                value={constraint.weight || 0}
                onChange={(e) => onWeightChange(constraint.id, parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-bold text-gray-800 w-12 text-right">
                {constraint.weight || 0}
              </span>
            </div>
          )}
        </div>

        {/* Toggle Switch */}
        {constraint.editable !== false && (
          <button
            onClick={() => onToggle(constraint.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
              ${constraint.active
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-400 text-white hover:bg-gray-500'
              }
            `}
          >
            {constraint.active ? (
              <>
                <ToggleRight className="w-5 h-5" />
                Activa
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5" />
                Inactiva
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

