export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type AreaType = 'Unidades Cerradas' | 'Piso Pueyrredón' | 'Sector Juncal';

export interface Doctor {
  id: string;
  name: string;
  availableDays: DayOfWeek[];
  specialty: string;
}

export interface Assignment {
  doctorId: string;
  doctorName: string;
  area: AreaType;
}

export interface DaySchedule {
  date: string; // ISO format for serialization
  dayOfWeek: DayOfWeek;
  assignments: Assignment[];
  isComplete: boolean;
}

export interface Constraint {
  id: string;
  type: 'HARD' | 'SOFT';
  name: string;
  description: string;
  weight?: number;
  active: boolean;
}

export interface MonthSchedule {
  month: number;
  year: number;
  days: DaySchedule[];
  generatedAt: string;
}

