import { Vacation } from '../types';

const VACATIONS_KEY = 'infectoplan_vacations';

/**
 * Servicio de gestión de vacaciones
 * Permite marcar médicos como no disponibles en fechas específicas
 */

/**
 * Guarda todas las vacaciones
 */
export function saveVacations(vacations: Vacation[]): void {
  try {
    localStorage.setItem(VACATIONS_KEY, JSON.stringify(vacations));
  } catch (error) {
    console.error('Error guardando vacaciones:', error);
  }
}

/**
 * Carga todas las vacaciones
 */
export function loadVacations(): Vacation[] {
  try {
    const data = localStorage.getItem(VACATIONS_KEY);
    if (!data) return [];
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error cargando vacaciones:', error);
    return [];
  }
}

/**
 * Añade una nueva vacación
 */
export function addVacation(vacation: Omit<Vacation, 'id'>): Vacation {
  const vacations = loadVacations();
  
  const newVacation: Vacation = {
    ...vacation,
    id: `vacation-${Date.now()}-${vacation.doctorId}`
  };
  
  vacations.push(newVacation);
  saveVacations(vacations);
  
  return newVacation;
}

/**
 * Elimina una vacación
 */
export function deleteVacation(id: string): void {
  const vacations = loadVacations();
  const filtered = vacations.filter(v => v.id !== id);
  saveVacations(filtered);
}

/**
 * Actualiza una vacación existente
 */
export function updateVacation(id: string, updates: Partial<Vacation>): void {
  const vacations = loadVacations();
  const updated = vacations.map(v => 
    v.id === id ? { ...v, ...updates } : v
  );
  saveVacations(updated);
}

/**
 * Verifica si un médico está de vacaciones en una fecha específica
 */
export function isDoctorOnVacation(doctorId: string, date: string): boolean {
  const vacations = loadVacations();
  const checkDate = new Date(date);
  
  return vacations.some(vacation => {
    if (vacation.doctorId !== doctorId) return false;
    
    const startDate = new Date(vacation.startDate);
    const endDate = new Date(vacation.endDate);
    
    return checkDate >= startDate && checkDate <= endDate;
  });
}

/**
 * Obtiene todas las vacaciones de un médico específico
 */
export function getDoctorVacations(doctorId: string): Vacation[] {
  const vacations = loadVacations();
  return vacations.filter(v => v.doctorId === doctorId);
}

/**
 * Obtiene vacaciones en un rango de fechas
 */
export function getVacationsInRange(startDate: string, endDate: string): Vacation[] {
  const vacations = loadVacations();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return vacations.filter(vacation => {
    const vacStart = new Date(vacation.startDate);
    const vacEnd = new Date(vacation.endDate);
    
    // Verifica si hay overlap entre los rangos
    return vacStart <= end && vacEnd >= start;
  });
}

/**
 * Limpia vacaciones expiradas (más de 1 año en el pasado)
 */
export function cleanOldVacations(): number {
  const vacations = loadVacations();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  const filtered = vacations.filter(vacation => {
    const endDate = new Date(vacation.endDate);
    return endDate >= oneYearAgo;
  });
  
  const removed = vacations.length - filtered.length;
  saveVacations(filtered);
  
  return removed;
}

/**
 * Exporta vacaciones como JSON
 */
export function exportVacationsAsJSON(): void {
  const vacations = loadVacations();
  const dataStr = JSON.stringify(vacations, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `infectoplan_vacaciones_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Importa vacaciones desde JSON
 */
export function importVacationsFromJSON(jsonData: string): boolean {
  try {
    const imported: Vacation[] = JSON.parse(jsonData);
    
    if (!Array.isArray(imported)) {
      throw new Error('Formato inválido');
    }
    
    // Validar cada vacación
    for (const vacation of imported) {
      if (!vacation.doctorId || !vacation.startDate || !vacation.endDate) {
        throw new Error('Datos incompletos en vacaciones');
      }
    }
    
    // Merge con vacaciones existentes (evitar duplicados por ID)
    const existing = loadVacations();
    const existingIds = new Set(existing.map(v => v.id));
    
    const newVacations = imported.filter(v => !existingIds.has(v.id));
    const merged = [...existing, ...newVacations];
    
    saveVacations(merged);
    
    return true;
  } catch (error) {
    console.error('Error importando vacaciones:', error);
    return false;
  }
}

