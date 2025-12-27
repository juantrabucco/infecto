import { Doctor } from '../types';
import { DOCTORS } from '../constants';

const DOCTORS_CONFIG_KEY = 'infectoplan_doctors_config';

/**
 * Servicio de gestión de configuración de médicos
 * Permite personalizar disponibilidad, especialidades, etc.
 */

/**
 * Guarda la configuración personalizada de médicos
 */
export function saveDoctorsConfig(doctors: Doctor[]): void {
  try {
    localStorage.setItem(DOCTORS_CONFIG_KEY, JSON.stringify(doctors));
  } catch (error) {
    console.error('Error guardando configuración de médicos:', error);
  }
}

/**
 * Carga la configuración de médicos (personalizada o predeterminada)
 */
export function loadDoctorsConfig(): Doctor[] {
  try {
    const data = localStorage.getItem(DOCTORS_CONFIG_KEY);
    if (!data) return [...DOCTORS]; // Retornar copia de predeterminados
    
    const parsed: Doctor[] = JSON.parse(data);
    
    // Validar que tenga la estructura correcta
    if (!Array.isArray(parsed) || parsed.length === 0) {
      console.warn('Configuración de médicos corrupta, usando predeterminados');
      return [...DOCTORS];
    }
    
    return parsed;
  } catch (error) {
    console.error('Error cargando configuración de médicos:', error);
    return [...DOCTORS];
  }
}

/**
 * Actualiza un médico específico
 */
export function updateDoctor(id: string, updates: Partial<Doctor>): boolean {
  try {
    const doctors = loadDoctorsConfig();
    const index = doctors.findIndex(d => d.id === id);
    
    if (index === -1) return false;
    
    doctors[index] = { ...doctors[index], ...updates };
    saveDoctorsConfig(doctors);
    
    return true;
  } catch (error) {
    console.error('Error actualizando médico:', error);
    return false;
  }
}

/**
 * Añade un nuevo médico
 */
export function addDoctor(doctor: Omit<Doctor, 'id'>): Doctor {
  const doctors = loadDoctorsConfig();
  
  // Generar ID único
  const id = doctor.name.toLowerCase().replace(/\s+/g, '_');
  const newDoctor: Doctor = {
    id,
    ...doctor
  };
  
  doctors.push(newDoctor);
  saveDoctorsConfig(doctors);
  
  return newDoctor;
}

/**
 * Elimina un médico
 */
export function deleteDoctor(id: string): boolean {
  try {
    const doctors = loadDoctorsConfig();
    const filtered = doctors.filter(d => d.id !== id);
    
    if (filtered.length === doctors.length) return false; // No se encontró
    
    saveDoctorsConfig(filtered);
    return true;
  } catch (error) {
    console.error('Error eliminando médico:', error);
    return false;
  }
}

/**
 * Restaura configuración predeterminada
 */
export function resetDoctorsConfig(): void {
  localStorage.removeItem(DOCTORS_CONFIG_KEY);
}

/**
 * Verifica si hay configuración personalizada
 */
export function hasCustomConfig(): boolean {
  return localStorage.getItem(DOCTORS_CONFIG_KEY) !== null;
}

/**
 * Exporta configuración como JSON
 */
export function exportDoctorsConfig(): void {
  const doctors = loadDoctorsConfig();
  const dataStr = JSON.stringify(doctors, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `infectoplan_medicos_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Importa configuración desde JSON
 */
export function importDoctorsConfig(jsonData: string): boolean {
  try {
    const imported: Doctor[] = JSON.parse(jsonData);
    
    if (!Array.isArray(imported)) {
      throw new Error('Formato inválido');
    }
    
    // Validar cada médico
    for (const doctor of imported) {
      if (!doctor.id || !doctor.name || !doctor.availableDays || !doctor.specialty) {
        throw new Error('Datos incompletos en médicos');
      }
    }
    
    saveDoctorsConfig(imported);
    return true;
  } catch (error) {
    console.error('Error importando configuración de médicos:', error);
    return false;
  }
}

/**
 * Obtiene estadísticas de disponibilidad
 */
export function getDoctorStats(doctorId: string): {
  totalDaysAvailable: number;
  percentage: number;
} {
  const doctors = loadDoctorsConfig();
  const doctor = doctors.find(d => d.id === doctorId);
  
  if (!doctor) {
    return { totalDaysAvailable: 0, percentage: 0 };
  }
  
  const totalDaysAvailable = doctor.availableDays.length;
  const percentage = (totalDaysAvailable / 5) * 100; // 5 días laborables (Lun-Vie)
  
  return { totalDaysAvailable, percentage };
}

