import { useState, useEffect } from 'react';
import { MonthSchedule, DaySchedule } from './types';
import { MONTH_NAMES } from './constants';
import { generateSchedule, validateSchedule } from './services/scheduler';
import { saveSchedule, loadSchedule, exportScheduleAsJSON } from './services/storageService';
import { Sidebar } from './components/Sidebar';
import { CalendarGrid } from './components/CalendarGrid';
import { AssignmentModal } from './components/AssignmentModal';
import { 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  CheckCircle2, 
  XCircle,
  Sparkles
} from 'lucide-react';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthSchedule, setMonthSchedule] = useState<MonthSchedule | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DaySchedule | null>(null);
  const [validationStatus, setValidationStatus] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);

  // Cargar cronograma guardado al iniciar
  useEffect(() => {
    const saved = loadSchedule();
    if (saved) {
      setMonthSchedule(saved);
      setCurrentDate(new Date(saved.year, saved.month, 1));
    }
  }, []);

  const handleGenerateSchedule = () => {
    setIsProcessing(true);
    setValidationStatus(null);

    // Simular procesamiento (para UX)
    setTimeout(() => {
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();

      const schedule = generateSchedule(month, year);
      
      const newMonthSchedule: MonthSchedule = {
        month,
        year,
        days: schedule,
        generatedAt: new Date().toISOString()
      };

      setMonthSchedule(newMonthSchedule);
      saveSchedule(newMonthSchedule);

      // Validar
      const validation = validateSchedule(schedule);
      setValidationStatus({
        isValid: validation.isValid,
        message: validation.isValid 
          ? '✅ Cronograma válido - Todas las restricciones cumplidas'
          : `❌ ${validation.errors.length} errores detectados`
      });

      setIsProcessing(false);

      // Log de auditoría
      console.log('📊 REPORTE DE VALIDACIÓN:');
      console.log('Errores:', validation.errors);
      console.log('Advertencias:', validation.warnings);
    }, 1000);
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
    setMonthSchedule(null);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
    setMonthSchedule(null);
  };

  const handleExport = () => {
    if (monthSchedule) {
      exportScheduleAsJSON(monthSchedule);
    }
  };

  const handleDayClick = (day: DaySchedule) => {
    setSelectedDay(day);
  };

  const handleSaveManualEdit = (updatedAssignments: any[]) => {
    if (!monthSchedule || !selectedDay) return;

    const updatedDays = monthSchedule.days.map(day => {
      if (day.date === selectedDay.date) {
        return {
          ...day,
          assignments: updatedAssignments,
          isComplete: updatedAssignments.length === 3
        };
      }
      return day;
    });

    const updatedSchedule: MonthSchedule = {
      ...monthSchedule,
      days: updatedDays
    };

    setMonthSchedule(updatedSchedule);
    saveSchedule(updatedSchedule);
    setSelectedDay(null);

    // Re-validar
    const validation = validateSchedule(updatedDays);
    setValidationStatus({
      isValid: validation.isValid,
      message: validation.isValid 
        ? '✅ Cronograma válido'
        : `❌ ${validation.errors.length} errores detectados`
    });
  };

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const displaySchedule = monthSchedule?.month === month && monthSchedule?.year === year
    ? monthSchedule.days
    : [];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header con controles */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Navegación de mes */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePreviousMonth}
                  className="p-2 rounded-lg border-2 border-gray-300 hover:bg-gray-100 transition-colors"
                  title="Mes anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="min-w-[200px] text-center">
                  <h2 className="text-2xl font-bold text-primary-900">
                    {MONTH_NAMES[month]} {year}
                  </h2>
                </div>

                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-lg border-2 border-gray-300 hover:bg-gray-100 transition-colors"
                  title="Mes siguiente"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleGenerateSchedule}
                  disabled={isProcessing}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-lg font-semibold
                    transition-all duration-200 shadow-md
                    ${isProcessing 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white hover:shadow-lg'
                    }
                  `}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Reasignar Turnos
                    </>
                  )}
                </button>

                {displaySchedule.length > 0 && (
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium border-2 border-gray-300 hover:bg-gray-50 transition-colors"
                    title="Exportar cronograma"
                  >
                    <Download className="w-5 h-5" />
                    Exportar
                  </button>
                )}
              </div>
            </div>

            {/* Estado de validación */}
            {validationStatus && (
              <div className={`
                mt-4 p-4 rounded-lg flex items-center gap-3
                ${validationStatus.isValid 
                  ? 'bg-emerald-50 border-2 border-emerald-200' 
                  : 'bg-rose-50 border-2 border-rose-200'
                }
              `}>
                {validationStatus.isValid ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
                )}
                <span className={`font-medium ${
                  validationStatus.isValid ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {validationStatus.message}
                </span>
              </div>
            )}
          </div>

          {/* Calendario */}
          <CalendarGrid
            schedule={displaySchedule}
            month={month}
            year={year}
            onDayClick={handleDayClick}
          />
        </div>
      </main>

      {/* Modal de edición */}
      {selectedDay && (
        <AssignmentModal
          daySchedule={selectedDay}
          isOpen={true}
          onClose={() => setSelectedDay(null)}
          onSave={handleSaveManualEdit}
        />
      )}
    </div>
  );
}

export default App;

