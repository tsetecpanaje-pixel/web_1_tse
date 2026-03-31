'use client';

import { useState } from 'react';
import { useEffect } from 'react';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TipoAtencion, LugarDestino, MiniFiltros, RegistroTren } from '@/types/database';
import { X, Save, AlertCircle, ArrowRightLeft, ChevronDown, Train, Plus, Trash2 } from 'lucide-react';
import { getModeloTren, formatDateTimeLocal } from '@/lib/utils';
import { useConfigTecnicos, useConfigTrenes } from '@/hooks/useConfig';

const registroSchema = z.object({
    tren: z.string().min(1, 'Número de tren requerido'),
    fecha_hora_entrada: z.string().min(1, 'Fecha de entrada requerida'),
    tipo_atencion: z.string().min(1, 'Tipo de atención requerido'),
    lugar_destino: z.string().min(1, 'Lugar de destino requerido'),
    motivo_trabajo: z.string().min(5, 'Motivo demasiado corto'),
    om: z.string().optional(),
    mini_filtros: z.array(z.string()).default([]),
    observacion: z.string().optional(),
    solucion: z.string().optional(),
    disponible: z.boolean().default(false),
    tecnicos_involucrados: z.array(z.string()).default([]),
    fecha_hora_salida: z.string().optional(),
    nueva_posicion: z.string().optional(),
    nueva_fecha_hora_entrada: z.string().optional(),
    repuestos: z.array(z.object({
        prefijo: z.string().optional(),
        nombre: z.string().optional(),
        manual: z.string().optional(),
        coche: z.string().optional(),
        nombre_2: z.string().optional(),
        manual_2: z.string().optional(),
        coche_2: z.string().optional(),
        s: z.string().optional(),
        e: z.string().optional(),
        p: z.string().optional(),
        tren: z.string().optional(),
        nombre_ct: z.string().optional(),
        manual_ct: z.string().optional(),
    })).default([]),
});

interface FormularioRegistroProps {
    initialData?: Partial<RegistroTren>;
    onSubmit: (data: any) => void;
    onClose: () => void;
    tecnicos: string[];
    registros: RegistroTren[];
    mode?: 'add' | 'edit' | 'move';
}

const TIPOS_ATENCION: TipoAtencion[] = ['Avería', 'Mantenimiento Preventivo', 'O. Especial', 'Evacuación', 'Lavado', 'Estacionado', 'Cambio de Posición', 'Otro'];
const LUGARES: LugarDestino[] = ['Foso 1', 'Foso 2', 'Foso 3', 'Foso 4', 'Foso 5', 'Foso 6', 'Nave Lavado', 'Vía Prueba', 'FV VV', 'FV PM', 'Cochera G14-1', 'Cochera G14-2', 'Cochera_1', 'Cochera_2', 'Cochera_3', 'Cochera_4'];
const FILTROS: MiniFiltros[] = ['MIT/MIF', 'Puertas', 'OR', 'CVS / NCB', 'Neumáticos', 'PA', 'Humo', 'Otros'];
const REPUESTOS_PREFIJOS = ["C/", "CR/", "CC/", "CT/", "CRT/"];
const REPUESTOS_NOMBRES = ["OR N", "OR S", "BLRS", "BLR N", "Panel SMF", "Mando ETF", "Mando CVS", "A613", "A633", "MTDJ", "MoPo NS93", "MoPo NS74"];

const COCHES_POR_MODELO: Record<string, string[]> = {
    'NS-74': ["MI", "Paux.", "Porig.", "Norig.", "Naux.", "R", "MP"],
    'NS-93': ["S1", "N1", "N2", "N3", "R", "N5", "S2"],
    'NS-16': ["S1", "N1", "N2", "R", "N3", "N4", "S2"]
};

export default function FormularioRegistro({ initialData, onSubmit, onClose, tecnicos, registros, mode = 'add' }: FormularioRegistroProps) {
    const { tecnicosPorCategoria } = useConfigTecnicos();
    const { trenes } = useConfigTrenes();
    const [showTrenSelector, setShowTrenSelector] = useState(false);
    const [activeRepuestoTrenSelector, setActiveRepuestoTrenSelector] = useState<number | null>(null);

    // Build dynamic lists from DB
    const TECNICOS_PREVENTIVO = tecnicosPorCategoria('preventivo').map(t => t.nombre).sort();
    const TECNICOS_CORRECTIVO = tecnicosPorCategoria('general').map(t => t.nombre).sort();
    const TECNICOS_EXTERNO_ONLY = tecnicosPorCategoria('especial').map(t => t.nombre);
    const TECNICOS_EXTERNO = [...TECNICOS_EXTERNO_ONLY, ...TECNICOS_CORRECTIVO].sort();
    const TECNICOS_TODOS = Array.from(new Set([...TECNICOS_PREVENTIVO, ...TECNICOS_EXTERNO])).sort();

    const { register, control, handleSubmit, formState: { errors }, setValue, watch } = useForm({
        resolver: zodResolver(registroSchema),
        defaultValues: {
            tren: initialData?.tren || '',
            fecha_hora_entrada: formatDateTimeLocal(initialData?.fecha_hora_entrada || new Date()),
            tipo_atencion: initialData?.tipo_atencion || 'Avería',
            lugar_destino: initialData?.lugar_destino || 'Foso 1',
            motivo_trabajo: initialData?.motivo_trabajo || '',
            om: initialData?.om || '',
            mini_filtros: initialData?.mini_filtros
                ? (Array.isArray(initialData.mini_filtros) ? initialData.mini_filtros : [initialData.mini_filtros as any])
                : [],
            observacion: initialData?.observacion || '',
            solucion: initialData?.solucion || '',
            disponible: initialData?.disponible || false,
            tecnicos_involucrados: initialData?.tecnicos_involucrados || [],
            fecha_hora_salida: formatDateTimeLocal(initialData?.fecha_hora_salida || (mode === 'move' ? new Date() : undefined)),
            nueva_posicion: 'Foso 1',
            nueva_fecha_hora_entrada: formatDateTimeLocal(new Date()),
            repuestos: initialData?.repuestos || []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "repuestos"
    });


    const trenColors = trenes.filter(t => t.activo).map(tren => ({
        numero: tren.numero,
        modelo: tren.modelo,
        colorClass: tren.modelo === 'NS-74'
            ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
            : tren.modelo === 'NS-93'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/40'
    }));

    // Get trains already in workshop (without exit date)
    const selectedTecnicns = watch('tecnicos_involucrados') as string[];
    const selectedFiltros = watch('mini_filtros') as string[];
    const selectedLugar = watch('lugar_destino');
    const selectedTipo = watch('tipo_atencion');
    const isDisponible = watch('disponible');
    const exitDate = watch('fecha_hora_salida');
    const solucion = watch('solucion');
    const nuevaPosicion = watch('nueva_posicion');
    const nuevaFechaEntrada = watch('nueva_fecha_hora_entrada');
    const watchedRepuestos = watch('repuestos');

    // Auto-sync repuesto_nombre_ct with repuesto_nombre for CT/ and CRT/ per line
    // Also sync nombre_2 with nombre for CR/
    useEffect(() => {
        watchedRepuestos?.forEach((r: any, index: number) => {
            if (r.prefijo === 'CT/' || r.prefijo === 'CRT/') {
                if (r.nombre_ct !== r.nombre) {
                    setValue(`repuestos.${index}.nombre_ct` as any, r.nombre);
                }
            }
            if (r.prefijo === 'CR/') {
                if (r.nombre_2 !== r.nombre) {
                    setValue(`repuestos.${index}.nombre_2` as any, r.nombre);
                }
            }
        });
    }, [watchedRepuestos, setValue]);

    const trainsInWorkshop = registros
        .filter(r => !r.fecha_hora_salida && r.id !== initialData?.id)
        .map(r => r.tren);

    // Filter available trains (not in workshop or editing current record) - sorted by complete number
    const availableTrains = trenColors
        .filter(t => !trainsInWorkshop.includes(t.numero))
        .sort((a, b) => a.numero.localeCompare(b.numero, undefined, { numeric: true, sensitivity: 'base' }));

    const workshopTrains = trenColors
        .filter(t => trainsInWorkshop.includes(t.numero))
        .sort((a, b) => a.numero.localeCompare(b.numero, undefined, { numeric: true, sensitivity: 'base' }));

    const currentTrain = watch('tren');
    const currentModel = getModeloTren(currentTrain) as keyof typeof COCHES_POR_MODELO;

    // Auto-set mini-filtros for O. Especial and Mantenimiento Preventivo
    useEffect(() => {
        if (selectedTipo === 'O. Especial' || selectedTipo === 'Mantenimiento Preventivo') {
            setValue('mini_filtros', ['Otros']);
        }
    }, [selectedTipo, setValue]);


    const getDisplayedTecnicos = () => {
        if (selectedTipo === 'Otro') return TECNICOS_TODOS;
        if (selectedTipo === 'Mantenimiento Preventivo') return TECNICOS_PREVENTIVO;
        if (selectedTipo === 'O. Especial') return TECNICOS_EXTERNO;
        return TECNICOS_CORRECTIVO;
    };

    const displayedTecnicos = getDisplayedTecnicos();

    const checkOccupancy = () => {
        const occupiedBy = registros.find(r =>
            r.lugar_destino === selectedLugar &&
            (!r.fecha_hora_salida) &&
            r.id !== initialData?.id
        );

        return occupiedBy;
    };

    const checkTrainInWorkshop = () => {
        const trainNumber = watch('tren');
        if (!trainNumber) return null;

        const existingTrain = registros.find(r =>
            r.tren === trainNumber &&
            (!r.fecha_hora_salida) &&
            r.id !== initialData?.id
        );

        return existingTrain;
    };

    const occupiedBy = checkOccupancy();
    const duplicateTrain = checkTrainInWorkshop();


    const missingTecnicos = (mode === 'move' || !!exitDate || isDisponible) && selectedTecnicns.length === 0;
    const missingSolucion = (mode === 'move' || !!exitDate || isDisponible) && (!solucion || solucion.trim().length < 10);
    const missingMoveFields = mode === 'move' && (!exitDate || !nuevaPosicion || !nuevaFechaEntrada);

    const handleToggleTecnico = (nombre: string) => {
        const current = selectedTecnicns || [];
        if (current.includes(nombre)) {
            setValue('tecnicos_involucrados', current.filter(t => t !== nombre));
        } else {
            setValue('tecnicos_involucrados', [...current, nombre]);
        }
    };

    const handleToggleFiltro = (filtro: string) => {
        const current = selectedFiltros || [];
        if (current.includes(filtro)) {
            setValue('mini_filtros', current.filter(f => f !== filtro));
        } else {
            setValue('mini_filtros', [...current, filtro]);
        }
    };

    const handleInternalSubmit = (data: any) => {
        // Fix for the date/time issue: ensure dates are properly converted to ISO
        const formattedData = {
            ...data,
            fecha_hora_entrada: new Date(data.fecha_hora_entrada).toISOString(),
            fecha_hora_salida: data.fecha_hora_salida ? new Date(data.fecha_hora_salida).toISOString() : null,
            nueva_fecha_hora_entrada: data.nueva_fecha_hora_entrada ? new Date(data.nueva_fecha_hora_entrada).toISOString() : null,
            mini_filtros: Array.isArray(data.mini_filtros) ? data.mini_filtros.join(', ') : data.mini_filtros
        };
        onSubmit(formattedData);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {mode === 'move' ? (
                            <><ArrowRightLeft className="w-5 h-5 text-orange-500" /> Cambio de Posición</>
                        ) : initialData?.id ? (
                            <>Editar Registro</>
                        ) : (
                            <>Agregar Nuevo Tren</>
                        )}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(handleInternalSubmit)} className="p-6 overflow-y-auto space-y-6">
                    {mode === 'move' && (
                        <div className="space-y-6 bg-orange-500/5 p-4 rounded-xl border border-orange-500/10 mb-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase text-orange-600 tracking-wider">Fecha y Hora de Salida (Actual)</label>
                                    <input
                                        type="datetime-local"
                                        {...register('fecha_hora_salida')}
                                        className="w-full bg-background border-orange-500/20 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase text-orange-600 tracking-wider">Nueva Posición (Destino)</label>
                                    <select
                                        {...register('nueva_posicion')}
                                        className="w-full bg-background border-orange-500/20 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none"
                                    >
                                        {LUGARES.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-orange-600 tracking-wider">Nueva Fecha y Hora de Entrada</label>
                                <input
                                    type="datetime-local"
                                    {...register('nueva_fecha_hora_entrada')}
                                    className="w-full bg-background border-orange-500/20 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none"
                                />
                            </div>
                            <div className="border-t border-orange-500/10 pt-4 mt-2">
                                <p className="text-[10px] text-muted-foreground italic">El tren se marcará como disponible en su posición actual y se creará un nuevo ingreso en la nueva posición.</p>
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Número de Tren</label>
                                {watch('tren') && (
                                    <span className="text-[10px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 uppercase tracking-tighter animate-in fade-in slide-in-from-right-2 duration-300">
                                        {getModeloTren(watch('tren'))}
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <button
                                    type="button"
                                    disabled={!!initialData?.id}
                                    onClick={() => setShowTrenSelector(!showTrenSelector)}
                                    className={`w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none flex items-center justify-between hover:border-primary/50 transition-colors ${initialData?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Train className={`w-4 h-4 ${watch('tren') ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <span className={watch('tren') ? 'font-medium' : 'text-muted-foreground'}>
                                            {watch('tren') || 'Seleccionar tren...'}
                                        </span>
                                    </div>
                                    {!initialData?.id && <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showTrenSelector ? 'rotate-180' : ''}`} />}
                                </button>
                                {showTrenSelector && (
                                    <div className="absolute z-20 w-full mt-2 bg-card border border-border rounded-xl shadow-2xl max-h-64 overflow-hidden">
                                        <div className="p-2 grid grid-cols-3 gap-1.5 max-h-56 overflow-y-auto">
                                            {availableTrains.length === 0 ? (
                                                <p className="col-span-3 p-4 text-xs text-muted-foreground text-center">Todos los trenes están en taller</p>
                                            ) : (
                                                availableTrains.map((item) => (
                                                    <button
                                                        key={item.numero}
                                                        type="button"
                                                        onClick={() => {
                                                            setValue('tren', item.numero);
                                                            setShowTrenSelector(false);
                                                        }}
                                                        className={`
                                                            relative p-2.5 rounded-lg border-2 transition-all duration-200 hover:scale-105 hover:shadow-md
                                                            ${watch('tren') === item.numero
                                                                ? `${item.colorClass} ring-2 ring-primary/50 ring-offset-2 ring-offset-card`
                                                                : `bg-muted/30 border-border hover:border-primary/50`
                                                            }
                                                        `}
                                                    >
                                                        <span className={`text-lg font-black leading-none block ${watch('tren') === item.numero ? 'opacity-100' : 'opacity-70'}`}>
                                                            {item.numero}
                                                        </span>
                                                        <span className={`text-[8px] font-bold block mt-1 opacity-60 truncate`}>
                                                            {item.modelo}
                                                        </span>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {errors.tren && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.tren.message as string}</p>}
                            {duplicateTrain && (
                                <div className="mt-2 bg-destructive/10 border border-destructive/20 p-2 rounded-lg flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[11px] font-bold text-destructive leading-tight">Tren ya en Taller</p>
                                        <p className="text-[10px] text-destructive/80 leading-tight">El Tren {duplicateTrain.tren} ya tiene un ingreso activo en {duplicateTrain.lugar_destino}.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Fecha y Hora de Entrada</label>
                            <input
                                type="datetime-local"
                                disabled={mode === 'move'}
                                {...register('fecha_hora_entrada')}
                                className={`w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none ${mode === 'move' ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Tipo de Atención</label>
                            <select
                                {...register('tipo_atencion')}
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                            >
                                {TIPOS_ATENCION.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Lugar de Destino</label>
                            <select
                                disabled={mode === 'move' || Boolean(initialData?.id)}
                                {...register('lugar_destino')}
                                className={`w-full bg-background border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none ${occupiedBy ? 'border-orange-500 ring-1 ring-orange-500/20' : 'border-border'} ${(mode === 'move' || initialData?.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {LUGARES.map((l) => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </select>
                            {occupiedBy && (
                                <div className="mt-2 bg-destructive/10 border border-destructive/20 p-2 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[11px] font-bold text-destructive leading-tight">Ubicación Ocupada</p>
                                        <p className="text-[10px] text-destructive/80 leading-tight">Este puesto ya está ocupado por el Tren {occupiedBy.tren}.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2 space-y-1.5">
                            <label className="text-sm font-medium">Motivo del Trabajo</label>
                            <textarea
                                {...register('motivo_trabajo')}
                                rows={3}
                                spellCheck="true"
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                                placeholder="Descripción detallada del motivo de ingreso..."
                            />
                            {errors.motivo_trabajo && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.motivo_trabajo.message as string}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">OM / OT</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={13}
                                {...register('om', {
                                    onChange: (e) => {
                                        e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 13);
                                        setValue('om', e.target.value);
                                    }
                                })}
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                placeholder="Número de OM/OT"
                            />
                            {watch('om') && (
                                <p className="text-[11px] text-destructive font-medium flex items-center gap-1 mt-1 animate-pulse">
                                    <AlertCircle className="w-3 h-3" /> Máx. 13 caracteres numéricos.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5 pt-4 border-t border-border mt-6">
                        <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Mini Filtros</label>
                        <div className="flex flex-wrap gap-2">
                            {FILTROS.map(f => (
                                <button
                                    key={f}
                                    type="button"
                                    onClick={() => handleToggleFiltro(f)}
                                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border ${selectedFiltros.includes(f)
                                        ? 'bg-secondary text-secondary-foreground border-secondary shadow-lg shadow-secondary/20 scale-105'
                                        : 'bg-muted/50 border-border text-muted-foreground hover:border-muted-foreground/50'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {initialData?.id && (
                        <>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Observaciones Adicionales</label>
                                <textarea
                                    {...register('observacion')}
                                    rows={2}
                                    spellCheck="true"
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                                    placeholder="Detalles, repuestos o notas..."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Solución / Trabajo Realizado</label>
                                <textarea
                                    {...register('solucion')}
                                    rows={2}
                                    spellCheck="true"
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                                    placeholder="Describa la solución aplicada..."
                                />
                                {missingSolucion && (
                                    <p className="text-[11px] text-destructive font-medium flex items-center gap-1 mt-1 animate-pulse">
                                        <AlertCircle className="w-3 h-3" /> Debe describir brevemente el trabajo realizado (mín. 10 caracteres).
                                    </p>
                                )}
                            </div>

                            <div className="space-y-4 p-4 bg-muted/10 rounded-xl border border-border mt-4">
                                <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                                    <label className="text-xs font-black uppercase text-muted-foreground tracking-widest block">Sección Repuestos</label>
                                    <button
                                        type="button"
                                        onClick={() => append({ prefijo: 'C/', nombre: '', manual: '', coche: '', manual_2: '', coche_2: '', s: '', e: '', p: '', tren: '', nombre_ct: '', manual_ct: '' })}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-[10px] font-black uppercase transition-all shadow-sm border border-primary/20 group"
                                    >
                                        <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" /> Agregar Repuesto
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {fields.map((field, index) => {
                                        const r = watchedRepuestos?.[index] || {};
                                        return (
                                            <div key={field.id} className="relative group/line border-b border-border/30 last:border-0 pb-6 last:pb-0">
                                                {fields.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => remove(index)}
                                                        className="absolute -right-2 -top-2 p-1.5 bg-destructive/10 text-destructive rounded-full opacity-0 group-hover/line:opacity-100 transition-opacity hover:bg-destructive hover:text-white z-10 shadow-sm"
                                                        title="Eliminar esta línea"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                
                                                <div className="flex flex-wrap items-center gap-3">
                                                    {/* Prefijo */}
                                                    <div className="w-20">
                                                        <select
                                                            {...register(`repuestos.${index}.prefijo` as any)}
                                                            className="w-full bg-background border border-border rounded-lg px-2 py-2 text-sm font-bold focus:ring-2 focus:ring-primary/50 outline-none transition-shadow"
                                                        >
                                                            {REPUESTOS_PREFIJOS.map(p => <option key={p} value={p}>{p}</option>)}
                                                        </select>
                                                    </div>

                                                    {/* Nombre Repuesto */}
                                                    <div className="flex-1 min-w-[140px]">
                                                        <select
                                                            {...register(`repuestos.${index}.nombre` as any)}
                                                            className="w-full bg-background border border-border rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-primary/40 outline-none transition-shadow"
                                                        >
                                                            {REPUESTOS_NOMBRES.map(n => <option key={n} value={n}>{n}</option>)}
                                                        </select>
                                                    </div>

                                                    {/* Texto Manual */}
                                                    <div className="w-28">
                                                        <input
                                                            type="text"
                                                            maxLength={20}
                                                            {...register(`repuestos.${index}.manual` as any)}
                                                            placeholder="..."
                                                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-shadow"
                                                        />
                                                    </div>

                                                    {/* Coche Selector (para C/, CR/, CC/, CT/ y CRT/) */}
                                                    {(r.prefijo === 'C/' || r.prefijo === 'CR/' || r.prefijo === 'CC/' || r.prefijo === 'CT/' || r.prefijo === 'CRT/') && (
                                                        <div className="w-28">
                                                            <select
                                                                {...register(`repuestos.${index}.coche` as any)}
                                                                className="w-full bg-background border border-border rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-primary/40 outline-none transition-shadow font-bold text-primary"
                                                            >
                                                                <option value="">Coche...</option>
                                                                {(COCHES_POR_MODELO[currentModel] || []).map(c => <option key={c} value={c}>{c}</option>)}
                                                            </select>
                                                        </div>
                                                    )}

                                                    {/* Lógica de Separador: 'x' para CR/ y CC/ | 'T#' para CT/ y CRT/ */}
                                                    {(r.prefijo === 'CR/' || r.prefijo === 'CC/') && (
                                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 mx-1">
                                                            <span className="text-xs font-black text-primary italic">x</span>
                                                        </div>
                                                    )}

                                                    {(r.prefijo === 'CT/' || r.prefijo === 'CRT/') && (
                                                        <div className="relative">
                                                            <button
                                                                type="button"
                                                                onClick={() => setActiveRepuestoTrenSelector(activeRepuestoTrenSelector === index ? null : index)}
                                                                className={`
                                                                    px-3 py-1.5 rounded-lg border-2 flex items-center gap-2 transition-all duration-200
                                                                    ${r.tren ? 'bg-primary/10 border-primary/40 text-primary ring-2 ring-primary/10' : 'bg-background border-border text-muted-foreground hover:border-primary/50'}
                                                                `}
                                                            >
                                                                <span className="text-[10px] font-black uppercase text-primary/60">x T#</span>
                                                                <span className="text-sm font-black text-primary">{r.tren || '---'}</span>
                                                                <ChevronDown className={`w-3 h-3 transition-transform ${activeRepuestoTrenSelector === index ? 'rotate-180' : ''}`} />
                                                            </button>

                                                            {activeRepuestoTrenSelector === index && (
                                                                <div className="absolute z-30 w-64 mt-2 bg-card border border-border rounded-xl shadow-2xl p-2 left-0 animate-in fade-in zoom-in duration-200">
                                                                    <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto p-1">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setValue(`repuestos.${index}.tren` as any, '');
                                                                                setActiveRepuestoTrenSelector(null);
                                                                            }}
                                                                            className="col-span-4 p-1.5 rounded-md border border-dashed border-border text-xs font-medium hover:bg-muted/50 mb-1"
                                                                        >
                                                                            Limpiar selección
                                                                        </button>
                                                                        {workshopTrains.length === 0 ? (
                                                                            <p className="col-span-4 p-4 text-[10px] text-muted-foreground text-center">No hay otros trenes en el recinto</p>
                                                                        ) : (
                                                                            workshopTrains.map((item) => (
                                                                                <button
                                                                                    key={item.numero}
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        setValue(`repuestos.${index}.tren` as any, item.numero);
                                                                                        setActiveRepuestoTrenSelector(null);
                                                                                    }}
                                                                                    className={`
                                                                                        p-2 rounded-lg border-2 text-center transition-all hover:scale-105
                                                                                        ${r.tren === item.numero ? `${item.colorClass} border-primary` : 'bg-muted/30 border-transparent hover:border-border'}
                                                                                    `}
                                                                                >
                                                                                    <p className="text-xs font-black">{item.numero}</p>
                                                                                    <p className="text-[7px] font-bold mt-0.5 opacity-60 uppercase">{item.modelo}</p>
                                                                                </button>
                                                                            ))
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Bloque Secundario Replicador (CR/, CC/, CT/, CRT/) */}
                                                    {(r.prefijo === 'CR/' || r.prefijo === 'CC/' || r.prefijo === 'CT/' || r.prefijo === 'CRT/') && (
                                                        <>
                                                            {/* Nombre Replica */}
                                                            <div className="flex-1 min-w-[140px] opacity-70">
                                                                <select
                                                                    disabled
                                                                    value={r.nombre}
                                                                    className="w-full bg-muted border border-border rounded-lg px-2 py-2 text-sm cursor-not-allowed text-foreground/80 font-medium"
                                                                >
                                                                    <option value={r.nombre}>{r.nombre || "..."}</option>
                                                                </select>
                                                            </div>
                                                            {/* Segundo Manual */}
                                                            <div className="w-28">
                                                                <input
                                                                    type="text"
                                                                    maxLength={20}
                                                                    {...register(`repuestos.${index}.manual_2` as any)}
                                                                    placeholder="..."
                                                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-shadow"
                                                                />
                                                            </div>
                                                            {/* Segundo Coche */}
                                                            <div className="w-28">
                                                                <select
                                                                    {...register(`repuestos.${index}.coche_2` as any)}
                                                                    className="w-full bg-background border border-border rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-primary/40 outline-none transition-shadow font-bold text-primary"
                                                                >
                                                                    <option value="">Coche...</option>
                                                                    {(COCHES_POR_MODELO[currentModel] || []).map(c => <option key={c} value={c}>{c}</option>)}
                                                                </select>
                                                            </div>
                                                        </>
                                                    )}


                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-black text-muted-foreground">S:</span>
                                                        <input 
                                                            type="text" 
                                                            {...register(`repuestos.${index}.s` as any)} 
                                                            className="w-24 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none" 
                                                        />
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-black text-muted-foreground">E:</span>
                                                        <input 
                                                            type="text" 
                                                            {...register(`repuestos.${index}.e` as any)} 
                                                            className="w-24 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none" 
                                                        />
                                                    </div>

                                                    {(r.prefijo === 'CC/' || r.prefijo === 'CT/') && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-black text-muted-foreground">P:</span>
                                                            <input 
                                                                type="text" 
                                                                {...register(`repuestos.${index}.p` as any)} 
                                                                className="w-24 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none" 
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {mode !== 'move' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Fecha y Hora de Salida</label>
                                        <input
                                            type="datetime-local"
                                            {...register('fecha_hora_salida')}
                                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                        />
                                    </div>

                                    <div className="flex flex-col justify-end">
                                        <div className="flex items-center justify-between p-2.5 bg-muted/20 rounded-xl border border-border">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-semibold">¿Tren Disponible?</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setValue('disponible', !watch('disponible'))}
                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ring-2 ring-primary/20 ${watch('disponible') ? 'bg-primary' : 'bg-muted-foreground/30'
                                                    }`}
                                            >
                                                <span
                                                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${watch('disponible') ? 'translate-x-5' : 'translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="border-t border-border pt-4 mt-6">
                                <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Técnicos Involucrados</h3>
                                <div className="flex flex-wrap gap-2">
                                    {displayedTecnicos.map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => handleToggleTecnico(t)}
                                            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border ${(selectedTecnicns || []).includes(t)
                                                ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105'
                                                : 'bg-muted/50 border-border text-muted-foreground hover:border-muted-foreground/50'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                                {missingTecnicos && (
                                    <div className="mt-3 bg-destructive/10 border border-destructive/20 p-2.5 rounded-lg flex items-start gap-2 animate-pulse">
                                        <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[11px] font-bold text-destructive leading-tight">Acción Requerida</p>
                                            <p className="text-[10px] text-destructive/80 leading-tight">Debe seleccionar al menos un técnico para dar la salida o disponibilidad.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </>
                    )}

                </form>

                <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium hover:text-foreground transition-all duration-200 hover:scale-[1.03] active:scale-95 rounded-xl hover:bg-muted">
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={!!occupiedBy || !!duplicateTrain || missingTecnicos || missingSolucion || missingMoveFields}
                        onClick={handleSubmit(handleInternalSubmit)}
                        className={`btn-primary transition-all duration-200 hover:scale-[1.03] active:scale-95 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 ${occupiedBy || duplicateTrain || missingTecnicos || missingSolucion || missingMoveFields ? 'opacity-50 cursor-not-allowed grayscale hover:scale-100 hover:translate-y-0 hover:shadow-none' : ''}`}
                    >
                        <Save className="w-4 h-4" />
                        {mode === 'move' ? 'Confirmar Cambio de Posición' : (initialData?.id ? 'Guardar Cambios' : 'Registrar Tren')}
                    </button>
                </div>
            </div>
        </div>
    );
}
