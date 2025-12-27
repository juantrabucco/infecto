import { MonthSchedule } from '../types';

const STORAGE_KEY = 'infectoplan_schedule';
const CONSTRAINTS_KEY = 'infectoplan_constraints';

/**
 * Servicio de almacenamiento local usando LocalStorage
 * Maneja la persistencia del cronograma y configuración de restricciones
 */

export function saveSchedule(schedule: MonthSchedule): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
  } catch (error) {
    console.error('Error guardando cronograma:', error);
    throw new Error('No se pudo guardar el cronograma. Verifique el espacio de almacenamiento.');
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

