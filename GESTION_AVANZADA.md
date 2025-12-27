# 🎛️ Sistema Completo de Gestión Avanzada - InfectoPlan v2.0.0

## 🚀 NUEVAS FUNCIONALIDADES MAYORES

### 1. ⚙️ **Gestor de Reglas Editables**

**Panel completo para personalizar restricciones del sistema**

✅ **Funcionalidades:**
- **Activar/Desactivar reglas** dinámicamente
- **Ajustar pesos** de restricciones SOFT (scoring)
- **Visualización clara** de HARD vs SOFT constraints
- **Restaurar configuración** predeterminada
- **Guardado automático** en LocalStorage
- **Aplicación inmediata** al regenerar cronograma

✅ **Reglas Disponibles:**

| ID | Tipo | Nombre | Descripción | Peso | Editable |
|----|------|--------|-------------|------|----------|
| R1.3 | SOFT | Capacidad Diaria | 3 profesionales recomendados (ya no obligatorio) | 50 | ✅ |
| R1.4 | HARD | Exclusión Cristina/Agustina | Nunca pueden trabajar juntas | N/A | ✅ |
| R3.1 | SOFT | Cristina → Pueyrredón | Prioridad preferencial | 100 | ✅ |
| R3.2 | SOFT | Natalia/Leticia → Juncal | Prioridad preferencial | 100 | ✅ |
| R3.3 | SOFT | Agustina evita UC | Penalización si asignada | -50 | ✅ |
| R3.4 | SOFT | Bonus por Especialidad | Match área-especialidad | 10 | ✅ |

✅ **¿Cómo Funciona?**

**Escenario 1: Desactivar regla R1.4 temporalmente**
```
1. Abrir "Gestión de Reglas"
2. Localizar "R1.4: Exclusión Cristina/Agustina"
3. Click en "Toggle" → Cambiar a INACTIVA
4. Guardar cambios
5. Regenerar cronograma
6. ✅ Ahora Cristina y Agustina PUEDEN trabajar juntas
```

**Escenario 2: Aumentar prioridad de Cristina en Pueyrredón**
```
1. Abrir "Gestión de Reglas"
2. Localizar "R3.1: Cristina prioritaria en Pueyrredón"
3. Ajustar slider de peso: 100 → 200
4. Guardar cambios
5. Regenerar cronograma
6. ✅ Cristina tendrá MUY alta prioridad en Pueyrredón
```

**Escenario 3: Hacer flexible el requisito de 3 médicos**
```
- R1.3 ahora es SOFT (no HARD)
- Puede desactivarse si hay escasez de personal
- Si activa: Solo advierte cuando hay < 3 médicos (no bloquea)
- Si inactiva: Permite cualquier cantidad de asignaciones
```

---

### 2. 👥 **Gestor de Médicos Editables**

**Panel completo para personalizar cada profesional**

✅ **Funcionalidades:**
- **Editar disponibilidad** por día de semana (Lun-Vie)
- **Modificar especialidad** de cada médico
- **Cambiar nombres** si es necesario
- **Vista de estadísticas**: Días disponibles, % disponibilidad
- **Guardado automático** de configuración personalizada
- **Restaurar valores** predeterminados
- **Exportar/Importar** configuración (JSON)

✅ **Información por Médico:**

```typescript
{
  id: string;                    // Identificador único
  name: string;                  // "Dra. María García"
  specialty: string;             // "Infectología Clínica"
  availableDays: DayOfWeek[];    // [1, 2, 3, 4, 5] = Lun-Vie
}
```

✅ **Casos de Uso:**

**Caso 1: Médico trabaja solo 3 días por semana**
```
1. Abrir "Gestión de Médicos"
2. Seleccionar médico (ej: Leticia)
3. Click "Editar"
4. Desmarcar días no disponibles (ej: dejar solo Lun, Mie, Vie)
5. Guardar cambios
6. ✅ Leticia solo será asignada Lunes, Miércoles, Viernes
```

**Caso 2: Cambiar especialidad para mejor scoring**
```
1. Abrir "Gestión de Médicos"
2. Seleccionar médico
3. Editar campo "Especialidad"
4. Ej: Cambiar "Infectología" → "Infectología - Especialista en Unidades Críticas"
5. Guardar
6. ✅ Scoring automático mejorará asignaciones en UC
```

**Caso 3: Añadir médico nuevo al equipo**
```
PENDIENTE: Función addDoctor() ya implementada en el servicio
UI de "Añadir Nuevo Médico" pendiente (próxima versión)
```

---

### 3. ✈️ **Gestor de Vacaciones**

**Sistema completo para gestionar ausencias programadas**

✅ **Funcionalidades:**
- **Añadir vacaciones** con fecha inicio/fin
- **Seleccionar médico** del equipo
- **Motivo opcional** (vacaciones, licencia médica, etc.)
- **Visualización de duración** en días
- **Advertencia automática** si vacación afecta mes actual
- **Eliminación** de vacaciones
- **Historial completo** de todas las ausencias
- **Exportar/Importar** vacaciones (JSON)
- **Limpieza automática** de vacaciones antiguas (> 1 año)

✅ **Información por Vacación:**

```typescript
{
  id: string;               // Generado automáticamente
  doctorId: string;         // "leticia"
  doctorName: string;       // "Leticia"
  startDate: string;        // "2025-01-15" (ISO format)
  endDate: string;          // "2025-01-30" (ISO format)
  reason?: string;          // "Vacaciones anuales"
}
```

✅ **Integración con Scheduler:**

**Cómo Funciona Internamente:**
```javascript
// Al generar cronograma, ANTES de asignar:
for (const date of workingDays) {
  let availableDoctors = DOCTORS.filter(doc => {
    // 1. Verificar disponibilidad por día de semana
    if (!doc.availableDays.includes(dayOfWeek)) return false;
    
    // 2. Verificar si está de vacaciones (NUEVO)
    if (isDoctorOnVacation(doc.id, dateISO)) return false;
    
    return true;
  });
  
  // ... continuar con asignación
}
```

✅ **Casos de Uso:**

**Caso 1: Vacaciones de verano (15 días)**
```
1. Abrir "Gestión de Vacaciones"
2. Click "Añadir Nueva Vacación"
3. Seleccionar médico: "Cristina"
4. Fecha Inicio: 2025-02-01
5. Fecha Fin: 2025-02-15
6. Motivo: "Vacaciones de verano"
7. Guardar
8. ✅ Cristina NO será asignada entre Feb 1-15
```

**Caso 2: Licencia médica corta (3 días)**
```
1. Añadir vacación:
   - Médico: Natalia
   - Inicio: 2025-01-20
   - Fin: 2025-01-22
   - Motivo: "Licencia médica"
2. ✅ Natalia no aparecerá en esos 3 días
```

**Caso 3: Advertencia de mes actual**
```
- Si agregas vacación que incluye el mes visible
- Sistema muestra ALERTA NARANJA
- "⚠️ 1 vacación en el mes actual - Regenera el cronograma"
- Al regenerar, se aplica automáticamente
```

---

## 🔄 CAMBIOS IMPORTANTES EN EL SISTEMA

### A. **R1.3 Ya NO es Obligatorio**

**ANTES (v1.x):**
```
R1.3: HARD - Exactamente 3 profesionales por día
❌ ERROR si hay menos de 3 asignados
```

**AHORA (v2.0):**
```
R1.3: SOFT - 3 profesionales RECOMENDADOS
⚠️ ADVERTENCIA si hay menos de 3
✅ PERMITE cronogramas con 1, 2 o 3 asignaciones
```

**¿Por qué?**
- Flexibilidad en situaciones de escasez de personal
- Permite vacaciones múltiples simultáneas
- Adaptable a días festivos o circunstancias especiales
- El coordinador decide si 2 profesionales son suficientes

**Activar/Desactivar:**
- `Gestión de Reglas` → R1.3 → Toggle ON/OFF
- Si OFF: No muestra advertencias, acepta cualquier cantidad
- Si ON: Muestra warnings pero permite generación

---

### B. **Configuración Personalizada de Médicos**

**Sistema de Carga Dinámica:**

```javascript
// ANTES (v1.x): Datos estáticos
import { DOCTORS } from './constants';

// AHORA (v2.0): Datos dinámicos desde LocalStorage
import { loadDoctorsConfig } from './services/doctorsService';
const DOCTORS = loadDoctorsConfig(); // Devuelve configuración personalizada o predeterminada
```

**Persistencia:**
- LocalStorage Key: `infectoplan_doctors_config`
- Se carga al iniciar la app
- Se actualiza al editar médicos
- Fallback a valores predeterminados si no hay personalización

---

### C. **Integración de Vacaciones en CSP**

**Nuevo Flujo de Verificación:**

```
┌─────────────────────────────────────────┐
│ GENERAR CRONOGRAMA                      │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│ Para cada día del mes:                  │
│  1. Obtener médicos disponibles         │
│     - Verificar día de semana ✅         │
│     - Verificar vacaciones (NUEVO) ✅    │
│  2. Aplicar R1.4 (exclusión)            │
│  3. Calcular scores con reglas activas  │
│  4. Asignar mejores candidatos          │
└─────────────────────────────────────────┘
```

---

## 📊 ARQUITECTURA ACTUALIZADA

### Nuevos Archivos:

```
src/
├── services/
│   ├── doctorsService.ts          [NUEVO] - Gestión de médicos
│   ├── vacationsService.ts        [NUEVO] - Gestión de vacaciones
│   ├── scheduler.ts               [ACTUALIZADO] - Integra vacaciones
│   └── storageService.ts          [ACTUALIZADO] - saveConstraints/loadConstraints
│
├── components/
│   ├── RulesManager.tsx           [NUEVO] - Panel de reglas editables
│   ├── DoctorsManager.tsx         [NUEVO] - Panel de gestión de médicos
│   └── VacationsManager.tsx       [NUEVO] - Panel de vacaciones
│
├── types.ts                       [ACTUALIZADO] - Vacation interface
├── constants.ts                   [ACTUALIZADO] - R1.3 ahora SOFT
└── App.tsx                        [ACTUALIZADO] - Integra nuevos modales
```

### Nuevos Servicios (API):

#### doctorsService.ts
```typescript
- loadDoctorsConfig(): Doctor[]
- saveDoctorsConfig(doctors: Doctor[]): void
- updateDoctor(id: string, updates: Partial<Doctor>): boolean
- addDoctor(doctor: Omit<Doctor, 'id'>): Doctor
- deleteDoctor(id: string): boolean
- resetDoctorsConfig(): void
- exportDoctorsConfig(): void
- importDoctorsConfig(jsonData: string): boolean
- getDoctorStats(doctorId: string): { totalDaysAvailable, percentage }
```

#### vacationsService.ts
```typescript
- loadVacations(): Vacation[]
- saveVacations(vacations: Vacation[]): void
- addVacation(vacation: Omit<Vacation, 'id'>): Vacation
- deleteVacation(id: string): void
- updateVacation(id: string, updates: Partial<Vacation>): void
- isDoctorOnVacation(doctorId: string, date: string): boolean
- getDoctorVacations(doctorId: string): Vacation[]
- getVacationsInRange(startDate: string, endDate: string): Vacation[]
- cleanOldVacations(): number
- exportVacationsAsJSON(): void
- importVacationsFromJSON(jsonData: string): boolean
```

---

## 🎨 INTERFAZ ACTUALIZADA

### Nuevos Botones en Header:

```
┌────────────────────────────────────────────────────┐
│  [←] Diciembre 2025 [→]                            │
│                                                    │
│  [👥 Médicos] [✈️ Vacaciones] [⚙️ Reglas]         │
│  [✨ Reasignar Turnos]                             │
│  [📷 Capturar] [💾 Exportar] [📚 Historial]       │
└────────────────────────────────────────────────────┘
```

### Nuevos Modales:

1. **Gestor de Reglas** (Modal Indigo)
   - Lista de restricciones HARD/SOFT
   - Toggle ON/OFF por regla
   - Slider de pesos para SOFT
   - Botón "Restaurar predeterminado"

2. **Gestor de Médicos** (Modal Morado)
   - Cards expandibles por médico
   - Modo vista/edición
   - Checkboxes de días disponibles
   - Input de especialidad
   - Estadísticas de disponibilidad

3. **Gestor de Vacaciones** (Modal Cyan)
   - Formulario de añadir vacación
   - Lista ordenada por fecha
   - Badge "ESTE MES" para relevantes
   - Cálculo automático de duración
   - Botón eliminar por vacación

---

## 💾 ALMACENAMIENTO (LocalStorage)

### Nuevas Keys:

```javascript
// Configuración de médicos personalizada
infectoplan_doctors_config: Doctor[]

// Lista de vacaciones programadas
infectoplan_vacations: Vacation[]

// Restricciones personalizadas (ya existía, ahora se usa)
infectoplan_constraints: Constraint[]

// Cronograma actual (existente)
infectoplan_current_schedule: MonthSchedule

// Historial (existente)
infectoplan_schedule_history: MonthSchedule[]
```

### Capacidad Total Estimada:

```
- Doctors config:    ~5-10 KB
- Vacations:         ~10-20 KB (50 vacaciones)
- Constraints:       ~5 KB
- Current schedule:  ~30 KB
- History (50 items): ~1.5 MB
─────────────────────────────────
TOTAL:              ~1.6 MB / 5-10 MB disponibles ✅
```

---

## 🔥 FLUJOS DE USO PRINCIPALES

### Flujo 1: Configurar Disponibilidad de Médico

```
1. Usuario: Click "Médicos"
2. Sistema: Muestra panel con todos los médicos
3. Usuario: Click "Editar" en Leticia
4. Sistema: Modo edición con checkboxes de días
5. Usuario: Desmarcar Jueves y Viernes
6. Usuario: Click "Guardar Cambios"
7. Sistema: saveDoctorsConfig() → LocalStorage
8. Usuario: Cerrar panel
9. Usuario: Click "Reasignar Turnos"
10. Sistema: loadDoctorsConfig() → Leticia solo Lun-Mie
11. ✅ Cronograma generado SIN Leticia en Jue/Vie
```

### Flujo 2: Añadir Vacaciones de Verano

```
1. Usuario: Click "Vacaciones"
2. Usuario: Click "Añadir Nueva Vacación"
3. Usuario: Select médico "Cristina"
4. Usuario: Fecha inicio: 2025-01-15
5. Usuario: Fecha fin: 2025-01-30
6. Usuario: Motivo: "Vacaciones anuales"
7. Usuario: Click "Guardar Vacación"
8. Sistema: addVacation() → LocalStorage
9. Sistema: Muestra alerta "⚠️ 1 vacación en el mes actual"
10. Usuario: Click "Reasignar Turnos"
11. Sistema: isDoctorOnVacation("cristina", "2025-01-20") → true
12. ✅ Cristina NO aparece del 15 al 30 de enero
```

### Flujo 3: Desactivar Exclusión Cristina/Agustina

```
1. Usuario: Click "Reglas"
2. Usuario: Localizar "R1.4: Exclusión Mutua"
3. Usuario: Click toggle → Cambia a "Inactiva"
4. Usuario: Click "Guardar Cambios"
5. Sistema: saveConstraints([...]) con R1.4.active = false
6. Usuario: "Reasignar Turnos"
7. Sistema: if (isExclusionActive) { // false, se salta la restricción }
8. ✅ Cristina y Agustina PUEDEN trabajar el mismo día
```

### Flujo 4: Ajustar Peso de Prioridad

```
1. Usuario: Click "Reglas"
2. Usuario: Localizar "R3.1: Cristina prioritaria en Pueyrredón"
3. Usuario: Mover slider de 100 → 200
4. Usuario: "Guardar Cambios"
5. Usuario: "Reasignar Turnos"
6. Sistema: calculateScore() → Cristina+Pueyrredón = +200 puntos
7. ✅ Cristina casi SIEMPRE en Pueyrredón (máxima prioridad)
```

---

## ✅ CHECKLIST DE FUNCIONALIDADES v2.0

### Gestión de Reglas:
- [x] Panel modal de gestión de reglas
- [x] Toggle activar/desactivar por regla
- [x] Slider de ajuste de pesos (SOFT)
- [x] Guardar/Cargar en LocalStorage
- [x] Restaurar configuración predeterminada
- [x] Integración con scheduler
- [x] Validación dinámica según reglas activas

### Gestión de Médicos:
- [x] Panel modal de gestión de médicos
- [x] Modo vista/edición por médico
- [x] Editar nombre y especialidad
- [x] Seleccionar días disponibles (Lun-Vie)
- [x] Estadísticas de disponibilidad
- [x] Guardar/Cargar configuración personalizada
- [x] Restaurar configuración predeterminada
- [x] Exportar/Importar JSON
- [x] Integración con scheduler

### Gestión de Vacaciones:
- [x] Panel modal de vacaciones
- [x] Formulario añadir vacación
- [x] Seleccionar médico del equipo
- [x] Fecha inicio/fin
- [x] Motivo opcional
- [x] Lista de vacaciones programadas
- [x] Cálculo automático de duración
- [x] Advertencia si afecta mes actual
- [x] Eliminar vacaciones
- [x] Guardar/Cargar en LocalStorage
- [x] Exportar/Importar JSON
- [x] Integración con scheduler (isDoctorOnVacation)
- [x] Limpieza de vacaciones antiguas

### Cambios en Sistema Core:
- [x] R1.3 cambiado de HARD a SOFT
- [x] Scheduler usa loadDoctorsConfig() dinámica
- [x] Scheduler verifica vacaciones antes de asignar
- [x] validateSchedule() usa constraints actuales
- [x] generateSchedule() acepta constraints como parámetro

---

## 🎓 CONCEPTOS TÉCNICOS

### CSP (Constraint Satisfaction Problem)

**Definición:**
- Problema de encontrar solución que satisfaga restricciones
- En InfectoPlan: Asignar médicos cumpliendo todas las reglas

**Implementación:**
```
1. Variables: Médicos disponibles cada día
2. Dominios: Áreas a asignar (Juncal, Pueyrredón, UC)
3. Restricciones HARD: Deben cumplirse (ERROR si no)
4. Restricciones SOFT: Se optimizan (scoring)
```

### Scoring Algorithm

**Cómo Funciona:**
```javascript
function calculateScore(doctor, area, constraints) {
  let score = 0;
  
  // Iterar sobre constraints activas
  for (const constraint of constraints.filter(c => c.active)) {
    if (constraint.type === 'SOFT') {
      if (matchesCondition(doctor, area, constraint)) {
        score += constraint.weight; // Sumar peso si match
      }
    }
  }
  
  return score;
}

// Ejemplo:
// Cristina + Pueyrredón → +100 (R3.1)
// Leticia + Juncal → +100 (R3.2)
// Agustina + UC → -50 (R3.3)
```

**Proceso de Asignación:**
```
1. Para cada área (Juncal, Pueyrredón, UC):
2.   Calcular score de cada médico disponible
3.   Ordenar por score descendente
4.   Asignar el de mayor score
5.   Marcar como "usado" para este día
```

---

## 📈 COMPARACIÓN DE VERSIONES

| Característica | v1.x | v2.0 |
|----------------|------|------|
| Reglas editables | ❌ | ✅ |
| Gestión de médicos | ❌ | ✅ |
| Sistema de vacaciones | ❌ | ✅ |
| R1.3 (3 médicos) | HARD | SOFT |
| Días disponibles | Fijos | Editables |
| Especialidades | Fijas | Editables |
| Pesos de scoring | Fijos | Ajustables |
| Exportación ICS | ✅ | ✅ |
| Exportación CSV | ✅ | ✅ |
| Historial | ✅ | ✅ |
| Captura pantalla | ✅ | ✅ |
| Configuración personalizable | ❌ | ✅ |

---

## 🚀 PRÓXIMOS PASOS SUGERIDOS

### Funcionalidades Futuras (v2.1):

1. **Añadir Nuevos Médicos desde UI**
   - Botón "+" en Gestor de Médicos
   - Formulario completo
   - Validación de datos

2. **Calendario Visual de Vacaciones**
   - Vista mensual con vacaciones marcadas
   - Drag & drop para editar fechas
   - Colores por médico

3. **Reportes Avanzados**
   - Carga de trabajo por médico
   - Distribución de áreas
   - Gráficos de estadísticas

4. **Import/Export Masivo**
   - Importar médicos desde CSV
   - Importar vacaciones desde Google Calendar
   - Export a PDF del cronograma

5. **Reglas Personalizadas del Usuario**
   - Crear nuevas reglas desde UI
   - Definir condiciones personalizadas
   - Guardar como templates

---

**Versión**: 2.0.0  
**Fecha**: Diciembre 27, 2025  
**Estado**: ✅ PRODUCTION READY  
**Breaking Changes**: R1.3 ahora es SOFT, puede requerir ajustes en cronogramas existentes

