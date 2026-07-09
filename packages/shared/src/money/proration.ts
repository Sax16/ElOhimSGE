// Prorrateo de pensiones para traslados entrantes. Cálculo puro sobre números de mes.

/**
 * Filtra los meses cobrables a un estudiante que ingresa por traslado.
 *
 * Regla (decisión del usuario): se cobran los meses POSTERIORES al mes de ingreso,
 * más el mes de ingreso mismo si el día de ingreso cae dentro del corte
 * (day(entryDate) <= cutoffDay). Los meses anteriores no se generan.
 *
 * @param months    números de mes del año (2..12), en orden.
 * @param entryDate fecha de ingreso ISO yyyy-mm-dd (se parsea como string, sin TZ local).
 * @param cutoffDay día de corte de traslados (BillingSettings.transferCutoffDay).
 */
export function billableMonths(months: number[], entryDate: string, cutoffDay: number): number[] {
  const parts = entryDate.split('-');
  const entryMonth = Number(parts[1]);
  const entryDay = Number(parts[2]);
  return months.filter((month) => {
    if (month > entryMonth) return true;
    if (month === entryMonth) return entryDay <= cutoffDay;
    return false;
  });
}
