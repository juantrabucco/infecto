import { MonthSchedule } from '../types';

const STORAGE_KEY = 'infectoplan_schedule';
const HISTORY_KEY = 'infectoplan_history';
const CONSTRAINTS_KEY = 'infectoplan_constraints';

/**
 * Servicio de almacenamiento local usando LocalStorage
 * Maneja la persistencia del cronograma y configuración de restricciones
 * NUEVO: Sistema de historial para guardar múltiples cronogramas
 */

export interface ScheduleHistory {
  id: string;
  schedule: MonthSchedule;
  savedAt: string;
  label?: string;
}

/**
 * Guarda cronograma actual Y lo añade al historial
 */
export function saveSchedule(schedule: MonthSchedule): void {
  try {
    // Guardar como cronograma actual
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
    
    // Añadir al historial
    addToHistory(schedule);
  } catch (error) {
    console.error('Error guardando cronograma:', error);
    throw new Error('No se pudo guardar el cronograma. Verifique el espacio de almacenamiento.');
  }
}

/**
 * Añade un cronograma al historial
 */
export function addToHistory(schedule: MonthSchedule, label?: string): void {
  try {
    const history = loadHistory();
    
    // Crear ID único basado en mes/año/timestamp
    const id = `${schedule.year}-${String(schedule.month + 1).padStart(2, '0')}-${Date.now()}`;
    
    const historyItem: ScheduleHistory = {
      id,
      schedule,
      savedAt: new Date().toISOString(),
      label: label || `${getMonthName(schedule.month)} ${schedule.year}`
    };
    
    // Añadir al inicio del array (más reciente primero)
    history.unshift(historyItem);
    
    // Limitar historial a 50 cronogramas para no llenar LocalStorage
    const limitedHistory = history.slice(0, 50);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Error añadiendo al historial:', error);
  }
}

/**
 * Carga el historial completo de cronogramas
 */
export function loadHistory(): ScheduleHistory[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    
    const history: ScheduleHistory[] = JSON.parse(data);
    return history;
  } catch (error) {
    console.error('Error cargando historial:', error);
    return [];
  }
}

/**
 * Carga un cronograma específico del historial
 */
export function loadFromHistory(id: string): MonthSchedule | null {
  try {
    const history = loadHistory();
    const item = history.find(h => h.id === id);
    return item ? item.schedule : null;
  } catch (error) {
    console.error('Error cargando del historial:', error);
    return null;
  }
}

/**
 * Elimina un cronograma del historial
 */
export function deleteFromHistory(id: string): void {
  try {
    const history = loadHistory();
    const filtered = history.filter(h => h.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error eliminando del historial:', error);
  }
}

/**
 * Limpia todo el historial
 */
export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

/**
 * Busca cronogramas en el historial por mes/año
 */
export function searchHistory(month: number, year: number): ScheduleHistory[] {
  const history = loadHistory();
  return history.filter(h => 
    h.schedule.month === month && h.schedule.year === year
  );
}

/**
 * Obtiene estadísticas del historial
 */
export function getHistoryStats(): {
  total: number;
  months: string[];
  oldestDate: string | null;
  newestDate: string | null;
} {
  const history = loadHistory();
  
  if (history.length === 0) {
    return {
      total: 0,
      months: [],
      oldestDate: null,
      newestDate: null
    };
  }
  
  const months = [...new Set(history.map(h => h.label || ''))];
  const sortedByDate = [...history].sort((a, b) => 
    new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime()
  );
  
  return {
    total: history.length,
    months,
    oldestDate: sortedByDate[0].savedAt,
    newestDate: sortedByDate[sortedByDate.length - 1].savedAt
  };
}

/**
 * Exporta todo el historial como JSON
 */
export function exportHistoryAsJSON(): void {
  const history = loadHistory();
  const dataStr = JSON.stringify(history, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `infectoplan_historial_completo_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Importa historial desde archivo JSON
 */
export function importHistoryFromJSON(jsonData: string): boolean {
  try {
    const imported: ScheduleHistory[] = JSON.parse(jsonData);
    
    // Validar estructura
    if (!Array.isArray(imported)) {
      throw new Error('Formato inválido');
    }
    
    // Validar cada item
    for (const item of imported) {
      if (!item.id || !item.schedule || !item.savedAt) {
        throw new Error('Items del historial incompletos');
      }
    }
    
    // Merge con historial existente (evitar duplicados por ID)
    const existing = loadHistory();
    const existingIds = new Set(existing.map(h => h.id));
    
    const newItems = imported.filter(item => !existingIds.has(item.id));
    const merged = [...existing, ...newItems];
    
    // Ordenar por fecha descendente y limitar a 50
    merged.sort((a, b) => 
      new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    );
    const limited = merged.slice(0, 50);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(limited));
    
    return true;
  } catch (error) {
    console.error('Error importando historial:', error);
    return false;
  }
}

export function loadSchedule(): MonthSchedule | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;

    const parsed: MonthSchedule = JSON.parse(data);
    
    // Validar estructura básica
    if (!parsed.month || !parsed.year || !parsed.days) {
      console.warn('Cronograma corrupto detectado, limpiando...');
      clearSchedule();
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Error cargando cronograma:', error);
    return null;
  }
}

export function clearSchedule(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function saveConstraints(constraints: any[]): void {
  try {
    localStorage.setItem(CONSTRAINTS_KEY, JSON.stringify(constraints));
  } catch (error) {
    console.error('Error guardando restricciones:', error);
  }
}

export function loadConstraints(): any[] | null {
  try {
    const data = localStorage.getItem(CONSTRAINTS_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error cargando restricciones:', error);
    return null;
  }
}

/**
 * Exporta el cronograma como JSON descargable
 */
export function exportScheduleAsJSON(schedule: MonthSchedule): void {
  const dataStr = JSON.stringify(schedule, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `infectoplan_${schedule.year}_${String(schedule.month + 1).padStart(2, '0')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Helper: Obtener nombre del mes
 */
function getMonthName(monthIndex: number): string {
  const names = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return names[monthIndex] || 'Mes desconocido';
}

