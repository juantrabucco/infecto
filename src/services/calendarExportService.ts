import { MonthSchedule, DaySchedule } from '../types';

/**
 * Servicio de exportación de calendarios
 * Genera archivos .ics (iCalendar) compatibles con:
 * - Google Calendar
 * - Outlook
 * - Apple Calendar
 * - Mozilla Thunderbird
 * Y cualquier aplicación que soporte RFC 5545
 */

/**
 * Formatea una fecha para el formato iCalendar (YYYYMMDDTHHMMSSZ)
 */
function formatICalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escapa caracteres especiales para formato iCalendar
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Genera un UID único para cada evento
 */
function generateUID(date: string, doctorId: string, area: string): string {
  const timestamp = new Date(date).getTime();
  return `${timestamp}-${doctorId}-${area.replace(/\s+/g, '-')}@infectoplan.app`;
}

/**
 * Exporta un cronograma completo como archivo .ics
 * Crea UN SOLO archivo con todos los eventos del mes
 */
export function exportScheduleAsICS(schedule: MonthSchedule): void {
  const events: string[] = [];
  const now = new Date();
  const timestamp = formatICalDate(now);

  // Header del archivo iCalendar
  const header = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//InfectoPlan//Gestion de Guardias//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:InfectoPlan - Guardias Médicas',
    'X-WR-TIMEZONE:America/Argentina/Buenos_Aires',
    'X-WR-CALDESC:Cronograma de guardias del Departamento de Infectología'
  ].join('\r\n');

  // Generar eventos para cada asignación
  for (const day of schedule.days) {
    for (const assignment of day.assignments) {
      const eventDate = new Date(day.date);
      
      // Fecha de inicio: 8:00 AM
      const startDate = new Date(eventDate);
      startDate.setHours(8, 0, 0, 0);
      
      // Fecha de fin: 4:00 PM (16:00)
      const endDate = new Date(eventDate);
      endDate.setHours(16, 0, 0, 0);

      const uid = generateUID(day.date, assignment.doctorId, assignment.area);
      const summary = `Guardia - ${assignment.area}`;
      const description = `Asignación de guardia en ${assignment.area}\\n\\nMédico: ${assignment.doctorName}\\nHorario: 08:00 - 16:00\\nDepartamento: Infectología`;
      const location = escapeICalText(assignment.area);

      const event = [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${timestamp}`,
        `DTSTART:${formatICalDate(startDate)}`,
        `DTEND:${formatICalDate(endDate)}`,
        `SUMMARY:${escapeICalText(summary)}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        `STATUS:CONFIRMED`,
        `TRANSP:OPAQUE`,
        `CATEGORIES:Guardia,Trabajo,Salud`,
        // Alarmas: 1 día antes y 1 hora antes
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:DISPLAY',
        'DESCRIPTION:Recordatorio: Guardia mañana',
        'END:VALARM',
        'BEGIN:VALARM',
        'TRIGGER:-PT1H',
        'ACTION:DISPLAY',
        'DESCRIPTION:Recordatorio: Guardia en 1 hora',
        'END:VALARM',
        'END:VEVENT'
      ].join('\r\n');

      events.push(event);
    }
  }

  // Footer
  const footer = 'END:VCALENDAR';

  // Combinar todo
  const icsContent = [header, ...events, footer].join('\r\n');

  // Descargar archivo
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `infectoplan_guardias_${monthNames[schedule.month]}_${schedule.year}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Exporta las guardias de UN SOLO médico como .ics
 * Útil para que cada médico descargue solo sus propias guardias
 */
export function exportDoctorScheduleAsICS(
  schedule: MonthSchedule,
  doctorId: string,
  doctorName: string
): void {
  // Filtrar solo las asignaciones de este médico
  const filteredSchedule: MonthSchedule = {
    ...schedule,
    days: schedule.days
      .map(day => ({
        ...day,
        assignments: day.assignments.filter(a => a.doctorId === doctorId)
      }))
      .filter(day => day.assignments.length > 0) // Solo días donde tiene guardia
  };

  if (filteredSchedule.days.length === 0) {
    alert(`${doctorName} no tiene guardias asignadas este mes.`);
    return;
  }

  const events: string[] = [];
  const now = new Date();
  const timestamp = formatICalDate(now);

  const header = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//InfectoPlan//Gestion de Guardias//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Mis Guardias - ${doctorName}`,
    'X-WR-TIMEZONE:America/Argentina/Buenos_Aires',
    `X-WR-CALDESC:Guardias de ${doctorName} - Departamento de Infectología`
  ].join('\r\n');

  for (const day of filteredSchedule.days) {
    for (const assignment of day.assignments) {
      const eventDate = new Date(day.date);
      
      const startDate = new Date(eventDate);
      startDate.setHours(8, 0, 0, 0);
      
      const endDate = new Date(eventDate);
      endDate.setHours(16, 0, 0, 0);

      const uid = generateUID(day.date, assignment.doctorId, assignment.area);
      const summary = `Mi Guardia - ${assignment.area}`;
      const description = `Guardia en ${assignment.area}\\n\\nHorario: 08:00 - 16:00\\nDepartamento: Infectología\\n\\nContacto de coordinación: [AGREGAR]`;
      const location = escapeICalText(assignment.area);

      const event = [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${timestamp}`,
        `DTSTART:${formatICalDate(startDate)}`,
        `DTEND:${formatICalDate(endDate)}`,
        `SUMMARY:${escapeICalText(summary)}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        `STATUS:CONFIRMED`,
        `TRANSP:OPAQUE`,
        `CATEGORIES:Mi Guardia,Trabajo`,
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:EMAIL',
        'DESCRIPTION:Recordatorio: Tienes guardia mañana',
        'SUMMARY:Guardia mañana',
        'END:VALARM',
        'BEGIN:VALARM',
        'TRIGGER:-PT1H',
        'ACTION:DISPLAY',
        'DESCRIPTION:Tu guardia comienza en 1 hora',
        'END:VALARM',
        'END:VEVENT'
      ].join('\r\n');

      events.push(event);
    }
  }

  const footer = 'END:VCALENDAR';
  const icsContent = [header, ...events, footer].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `mis_guardias_${doctorName.toLowerCase().replace(/\s+/g, '_')}_${monthNames[schedule.month]}_${schedule.year}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Exporta como CSV para Excel/Google Sheets
 */
export function exportScheduleAsCSV(schedule: MonthSchedule): void {
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Header CSV
  const headers = [
    'Fecha',
    'Día de Semana',
    'Sector Juncal',
    'Piso Pueyrredón',
    'Unidades Cerradas',
    'Completo',
    'Total Asignaciones'
  ];

  const rows: string[] = [headers.join(',')];

  // Datos
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  for (const day of schedule.days) {
    const date = new Date(day.date);
    const dateStr = date.toLocaleDateString('es-AR');
    const dayName = dayNames[day.dayOfWeek];

    // Obtener asignaciones por área
    const juncal = day.assignments.find(a => a.area === 'Sector Juncal')?.doctorName || 'Sin asignar';
    const pueyrredon = day.assignments.find(a => a.area === 'Piso Pueyrredón')?.doctorName || 'Sin asignar';
    const cerradas = day.assignments.find(a => a.area === 'Unidades Cerradas')?.doctorName || 'Sin asignar';

    const row = [
      `"${dateStr}"`,
      `"${dayName}"`,
      `"${juncal}"`,
      `"${pueyrredon}"`,
      `"${cerradas}"`,
      day.isComplete ? 'Sí' : 'No',
      day.assignments.length
    ];

    rows.push(row.join(','));
  }

  // Añadir resumen al final
  rows.push(''); // Línea vacía
  rows.push(`"Resumen del Mes: ${monthNames[schedule.month]} ${schedule.year}"`);
  rows.push(`"Total días laborables:",${schedule.days.length}`);
  rows.push(`"Días completos:",${schedule.days.filter(d => d.isComplete).length}`);
  rows.push(`"Días incompletos:",${schedule.days.filter(d => !d.isComplete).length}`);
  rows.push(`"Total asignaciones:",${schedule.days.reduce((sum, d) => sum + d.assignments.length, 0)}`);

  const csvContent = rows.join('\n');

  // Añadir BOM para Excel UTF-8
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `infectoplan_${monthNames[schedule.month].toLowerCase()}_${schedule.year}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

