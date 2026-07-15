// Vista standalone de Portería (R3 · Etapa 2): marcación de personal del día de
// hoy con la hora del servidor. Reutiliza AttendanceTab en modo 'porteria'
// (día fijo hoy, sin date picker, sin export, sin reglas, sin corregir).
// El título/migas los pone AppLayout desde META['pmarcacion'].
import { AttendanceTab } from '../staff/attendance/AttendanceTab';

export function PorteriaPage() {
  return <AttendanceTab mode="porteria" />;
}
