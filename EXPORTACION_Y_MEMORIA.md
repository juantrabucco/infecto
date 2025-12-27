# 📅 Sistema de Exportación y Memoria - InfectoPlan v1.2.0

## 🎉 Nuevas Funcionalidades Implementadas

### 1. ✅ Exportación Múltiple de Calendarios

Ahora puedes exportar el cronograma en **3 formatos diferentes**:

#### 📅 Formato .ICS (iCalendar) - **NUEVO**
**El más importante para compartir guardias**

- **Compatible con**:
  - ✅ Google Calendar
  - ✅ Microsoft Outlook
  - ✅ Apple Calendar (macOS, iOS)
  - ✅ Mozilla Thunderbird
  - ✅ Cualquier app que soporte RFC 5545

- **Características**:
  - Cada guardia se crea como evento individual
  - Horario: 8:00 AM - 4:00 PM (configurable)
  - Ubicación: Nombre del área (Juncal, Pueyrredón, UC)
  - **Alarmas incluidas**:
    - 📧 Email 1 día antes
    - 🔔 Notificación 1 hora antes
  - Categorías: "Guardia, Trabajo, Salud"

- **Cómo funciona**:
  1. Click en "Exportar" → ".ICS (iCalendar)"
  2. Se descarga: `infectoplan_guardias_diciembre_2025.ics`
  3. Abrir el archivo (doble click)
  4. Se abre la app de calendario predeterminada
  5. Click en "Importar" → ¡Listo!

#### 📊 Formato .CSV (Excel) - **NUEVO**
**Para análisis de datos y reportes**

- **Compatible con**:
  - ✅ Microsoft Excel
  - ✅ Google Sheets
  - ✅ LibreOffice Calc
  - ✅ Numbers (Mac)

- **Estructura**:
  ```csv
  Fecha,Día de Semana,Sector Juncal,Piso Pueyrredón,Unidades Cerradas,Completo,Total Asignaciones
  "01/12/2025","Lunes","Cristina","Sin asignar","Sin asignar","No",1
  "02/12/2025","Martes","Leticia","Agustina","Cecilia","Sí",3
  ```

- **Incluye resumen**:
  - Total días laborables
  - Días completos e incompletos
  - Total de asignaciones

#### 📄 Formato .JSON (Datos) - **Existente**
**Para backup técnico**

- Formato completo con todos los datos
- Útil para re-importación (futuro)
- Incluye metadata de generación

---

### 2. ✅ Exportación Individual por Médico - **NUEVO**

Cada médico puede descargar **SOLO sus propias guardias** en formato .ICS

#### Cómo Usar:
1. Click en "Exportar"
2. Click en "📧 Exportar por Médico Individual"
3. Seleccionar el médico de la lista
4. Se descarga: `mis_guardias_leticia_diciembre_2025.ics`

#### Características:
- **Personalizado**: Solo las guardias de ese médico
- **Optimizado**: Títulos como "Mi Guardia - Sector Juncal"
- **Recordatorios**: Email + notificación
- **Fácil de compartir**: Enviar por WhatsApp/Email

#### Ventajas:
- ✅ Privacidad: Cada médico solo ve sus propias guardias
- ✅ Limpio: No se llena el calendario con las guardias de otros
- ✅ Automático: Importar directamente sin filtrar

---

### 3. ✅ Sistema de Historial - **NUEVO**

Ahora **todos los cronogramas se guardan automáticamente** en el historial.

#### Funcionalidades:

##### Ver Historial
- Botón "Historial" (morado) en la barra superior
- Muestra todos los cronogramas generados
- Ordenados por fecha (más reciente primero)

##### Información por Cronograma:
- 📅 Mes y año
- 🕐 Fecha y hora de guardado
- 📊 Estadísticas (días totales, completos, asignaciones)
- 👁️ Vista previa de los primeros 5 días

##### Acciones:
- **Cargar**: Restaurar un cronograma anterior
- **Eliminar**: Borrar del historial
- **Hover**: Ver vista previa expandida

##### Límites:
- Máximo 50 cronogramas guardados
- Se eliminan los más antiguos automáticamente
- Almacenado en LocalStorage del navegador

---

## 🎯 Flujos de Uso

### Flujo 1: Coordinador → Enviar por Email

```
1. Generar cronograma del mes
2. Click "Exportar" → ".ICS (iCalendar)"
3. Descargar archivo .ics
4. Enviar por email a todos los médicos
5. Cada médico hace doble click → Se importa a su calendario
```

### Flujo 2: Coordinador → Imprimir para Cartelera

```
1. Generar cronograma
2. Click "Exportar" → ".CSV (Excel)"
3. Abrir en Excel
4. Formatear (colores, bordes)
5. Imprimir
6. Colocar en cartelera del departamento
```

### Flujo 3: Médico Individual

```
1. Coordinador: Click "Exportar" → "Exportar por Médico"
2. Seleccionar médico (ej: Leticia)
3. Enviar archivo `mis_guardias_leticia_dic_2025.ics` por WhatsApp
4. Leticia abre el archivo → Importa solo sus guardias
```

### Flujo 4: Recuperar Cronograma Anterior

```
1. Click botón "Historial"
2. Buscar cronograma deseado en la lista
3. Click "Cargar"
4. El cronograma se restaura
```

---

## 📋 Comparación de Formatos

| Característica | .ICS | .CSV | .JSON | PNG |
|----------------|------|------|-------|-----|
| **Importar a calendario** | ✅ Sí | ❌ No | ❌ No | ❌ No |
| **Abrir en Excel** | ❌ No | ✅ Sí | ⚠️ Difícil | ❌ No |
| **Enviar por WhatsApp** | ✅ Sí | ✅ Sí | ✅ Sí | ✅ Sí |
| **Visualizar fácilmente** | ⚠️ En calendario | ✅ En Excel | ❌ Código | ✅ Imagen |
| **Recordatorios automáticos** | ✅ Sí | ❌ No | ❌ No | ❌ No |
| **Editable** | ❌ No | ✅ Sí | ✅ Sí | ❌ No |
| **Backup completo** | ⚠️ Parcial | ⚠️ Parcial | ✅ Total | ❌ No |
| **Uso principal** | Calendarios | Análisis | Técnico | Visual |

### Recomendación:
- **Para médicos**: .ICS (importar a calendario)
- **Para reportes**: .CSV (Excel)
- **Para backup**: .JSON (datos completos)
- **Para compartir visual**: PNG (imagen)

---

## 🔧 Detalles Técnicos

### Formato iCalendar (.ics)

```ics
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//InfectoPlan//Gestion de Guardias//ES
METHOD:PUBLISH
X-WR-CALNAME:InfectoPlan - Guardias Médicas

BEGIN:VEVENT
UID:1735545600000-leticia-sector-juncal@infectoplan.app
DTSTART:20251202T080000Z
DTEND:20251202T160000Z
SUMMARY:Guardia - Sector Juncal
DESCRIPTION:Asignación en Sector Juncal\nMédico: Leticia\nHorario: 08:00 - 16:00
LOCATION:Sector Juncal
STATUS:CONFIRMED
CATEGORIES:Guardia,Trabajo,Salud

BEGIN:VALARM
TRIGGER:-P1D
ACTION:EMAIL
DESCRIPTION:Recordatorio: Guardia mañana
END:VALARM

BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Guardia en 1 hora
END:VALARM

END:VEVENT
END:VCALENDAR
```

### Características Implementadas:
- ✅ RFC 5545 compliant
- ✅ Timezone: America/Argentina/Buenos_Aires
- ✅ UIDs únicos por evento
- ✅ Escape de caracteres especiales
- ✅ Alarmas múltiples (email + display)
- ✅ Categorización de eventos
- ✅ BOM UTF-8 para Excel (CSV)

---

## 💾 Sistema de Almacenamiento

### LocalStorage Structure:

```javascript
// Cronograma actual
infectoplan_schedule: {
  month: 11,
  year: 2025,
  days: [...],
  generatedAt: "2025-12-27T..."
}

// Historial (NUEVO)
infectoplan_history: [
  {
    id: "2025-12-1735545600000",
    schedule: {...},
    savedAt: "2025-12-27T15:30:00Z",
    label: "Diciembre 2025"
  },
  {
    id: "2025-11-1732953600000",
    schedule: {...},
    savedAt: "2025-11-28T10:15:00Z",
    label: "Noviembre 2025"
  },
  // ... hasta 50 items
]
```

### Capacidad:
- LocalStorage: ~5-10 MB por dominio
- Cada cronograma: ~20-50 KB
- Historial de 50: ~1-2.5 MB
- ✅ Espacio suficiente para uso normal

---

## 📊 Métricas de Uso

### Archivos Generados:

#### Cronograma Completo:
- `infectoplan_guardias_diciembre_2025.ics` (~15 KB)
- `infectoplan_diciembre_2025.csv` (~5 KB)
- `infectoplan_2025_12.json` (~30 KB)
- `infectoplan_diciembre_2025.png` (~200-500 KB)

#### Por Médico:
- `mis_guardias_leticia_diciembre_2025.ics` (~3-5 KB)
- Contiene solo 4-8 eventos (guardias de ese médico)

---

## ✅ Checklist de Funcionalidades

- [x] Exportación .ICS (iCalendar completo)
- [x] Exportación .CSV (Excel)
- [x] Exportación .JSON (backup)
- [x] Exportación PNG (screenshot)
- [x] Exportación individual por médico (.ICS)
- [x] Sistema de historial automático
- [x] Panel de historial con UI
- [x] Cargar cronogramas del historial
- [x] Eliminar del historial
- [x] Vista previa en historial
- [x] Límite de 50 cronogramas
- [x] Estadísticas del historial

---

## 🎉 Beneficios

### Para Coordinadores:
- ✅ **Múltiples formatos** de exportación
- ✅ **Historial automático** de todos los cronogramas
- ✅ **Recuperación fácil** de versiones anteriores
- ✅ **Exportación individual** para cada médico

### Para Médicos:
- ✅ **Importación directa** a su calendario personal
- ✅ **Recordatorios automáticos** (1 día + 1 hora antes)
- ✅ **Solo sus guardias** (exportación individual)
- ✅ **Sincronización** con móvil/tablet/desktop

### Para el Departamento:
- ✅ **Profesionalismo**: Formato estándar de la industria
- ✅ **Compatibilidad**: Funciona con cualquier calendario
- ✅ **Trazabilidad**: Historial completo de cambios
- ✅ **Flexibilidad**: Excel para reportes, calendario para avisos

---

**Desarrollado**: Diciembre 27, 2025  
**Versión**: 1.2.0  
**Nuevas tecnologías**: iCalendar (RFC 5545), CSV con BOM UTF-8

