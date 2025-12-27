import { Doctor, AreaType, Constraint } from './types';

export const DOCTORS: Doctor[] = [
  {
    id: 'leticia',
    name: 'Leticia',
    availableDays: [2, 4, 5], // Martes, Jueves, Viernes
    specialty: 'Infectología General'
  },
  {
    id: 'agustina',
    name: 'Agustina',
    availableDays: [1, 2, 3], // Lunes, Martes, Miércoles
    specialty: 'Control de Infecciones'
  },
  {
    id: 'natalia',
    name: 'Natalia',
    availableDays: [2, 3, 5], // Martes, Miércoles, Viernes
    specialty: 'Epidemiología'
  },
  {
    id: 'cristina',
    name: 'Cristina',
    availableDays: [1, 2, 4], // Lunes, Martes, Jueves
    specialty: 'Internación General (Concurrente)'
  },
  {
    id: 'cecilia',
    name: 'Cecilia',
    availableDays: [3, 4, 5], // Miércoles, Jueves, Viernes
    specialty: 'Cuidados Críticos'
  }
];

export const AREAS: AreaType[] = [
  'Sector Juncal',        // Prioridad 1 - se llena primero
  'Piso Pueyrredón',      // Prioridad 2
  'Unidades Cerradas'     // Prioridad 3 - se llena al final
];

export const INITIAL_CONSTRAINTS: Constraint[] = [
  {
    id: 'R1.3',
    type: 'HARD',
    name: 'Capacidad Diaria',
    description: 'Cada día debe tener exactamente 3 profesionales asignados',
    active: true
  },
  {
    id: 'R1.4',
    type: 'HARD',
    name: 'Exclusión Mutua Cristina/Agustina',
    description: 'Cristina y Agustina nunca pueden trabajar el mismo día',
    active: true
  },
  {
    id: 'R3.1',
    type: 'SOFT',
    name: 'Cristina prioritaria en Pueyrredón',
    description: 'Cristina debe asignarse preferentemente a Piso Pueyrredón',
    weight: 100,
    active: true
  },
  {
    id: 'R3.2',
    type: 'SOFT',
    name: 'Natalia/Leticia prioritarias en Juncal',
    description: 'Natalia y Leticia deben asignarse preferentemente a Sector Juncal',
    weight: 100,
    active: true
  },
  {
    id: 'R3.3',
    type: 'SOFT',
    name: 'Agustina evita Unidades Cerradas',
    description: 'Agustina debe evitar Unidades Cerradas excepto cuando no hay alternativas',
    weight: -50,
    active: true
  },
  {
    id: 'R3.4',
    type: 'SOFT',
    name: 'Bonus por Especialidad',
    description: 'Preferir asignar médicos cuya especialidad coincida con el área',
    weight: 10,
    active: true
  }
];

export const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const FULL_DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const REQUIRED_STAFF_PER_DAY = 3;

