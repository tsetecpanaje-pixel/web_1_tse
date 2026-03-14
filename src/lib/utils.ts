/**
 * Identifica el modelo de tren basado en su numeración
 * Parámetros:
 * - 01 al 50: NS-74
 * - 51 al 99: NS-93
 * - 131 al 170: NS-16
 */
export function getModeloTren(numero: string | number): string {
    const n = typeof numero === 'string' ? parseInt(numero, 10) : numero;

    if (isNaN(n)) return 'Desconocido';

    if (n >= 1 && n <= 50) return 'NS-74';
    if (n >= 51 && n <= 99) return 'NS-93';
    if (n >= 131 && n <= 170) return 'NS-16';

    return 'Desconocido';
}

/**
 * Formatea una fecha para inputs tipo datetime-local usando la zona horaria local
 */
export function formatDateTimeLocal(date: Date | string | undefined | null): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    // Ajustar por el offset de la zona horaria local
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISODate = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);

    return localISODate;
}
