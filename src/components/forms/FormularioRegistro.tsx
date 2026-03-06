'use client';

import { useState } from 'react';
import { useEffect } from 'react';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TipoAtencion, LugarDestino, MiniFiltros, RegistroTren } from '@/types/database';
import { X, Save, AlertCircle, ArrowRightLeft, ChevronDown, Train } from 'lucide-react';
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
});

interface FormularioRegistroProps {
    initialData?: Partial<RegistroTren>;
    onSubmit: (data: any) => void;
    onClose: () => void;
    tecnicos: string[];
    registros: RegistroTren[];
    mode?: 'add' | 'edit' | 'move';
}

const TIPOS_ATENCION: TipoAtencion[] = ['Avería', 'Mantenimiento Preventivo', 'O. Especial', 'Evacuación', 'Lavado', 'Estacionado', 'Otro'];
const LUGARES: LugarDestino[] = ['Foso 1', 'Foso 2', 'Foso 3', 'Foso 4', 'Foso 5', 'Foso 6', 'Nave Lavado', 'Vía Prueba', 'FV VV', 'FV PM', 'Cochera G14-1', 'Cochera G14-2', 'Cochera'];
const FILTROS: MiniFiltros[] = ['MIT/MIF', 'Puertas', 'OR', 'CVS / NCB', 'Neumáticos', 'PA', 'Humo', 'Otros'];


export default function FormularioRegistro({ initialData, onSubmit, onClose, tecnicos, registros, mode = 'add' }: FormularioRegistroProps) {
    const { tecnicosPorCategoria } = useConfigTecnicos();
    const { trenes } = useConfigTrenes();
    const [showTrenSelector, setShowTrenSelector] = useState(false);

    // Build dynamic lists from DB
    const TECNICOS_PREVENTIVO = tecnicosPorCategoria('preventivo').map(t => t.nombre).sort();
    const TECNICOS_CORRECTIVO = tecnicosPorCategoria('general').map(t => t.nombre).sort();
    const TECNICOS_EXTERNO_ONLY = tecnicosPorCategoria('especial').map(t => t.nombre);
    const TECNICOS_EXTERNO = [...TECNICOS_EXTERNO_ONLY, ...TECNICOS_CORRECTIVO].sort();
    const TECNICOS_TODOS = Array.from(new Set([...TECNICOS_PREVENTIVO, ...TECNICOS_EXTERNO])).sort();

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
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
        }
    });

    const selectedTecnicns = watch('tecnicos_involucrados') as string[];
    const selectedFiltros = watch('mini_filtros') as string[];

    const selectedLugar = watch('lugar_destino');
    const selectedTipo = watch('tipo_atencion');
    const isDisponible = watch('disponible');

    const trenColors = trenes.filter(t => t.activo).map(tren => ({
        numero: tren.numero,
        modelo: tren.modelo,
        colorClass: tren.modelo === 'NS-74'
            ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
            : tren.modelo === 'NS-93'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : tren.modelo === 'NS-16'
                    ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                    : 'bg-slate-500/20 text-slate-300 border-slate-500/40'
    }));

    // Get trains already in workshop (without exit date)
    const trainsInWorkshop = registros
        .filter(r => !r.fecha_hora_salida && r.id !== initialData?.id)
        .map(r => r.tren);

    // Filter available trains (not in workshop or editing current record)
    const availableTrains = trenColors.filter(t => !trainsInWorkshop.includes(t.numero));

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

    const exitDate = watch('fecha_hora_salida');
    const solucion = watch('solucion');
    const nuevaPosicion = watch('nueva_posicion');
    const nuevaFechaEntrada = watch('nueva_fecha_hora_entrada');

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
                                    onClick={() => setShowTrenSelector(!showTrenSelector)}
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none flex items-center justify-between hover:border-primary/50 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Train className={`w-4 h-4 ${watch('tren') ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <span className={watch('tren') ? 'font-medium' : 'text-muted-foreground'}>
                                            {watch('tren') || 'Seleccionar tren...'}
                                        </span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showTrenSelector ? 'rotate-180' : ''}`} />
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
                                disabled={mode === 'move'}
                                {...register('lugar_destino')}
                                className={`w-full bg-background border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none ${occupiedBy ? 'border-orange-500 ring-1 ring-orange-500/20' : 'border-border'} ${mode === 'move' ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {LUGARES.map(l => <option key={l} value={l}>{l}</option>)}
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
