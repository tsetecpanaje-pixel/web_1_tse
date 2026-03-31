import * as XLSX from 'xlsx';
import { getModeloTren } from './utils';

export function exportToExcel(registros: any[]) {
    const now = new Date();
    const d = now.getDate().toString().padStart(2, '0');
    const m = (now.getMonth() + 1).toString().padStart(2, '0');
    const y = now.getFullYear();
    const h = now.getHours().toString().padStart(2, '0');
    const min = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');
    const fileName = `reporte-sgt-${d}${m}${y}${h}${min}${s}.xlsx`;

    const dataToExport = registros.map(r => {
        const repuestos: any[] = Array.isArray(r.repuestos) ? r.repuestos : [];

        return {
            'Tren': r.tren,
            'Modelo': getModeloTren(r.tren),
            'Fecha Entrada': r.fecha_hora_entrada ? new Date(r.fecha_hora_entrada).toLocaleString() : 'N/A',
            'Fecha Salida': r.fecha_hora_salida ? new Date(r.fecha_hora_salida).toLocaleString() : 'En taller',
            'Atención': r.tipo_atencion,
            'Ubicación': r.lugar_destino,
            'Motivo': r.motivo_trabajo,
            'Observación': r.observacion || '',
            'Solución': r.solucion || '',
            'Resumen Repuestos': repuestos.map(rp => {
                let s = `${rp.prefijo} ${rp.nombre}`;
                if (rp.manual) s += ` (${rp.manual})`;
                if (rp.coche) s += ` [${rp.coche}]`;
                if (rp.prefijo === 'CR/' || rp.prefijo === 'CC/') {
                    s += ` x ${rp.nombre}`;
                    if (rp.manual_2) s += ` (${rp.manual_2})`;
                    if (rp.coche_2) s += ` [${rp.coche_2}]`;
                }
                if (rp.prefijo === 'CT/' || rp.prefijo === 'CRT/') {
                    if (rp.tren) s += ` T# ${rp.tren}`;
                    s += ` ${rp.nombre}`;
                    if (rp.manual_2) s += ` (${rp.manual_2})`;
                    if (rp.coche_2) s += ` [${rp.coche_2}]`;
                }
                const sep = [];
                if (rp.s) sep.push(`S:${rp.s}`);
                if (rp.e) sep.push(`E:${rp.e}`);
                if (rp.p) sep.push(`P:${rp.p}`);
                if (sep.length > 0) s += ` [${sep.join(' ')}]`;
                return s;
            }).join(' ; '),
            'Mini Filtro': r.mini_filtros || 'N/A',
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registros');
    XLSX.writeFile(workbook, fileName);
}
