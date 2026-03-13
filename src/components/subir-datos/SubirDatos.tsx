'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, FileText, Check, X, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { parse as parseDateFns, isValid } from 'date-fns';

interface RegistroCSV {
    tren: string;
    fecha_hora_entrada: string;
    tipo_atencion: string;
    lugar_destino: string;
    motivo_trabajo: string;
    om?: string;
    mini_filtros?: string;
    observacion?: string;
    solucion?: string;
    disponible: boolean;
    tecnicos_involucrados?: string;
    fecha_hora_salida?: string;
}

interface RegistroPreview extends RegistroCSV {
    _row: number;
    _valid: boolean;
    _errors: string[];
}

const TIPOS_ATENCION = ['Avería', 'Mantenimiento Preventivo', 'O. Especial', 'Evacuación', 'Lavado', 'Estacionado', 'Cambio de Posición', 'Otro'];
const LUGARES = ['Foso 1', 'Foso 2', 'Foso 3', 'Foso 4', 'Foso 5', 'Foso 6', 'Nave Lavado', 'Vía Prueba', 'FV VV', 'FV PM', 'Cochera G14-1', 'Cochera G14-2', 'Cochera_1', 'Cochera_2', 'Cochera_3', 'Cochera_4'];
const FILTROS = ['MIT/MIF', 'Puertas', 'OR', 'CVS / NCB', 'Neumáticos', 'PA', 'Humo', 'Otros'];

const CSV_HEADERS = [
    'tren',
    'fecha_hora_entrada',
    'tipo_atencion',
    'lugar_destino',
    'motivo_trabajo',
    'om (opcional)',
    'mini_filtros (opcional)',
    'observacion (opcional)',
    'solucion (opcional)',
    'disponible (true/false)',
    'tecnicos_involucrados (opcional,separados por coma)',
    'fecha_hora_salida (opcional)'
];

export default function SubirDatos() {
    const [csvText, setCsvText] = useState('');
    const [parsedData, setParsedData] = useState<RegistroPreview[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);

    const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result.map(v => v.replace(/"/g, ''));
    };

    const parseCSV = useCallback((text: string): RegistroPreview[] => {
        const lines = text.trim().split('\n').filter(line => line.trim());
        if (lines.length < 2) return [];

        const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());

        const getValueByHeader = (values: string[], headerName: string): string => {
            const index = headers.findIndex(h => h === headerName || h.includes(headerName.replace(' (opcional)', '')));
            return index >= 0 && index < values.length ? values[index] : '';
        };

        const data: RegistroPreview[] = [];

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            const row: Partial<RegistroCSV> = {};
            const errors: string[] = [];

            const tren = getValueByHeader(values, 'tren');
            row.tren = tren;
            if (!tren) errors.push('Tren requerido');

            const fechaEntrada = getValueByHeader(values, 'fecha_hora_entrada');
            row.fecha_hora_entrada = fechaEntrada;
            if (!fechaEntrada) {
                errors.push('Fecha de entrada requerida');
            } else if (!parseDate(fechaEntrada)) {
                errors.push(`Fecha de entrada inválida: ${fechaEntrada}. Use YYYY-MM-DD o DD-MM-YYYY`);
            }

            const tipo = getValueByHeader(values, 'tipo_atencion');
            row.tipo_atencion = tipo;
            if (!tipo) {
                errors.push('Tipo de atención requerido');
            } else if (!TIPOS_ATENCION.includes(tipo)) {
                errors.push(`Tipo de atención inválido: ${tipo}`);
            }

            const lugar = getValueByHeader(values, 'lugar_destino');
            row.lugar_destino = lugar;
            if (!LUGARES.includes(lugar)) errors.push(`Lugar inválido: ${lugar}`);

            const motivo = getValueByHeader(values, 'motivo_trabajo');
            row.motivo_trabajo = motivo;
            if (!motivo || motivo.length < 5) errors.push('Motivo requerido (mín. 5 caracteres)');

            row.om = getValueByHeader(values, 'om') || undefined;
            row.mini_filtros = getValueByHeader(values, 'mini_filtros') || undefined;
            row.observacion = getValueByHeader(values, 'observacion') || undefined;
            row.solucion = getValueByHeader(values, 'solucion') || undefined;

            const disponible = getValueByHeader(values, 'disponible');
            row.disponible = disponible.toLowerCase() === 'true';

            row.tecnicos_involucrados = getValueByHeader(values, 'tecnicos_involucrados') || undefined;

            const fechaSalida = getValueByHeader(values, 'fecha_hora_salida');
            row.fecha_hora_salida = fechaSalida || undefined;
            if (fechaSalida && !parseDate(fechaSalida)) {
                errors.push(`Fecha de salida inválida: ${fechaSalida}`);
            }

            data.push({
                tren: row.tren || '',
                fecha_hora_entrada: row.fecha_hora_entrada || '',
                tipo_atencion: row.tipo_atencion || 'Otro',
                lugar_destino: row.lugar_destino || 'Foso 1',
                motivo_trabajo: row.motivo_trabajo || '',
                om: row.om,
                mini_filtros: row.mini_filtros,
                observacion: row.observacion,
                solucion: row.solucion,
                disponible: row.disponible || false,
                tecnicos_involucrados: row.tecnicos_involucrados,
                fecha_hora_salida: row.fecha_hora_salida,
                _row: i,
                _valid: errors.length === 0,
                _errors: errors
            });
        }

        return data;
    }, []);

    const handleTextChange = useCallback((text: string) => {
        setCsvText(text);
        if (text.trim()) {
            const parsed = parseCSV(text);
            setParsedData(parsed);
        } else {
            setParsedData([]);
        }
        setImportResult(null);
    }, [parseCSV]);

    const parseDate = (dateStr: string | undefined): string | null => {
        if (!dateStr || !dateStr.trim()) return null;

        const cleanStr = dateStr.trim();

        // 1. Intentar parseo nativo (útil para ISO YYYY-MM-DD)
        const date = new Date(cleanStr);
        if (!isNaN(date.getTime()) && cleanStr.includes('-') && cleanStr.indexOf('-') === 4) {
            return date.toISOString();
        }

        // 2. Intentar formatos comunes con date-fns (DD-MM-YYYY, DD/MM/YYYY)
        const formats = [
            'dd-MM-yyyy HH:mm:ss',
            'dd/MM/yyyy HH:mm:ss',
            'dd-MM-yyyy HH:mm',
            'dd/MM/yyyy HH:mm',
            "dd-MM-yyyy'T'HH:mm:ss",
            "dd/MM/yyyy'T'HH:mm:ss",
            'dd-MM-yyyy',
            'dd/MM/yyyy',
            'yyyy-MM-dd HH:mm:ss',
            'yyyy-MM-dd HH:mm'
        ];

        for (const fmt of formats) {
            try {
                const parsed = parseDateFns(cleanStr, fmt, new Date());
                if (isValid(parsed)) return parsed.toISOString();
            } catch (e) {
                // Ignorar error y probar siguiente formato
            }
        }

        return null;
    };

    const handleImport = async () => {
        const validRecords = parsedData.filter(r => r._valid);
        if (validRecords.length === 0) return;

        setIsProcessing(true);
        let success = 0;
        let failed = 0;

        for (const record of validRecords) {
            try {
                const fechaEntrada = parseDate(record.fecha_hora_entrada);
                const fechaSalida = parseDate(record.fecha_hora_salida);

                if (!fechaEntrada) {
                    console.error('Fecha de entrada inválida:', record.fecha_hora_entrada);
                    failed++;
                    continue;
                }

                const insertData = {
                    tren: record.tren,
                    fecha_hora_entrada: fechaEntrada,
                    tipo_atencion: record.tipo_atencion,
                    lugar_destino: record.lugar_destino,
                    motivo_trabajo: record.motivo_trabajo,
                    om: record.om || null,
                    mini_filtros: record.mini_filtros || null,
                    observacion: record.observacion || null,
                    solucion: record.solucion || null,
                    disponible: record.disponible,
                    tecnicos_involucrados: record.tecnicos_involucrados
                        ? record.tecnicos_involucrados.split(',').map(t => t.trim()).filter(Boolean)
                        : [],
                    fecha_hora_salida: fechaSalida
                };

                const { error } = await supabase.from('trenes_registros').insert([insertData]);

                if (error) {
                    console.error('Error inserting:', error);
                    failed++;
                } else {
                    success++;
                }
            } catch (err) {
                console.error('Error:', err);
                failed++;
            }
        }

        setImportResult({ success, failed });
        setIsProcessing(false);
    };

    const handleClear = () => {
        setCsvText('');
        setParsedData([]);
        setImportResult(null);
    };

    const copyExampleCSV = () => {
        const example = `tren,fecha_hora_entrada,tipo_atencion,lugar_destino,motivo_trabajo,om,mini_filtros,observacion,solucion,disponible,tecnicos_involucrados,fecha_hora_salida
G12,2024-01-15T08:30:00,Avería,Foso 1,Fallo en sistema de puertas,12345,Puertas,Revisión de puertas,Cambio de relay,false,"Juan Pérez,Pedro Gómez",2024-01-15T14:00:00
NS93-02,2024-01-16T10:00:00,Mantenimiento Preventivo,Foso 2,Mantenimiento cíclico,54321,MIT/MIF,Sin observaciones,Mantenimiento completado,true,Carlos López,
NS74-05,2024-01-17T09:00:00,O. Especial,Vía Prueba,Inspección programada,,,,Inspección completada,true,,
47,2026-03-09T08:30:00,Avería,Foso 4,Fallo en sistema de puertas,,Puertas,Revisión de puertas,Cambio de relay,false,Fernando Barria L.,2026-03-09T10:30:00`;

        setCsvText(example);
        const parsed = parseCSV(example);
        setParsedData(parsed);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                        <Upload className="w-6 h-6 text-primary" />
                        Subir Datos
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Importa múltiples registros pegando datos en formato CSV
                    </p>
                </div>
                <button
                    onClick={copyExampleCSV}
                    className="btn-secondary text-sm flex items-center gap-2"
                >
                    <FileText className="w-4 h-4" />
                    Ver ejemplo CSV
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="dashboard-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                Pegar datos CSV
                            </h3>
                            {csvText && (
                                <button
                                    onClick={handleClear}
                                    className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Limpiar
                                </button>
                            )}
                        </div>
                        <textarea
                            value={csvText}
                            onChange={(e) => handleTextChange(e.target.value)}
                            placeholder={`${CSV_HEADERS.join(', ')}\n...`}
                            className="w-full h-64 bg-background border border-border rounded-xl px-4 py-3 text-xs font-mono focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                        />
                        <p className="text-[10px] text-muted-foreground mt-2">
                            Formato: Tren, Fecha/Hora entrada, Tipo atención, Lugar, Motivo, OM, Mini filtros, Observación, Solución, Disponible, Técnicos, Fecha/Hora salida
                        </p>
                    </div>

                    {importResult && (
                        <div className={`dashboard-card p-4 border-l-4 ${importResult.failed > 0 ? 'border-orange-500' : 'border-green-500'}`}>
                            <div className="flex items-center gap-3">
                                {importResult.failed > 0 ? (
                                    <AlertCircle className="w-5 h-5 text-orange-500" />
                                ) : (
                                    <Check className="w-5 h-5 text-green-500" />
                                )}
                                <div>
                                    <p className="font-bold text-sm">
                                        Importación completada
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {importResult.success} registros importados exitosamente
                                        {importResult.failed > 0 && `, ${importResult.failed} fallidos`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="dashboard-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold flex items-center gap-2">
                                <Check className="w-4 h-4 text-primary" />
                                Vista previa
                            </h3>
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                                {parsedData.length} registros
                            </span>
                        </div>

                        {parsedData.length > 0 ? (
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                {parsedData.map((record, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-3 rounded-lg border ${record._valid
                                            ? 'bg-green-500/5 border-green-500/20'
                                            : 'bg-orange-500/5 border-orange-500/20'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {record._valid ? (
                                                        <Check className="w-3 h-3 text-green-500" />
                                                    ) : (
                                                        <X className="w-3 h-3 text-orange-500" />
                                                    )}
                                                    <span className="font-bold text-sm">Tren {record.tren}</span>
                                                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
                                                        {record.tipo_atencion}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {record.motivo_trabajo}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground mt-1">
                                                    {record.fecha_hora_entrada} → {record.lugar_destino}
                                                </p>
                                            </div>
                                        </div>
                                        {!record._valid && record._errors.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-orange-500/20">
                                                {record._errors.map((error, i) => (
                                                    <p key={i} className="text-[10px] text-orange-500 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" />
                                                        {error}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Pega los datos CSV para ver la vista previa</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleImport}
                        disabled={parsedData.filter(r => r._valid).length === 0 || isProcessing}
                        className={`w-full btn-primary py-3 flex items-center justify-center gap-2 ${parsedData.filter(r => r._valid).length === 0 || isProcessing
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                            }`}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Importando...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                Importar {parsedData.filter(r => r._valid).length} registros
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
