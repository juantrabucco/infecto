import { Doctor, DaySchedule, Assignment, AreaType, Constraint, DayOfWeek } from '../types';
import { AREAS, REQUIRED_STAFF_PER_DAY } from '../constants';
import { isDoctorOnVacation } from './vacationsService';
import { loadDoctorsConfig } from './doctorsService';

interface ScoredCandidate {
  doctor: Doctor;
  score: number;
}

/**
 * Motor de Asignación Inteligente - Algoritmo CSP (Constraint Satisfaction Problem)
 * Implementa un sistema de scoring ponderado para resolver restricciones hard y soft
 * ACTUALIZADO: Considera vacaciones, reglas editables, y configuración personalizada de médicos
 */
export function generateSchedule(
  month: number, 
  year: number,
  constraints: Constraint[] = []
): DaySchedule[] {
  // IMPORTANTE: Cargar configuración personalizada de médicos
  const DOCTORS = loadDoctorsConfig();
  const schedule: DaySchedule[] = [];
  const workingDays = getWorkingDaysInMonth(month, year);
  
  // Contador para alternancia de Cristina/Agustina (R1.4)
  let exclusionToggle = 0;

  // Verificar si la regla de exclusión está activa
  const exclusionRule = constraints.find(c => c.id === 'R1.4');
  const isExclusionActive = exclusionRule ? exclusionRule.active : true;

  for (const date of workingDays) {
    const dayOfWeek = date.getDay() as DayOfWeek;
    const dateStr = date.toISOString();
    
    // Paso 1: Obtener candidatos disponibles para este día
    let availableDoctors = DOCTORS.filter(doc => {
      // Verificar disponibilidad por día de semana
      if (!doc.availableDays.includes(dayOfWeek)) return false;
      
      // Verificar si está de vacaciones (NUEVO)
      if (isDoctorOnVacation(doc.id, dateStr)) return false;
      
      return true;
    });

    // Paso 2: Aplicar Restricción R1.4 (Exclusión Mutua) solo si está activa
    if (isExclusionActive) {
      availableDoctors = applyExclusionRule(availableDoctors, exclusionToggle);
      exclusionToggle++;
    }

    // Paso 3: Asignar por área en orden de prioridad
    const assignments: Assignment[] = [];
    const usedDoctorIds = new Set<string>();

    for (const area of AREAS) {
      if (availableDoctors.length === 0) break;

      // Filtrar doctores ya asignados este día
      const candidates = availableDoctors.filter(
        doc => !usedDoctorIds.has(doc.id)
      );

      if (candidates.length === 0) break;

      // Calcular score para cada candidato
      const scoredCandidates: ScoredCandidate[] = candidates.map(doc => ({
        doctor: doc,
        score: calculateScore(doc, area, constraints)
      }));

      // Ordenar por score descendente
      scoredCandidates.sort((a, b) => b.score - a.score);

      // Asignar el mejor candidato
      const bestCandidate = scoredCandidates[0];
      assignments.push({
        doctorId: bestCandidate.doctor.id,
        doctorName: bestCandidate.doctor.name,
        area: area
      });

      usedDoctorIds.add(bestCandidate.doctor.id);
    }

    // CAMBIADO: Ya no es obligatorio tener 3 profesionales
    // isComplete ahora es una recomendación, no un requisito
    const recommendedStaff = REQUIRED_STAFF_PER_DAY;
    
    schedule.push({
      date: dateStr,
      dayOfWeek: dayOfWeek,
      assignments: assignments,
      isComplete: assignments.length >= recommendedStaff
    });
  }

  return schedule;
}

/**
 * Aplica la Regla R1.4: Cristina y Agustina nunca pueden trabajar juntas
 * Utiliza un sistema de alternancia para garantizar equidad
 */
function applyExclusionRule(doctors: Doctor[], toggleCounter: number): Doctor[] {
  const hasCristina = doctors.some(d => d.id === 'cristina');
  const hasAgustina = doctors.some(d => d.id === 'agustina');

  // Si ambas están disponibles, alternar cuál se excluye
  if (hasCristina && hasAgustina) {
    const excludeId = toggleCounter % 2 === 0 ? 'agustina' : 'cristina';
    return doctors.filter(d => d.id !== excludeId);
  }

  return doctors;
}

/**
 * Sistema de Scoring para Soft Constraints
 * Calcula la "aptitud" de un médico para un área específica
 * ACTUALIZADO: Usa constraints pasadas como parámetro
 */
function calculateScore(
  doctor: Doctor,
  area: AreaType,
  constraints: Constraint[]
): number {
  let score = 0;

  // R3.1: Cristina prioridad en Pueyrredón (+100)
  const r31 = constraints.find(c => c.id === 'R3.1');
  if (r31?.active && doctor.id === 'cristina' && area === 'Piso Pueyrredón') {
    score += r31.weight || 100;
  }

  // R3.2: Natalia/Leticia prioridad en Juncal (+100)
  const r32 = constraints.find(c => c.id === 'R3.2');
  if (r32?.active && ['natalia', 'leticia'].includes(doctor.id) && area === 'Sector Juncal') {
    score += r32.weight || 100;
  }

  // R3.3: Agustina evita Unidades Cerradas (-50)
  const r33 = constraints.find(c => c.id === 'R3.3');
  if (r33?.active && doctor.id === 'agustina' && area === 'Unidades Cerradas') {
    score += r33.weight || -50;
  }

  // R3.4: Bonus por especialidad coincidente (+10)
  const r34 = constraints.find(c => c.id === 'R3.4');
  if (r34?.active) {
    const areaKeywords = area.toLowerCase().split(' ');
    const specialtyKeywords = doctor.specialty.toLowerCase().split(' ');
    
    const hasMatch = areaKeywords.some(keyword => 
      specialtyKeywords.some(specKeyword => 
        specKeyword.includes(keyword) || keyword.includes(specKeyword)
      )
    );

    if (hasMatch) {
      score += r34.weight || 10;
    }
  }

  return score;
}

/**
 * Obtiene todos los días laborables (Lunes a Viernes) de un mes
 */
function getWorkingDaysInMonth(month: number, year: number): Date[] {
  const workingDays: Date[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();

    // Solo días laborables (Lunes=1 a Viernes=5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      workingDays.push(date);
    }
  }

  return workingDays;
}

/**
 * Valida un cronograma completo contra todas las restricciones
 * Retorna un reporte de violaciones
 * ACTUALIZADO: R1.3 ya no es obligatorio
 */
export interface ValidationReport {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateSchedule(
  schedule: DaySchedule[],
  constraints: Constraint[] = []
): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Verificar si la regla de exclusión está activa
  const exclusionRule = constraints.find(c => c.id === 'R1.4');
  const isExclusionActive = exclusionRule ? exclusionRule.active : true;

  // Verificar si la regla de capacidad está activa
  const capacityRule = constraints.find(c => c.id === 'R1.3');
  const isCapacityActive = capacityRule ? capacityRule.active : false;

  for (const day of schedule) {
    const date = new Date(day.date);
    const dateStr = date.toLocaleDateString('es-AR');

    // Validar R1.3: 3 profesionales por día (ahora es SOFT, solo advertencia)
    if (isCapacityActive && day.assignments.length < REQUIRED_STAFF_PER_DAY) {
      warnings.push(`${dateStr}: Solo ${day.assignments.length} profesionales asignados (se recomiendan ${REQUIRED_STAFF_PER_DAY})`);
    }

    // Validar R1.4: Cristina y Agustina no juntas (solo si está activa)
    if (isExclusionActive) {
      const hasCristina = day.assignments.some(a => a.doctorId === 'cristina');
      const hasAgustina = day.assignments.some(a => a.doctorId === 'agustina');
      if (hasCristina && hasAgustina) {
        errors.push(`${dateStr}: VIOLACIÓN R1.4 - Cristina y Agustina asignadas el mismo día`);
      }
    }

    // Advertir si Agustina está en Unidades Cerradas
    const r33 = constraints.find(c => c.id === 'R3.3');
    if (r33?.active) {
      const agustinaInUC = day.assignments.some(
        a => a.doctorId === 'agustina' && a.area === 'Unidades Cerradas'
      );
      if (agustinaInUC) {
        warnings.push(`${dateStr}: Agustina asignada a Unidades Cerradas (no preferido)`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

