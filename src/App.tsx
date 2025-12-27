import { useState, useEffect, useRef } from 'react';
import { MonthSchedule, DaySchedule, Constraint, Doctor } from './types';
import { MONTH_NAMES } from './constants';
import { generateSchedule, validateSchedule } from './services/scheduler';
import { saveSchedule, loadSchedule, exportScheduleAsJSON, loadConstraints } from './services/storageService';
import { exportScheduleAsICS, exportDoctorScheduleAsICS, exportScheduleAsCSV } from './services/calendarExportService';
import { loadDoctorsConfig } from './services/doctorsService';
import { Sidebar } from './components/Sidebar';
import { CalendarGrid } from './components/CalendarGrid';
import { AssignmentModal } from './components/AssignmentModal';
import { HistoryPanel } from './components/HistoryPanel';
import { RulesManager } from './components/RulesManager';
import { DoctorsManager } from './components/DoctorsManager';
import { VacationsManager } from './components/VacationsManager';
import html2canvas from 'html2canvas';
import { 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  CheckCircle2, 
  XCircle,
  Sparkles,
  Camera,
  History,
  FileText,
  Calendar as CalendarIcon,
  Settings,
  Users,
  Plane
} from 'lucide-react';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthSchedule, setMonthSchedule] = useState<MonthSchedule | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DaySchedule | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showDoctorExportMenu, setShowDoctorExportMenu] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showRulesManager, setShowRulesManager] = useState(false);
  const [showDoctorsManager, setShowDoctorsManager] = useState(false);
  const [showVacationsManager, setShowVacationsManager] = useState(false);
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [validationStatus, setValidationStatus] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);
  
  const calendarRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Cargar cronograma guardado al iniciar
  useEffect(() => {
    const saved = loadSchedule();
    if (saved) {
      setMonthSchedule(saved);
      setCurrentDate(new Date(saved.year, saved.month, 1));
    }
    
    // Cargar constraints y doctors
    const loadedConstraints = loadConstraints();
    setConstraints(loadedConstraints || []);
    setDoctors(loadDoctorsConfig());
  }, []);

  // Cerrar menús al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
        setShowDoctorExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGenerateSchedule = () => {
    setIsProcessing(true);
    setValidationStatus(null);

    // Simular procesamiento (para UX)
    setTimeout(() => {
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();

      // Generar con constraints actuales
      const schedule = generateSchedule(month, year, constraints);
      
      const newMonthSchedule: MonthSchedule = {
        month,
        year,
        days: schedule,
        generatedAt: new Date().toISOString()
      };

      setMonthSchedule(newMonthSchedule);
      saveSchedule(newMonthSchedule);

      // Validar con constraints actuales
      const validation = validateSchedule(schedule, constraints);
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
    setShowExportMenu(!showExportMenu);
  };

  const handleExportICS = () => {
    if (monthSchedule) {
      exportScheduleAsICS(monthSchedule);
      setShowExportMenu(false);
    }
  };

  const handleExportCSV = () => {
    if (monthSchedule) {
      exportScheduleAsCSV(monthSchedule);
      setShowExportMenu(false);
    }
  };

  const handleExportJSON = () => {
    if (monthSchedule) {
      exportScheduleAsJSON(monthSchedule);
      setShowExportMenu(false);
    }
  };

  const handleExportDoctorSchedule = (doctorId: string) => {
    if (!monthSchedule) return;
    
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) {
      exportDoctorScheduleAsICS(monthSchedule, doctor.id, doctor.name);
      setShowDoctorExportMenu(false);
    }
  };

  const handleLoadFromHistory = (schedule: MonthSchedule) => {
    setMonthSchedule(schedule);
    setCurrentDate(new Date(schedule.year, schedule.month, 1));
    saveSchedule(schedule); // Actualizar cronograma actual
  };

  const handleRulesChange = (newConstraints: Constraint[]) => {
    setConstraints(newConstraints);
  };

  const handleDoctorsChange = (newDoctors: Doctor[]) => {
    setDoctors(newDoctors);
  };

  const handleCaptureScreenshot = async () => {
    if (!calendarRef.current || displaySchedule.length === 0) return;

    setIsCapturing(true);

    try {
      // Esperar un momento para que se actualice el estado visual
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(calendarRef.current, {
        backgroundColor: '#f3f4f6',
        scale: 2, // Mayor calidad
        logging: false,
        useCORS: true,
        allowTaint: true
      });

      // Convertir a blob
      canvas.toBlob((blob) => {
        if (!blob) return;

        // Crear URL y descargar
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const monthName = MONTH_NAMES[month].toLowerCase();
        link.href = url;
        link.download = `infectoplan_${monthName}_${year}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setIsCapturing(false);
      }, 'image/png');
    } catch (error) {
      console.error('Error capturando pantalla:', error);
      setIsCapturing(false);
      alert('Error al capturar la imagen. Por favor, intenta de nuevo.');
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

    // Re-validar con constraints actuales
    const validation = validateSchedule(updatedDays, constraints);
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
        <div ref={calendarRef} className="max-w-7xl mx-auto p-6 space-y-6">
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
              <div className="flex items-center gap-3 flex-wrap">
                {/* Botones de gestión */}
                <button
                  onClick={() => setShowDoctorsManager(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors font-medium text-sm"
                  title="Gestionar médicos"
                >
                  <Users className="w-4 h-4" />
                  Médicos
                </button>

                <button
                  onClick={() => setShowVacationsManager(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-colors font-medium text-sm"
                  title="Gestionar vacaciones"
                >
                  <Plane className="w-4 h-4" />
                  Vacaciones
                </button>

                <button
                  onClick={() => setShowRulesManager(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors font-medium text-sm"
                  title="Gestionar reglas"
                >
                  <Settings className="w-4 h-4" />
                  Reglas
                </button>

                {/* Botón principal */}
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
                  <>
                    <button
                      onClick={() => setShowHistoryPanel(true)}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium bg-purple-500 text-white hover:bg-purple-600 transition-colors shadow-sm"
                      title="Ver historial de cronogramas"
                    >
                      <History className="w-5 h-5" />
                      Historial
                    </button>

                    <button
                      onClick={handleCaptureScreenshot}
                      disabled={isCapturing}
                      className={`
                        flex items-center gap-2 px-4 py-3 rounded-lg font-medium
                        transition-colors shadow-sm
                        ${isCapturing
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-emerald-500 text-white hover:bg-emerald-600'
                        }
                      `}
                      title="Capturar calendario como imagen"
                    >
                      {isCapturing ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Capturando...
                        </>
                      ) : (
                        <>
                          <Camera className="w-5 h-5" />
                          Capturar
                        </>
                      )}
                    </button>

                    <div className="relative" ref={exportMenuRef}>
                      <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium border-2 border-gray-300 hover:bg-gray-50 transition-colors"
                        title="Exportar cronograma"
                      >
                        <Download className="w-5 h-5" />
                        Exportar
                      </button>

                      {/* Menú de exportación */}
                      {showExportMenu && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border-2 border-gray-200 z-50">
                          <div className="p-3 bg-gray-50 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-800">Exportar Cronograma Completo</h3>
                            <p className="text-xs text-gray-500 mt-1">Todos los médicos y todas las guardias</p>
                          </div>
                          
                          <div className="p-2">
                            <button
                              onClick={handleExportICS}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent-50 rounded-lg transition-colors text-left"
                            >
                              <CalendarIcon className="w-5 h-5 text-accent-600" />
                              <div>
                                <div className="font-medium text-gray-800">.ICS (iCalendar)</div>
                                <div className="text-xs text-gray-500">Para Google Calendar, Outlook, Apple Calendar</div>
                              </div>
                            </button>

                            <button
                              onClick={handleExportCSV}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 rounded-lg transition-colors text-left"
                            >
                              <FileText className="w-5 h-5 text-green-600" />
                              <div>
                                <div className="font-medium text-gray-800">.CSV (Excel)</div>
                                <div className="text-xs text-gray-500">Para Excel, Google Sheets, análisis de datos</div>
                              </div>
                            </button>

                            <button
                              onClick={handleExportJSON}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-lg transition-colors text-left"
                            >
                              <FileText className="w-5 h-5 text-blue-600" />
                              <div>
                                <div className="font-medium text-gray-800">.JSON (Datos)</div>
                                <div className="text-xs text-gray-500">Para backup técnico, re-importación</div>
                              </div>
                            </button>
                          </div>

                          <div className="p-3 bg-gray-50 border-t border-gray-200">
                            <button
                              onClick={() => {
                                setShowExportMenu(false);
                                setShowDoctorExportMenu(true);
                              }}
                              className="w-full px-4 py-2 bg-accent-600 text-white rounded-lg font-medium hover:bg-accent-700 transition-colors text-sm"
                            >
                              📧 Exportar por Médico Individual
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Menú de exportación por médico */}
                      {showDoctorExportMenu && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border-2 border-gray-200 z-50">
                          <div className="p-3 bg-gradient-to-r from-accent-600 to-accent-700">
                            <h3 className="font-semibold text-white">Exportar por Médico</h3>
                            <p className="text-xs text-accent-100 mt-1">Solo las guardias de un médico específico</p>
                          </div>
                          
                          <div className="p-2 max-h-96 overflow-y-auto">
                            {doctors.map(doctor => (
                              <button
                                key={doctor.id}
                                onClick={() => handleExportDoctorSchedule(doctor.id)}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent-50 rounded-lg transition-colors text-left"
                              >
                                <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center font-bold text-accent-700">
                                  {doctor.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-800">{doctor.name}</div>
                                  <div className="text-xs text-gray-500">{doctor.specialty}</div>
                                </div>
                                <CalendarIcon className="w-4 h-4 text-gray-400" />
                              </button>
                            ))}
                          </div>

                          <div className="p-3 bg-gray-50 border-t border-gray-200">
                            <button
                              onClick={() => setShowDoctorExportMenu(false)}
                              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm"
                            >
                              ← Volver
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
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

      {/* Panel de historial */}
      <HistoryPanel
        isOpen={showHistoryPanel}
        onClose={() => setShowHistoryPanel(false)}
        onLoadSchedule={handleLoadFromHistory}
      />

      {/* Gestión de Reglas */}
      <RulesManager
        isOpen={showRulesManager}
        onClose={() => setShowRulesManager(false)}
        onRulesChange={handleRulesChange}
      />

      {/* Gestión de Médicos */}
      <DoctorsManager
        isOpen={showDoctorsManager}
        onClose={() => setShowDoctorsManager(false)}
        onDoctorsChange={handleDoctorsChange}
      />

      {/* Gestión de Vacaciones */}
      <VacationsManager
        isOpen={showVacationsManager}
        onClose={() => setShowVacationsManager(false)}
        currentMonth={month}
        currentYear={year}
      />
    </div>
  );
}

export default App;

