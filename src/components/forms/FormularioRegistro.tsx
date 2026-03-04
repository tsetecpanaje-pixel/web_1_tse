'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TipoAtencion, LugarDestino, MiniFiltros, RegistroTren } from '@/types/database';
import { X, Save, AlertCircle } from 'lucide-react';
import { getModeloTren, formatDateTimeLocal } from '@/lib/utils';

const registroSchema = z.object({
    tren: z.string().min(1, 'Número de tren requerido'),
    fecha_hora_entrada: z.string().min(1, 'Fecha de entrada requerida'),
    tipo_atencion: z.string().min(1, 'Tipo de atención requerido'),
    lugar_destino: z.string().min(1, 'Lugar de destino requerido'),
    motivo_trabajo: z.string().min(5, 'Motivo demasiado corto'),
    mini_filtros: z.string().optional(),
    observacion: z.string().optional(),
    solucion: z.string().optional(),
    disponible: z.boolean().default(false),
    tecnicos_involucrados: z.array(z.string()).default([]),
    fecha_hora_salida: z.string().optional(),
});

interface FormularioRegistroProps {
    initialData?: Partial<RegistroTren>;
    onSubmit: (data: any) => void;
    onClose: () => void;
    tecnicos: string[];
    registros: RegistroTren[];
}

const TIPOS_ATENCION: TipoAtencion[] = ['Avería', 'Mantenimiento Preventivo', 'O. Especial', 'Evacuación', 'Lavado', 'Estacionado', 'Otro'];
const LUGARES: LugarDestino[] = ['Foso 1', 'Foso 2', 'Foso 3', 'Foso 4', 'Foso 5', 'Foso 6', 'Nave Lavado', 'Vía Prueba', 'FV VV', 'FV PM', 'Cochera G14-1', 'Cochera G14-2', 'Cochera'];
const FILTROS: MiniFiltros[] = ['MIT/MIF', 'Puertas', 'OR', 'CVS / NCB', 'Neumáticos', 'PA', 'Humo', 'Otros'];

const TECNICOS_PREVENTIVO = [
    'Técnico 1',
    'Técnico 2',
    'Rodrigo Gonzáles',
    'Sergio Gonzáles',
    'Daniel Conejera'
];

const TECNICOS_GENERAL = [
    'Braulio Troncoso G.', 'Bryan Manríquez C.', 'Carlos Altamirano P.', 'Cristian Conejeros G.',
    'Daniel Gatica V.', 'Edgar Rosales C.', 'Emilio Muñoz', 'Fabián Andrés Albornoz T.',
    'Fernando Barría L.', 'Fernando Lemus R.', 'Gloria Yhon Q.', 'Guillermo Álvarez F.',
    'Juan Huerta G.', 'Jonatan Gonzáles', 'José Serrano Ch.', 'J. Bordillo',
    'Luis Gómez C.', 'Luis Toledo P.', 'Luis Valenzuela C.', 'Marcelo González B.',
    'Marcos Mira', 'Mauricio Marín M.', 'Mirco Zelada', 'Pablo Hormachea G.',
    'Rafael Díaz N.', 'Víctor Miranda V.', 'Víctor Riveros J.', 'Víctor Vergara M.',
    'Washington Muñoz', 'José Olivares', 'Augusto Marín Figueroa', 'Sebastián Medina'
].sort();

const TECNICOS_ESPECIAL = [
    'Alstom',
    'Gran Revisión',
    'Hover Hall',
    ...TECNICOS_GENERAL
];

export default function FormularioRegistro({ initialData, onSubmit, onClose, tecnicos, registros }: FormularioRegistroProps) {
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
        resolver: zodResolver(registroSchema),
        defaultValues: {
            tren: initialData?.tren || '',
            fecha_hora_entrada: formatDateTimeLocal(initialData?.fecha_hora_entrada || new Date()),
            tipo_atencion: initialData?.tipo_atencion || 'Avería',
            lugar_destino: initialData?.lugar_destino || 'Foso 1',
            motivo_trabajo: initialData?.motivo_trabajo || '',
            mini_filtros: initialData?.mini_filtros || '',
            observacion: initialData?.observacion || '',
            solucion: initialData?.solucion || '',
            disponible: initialData?.disponible || false,
            tecnicos_involucrados: initialData?.tecnicos_involucrados || [],
            fecha_hora_salida: formatDateTimeLocal(initialData?.fecha_hora_salida),
        }
    });

    const selectedTecnicns = watch('tecnicos_involucrados') as string[];

    const selectedLugar = watch('lugar_destino');
    const selectedTipo = watch('tipo_atencion');
    const isDisponible = watch('disponible');

    const getDisplayedTecnicos = () => {
        if (selectedTipo === 'Mantenimiento Preventivo') return TECNICOS_PREVENTIVO;
        if (selectedTipo === 'O. Especial') return TECNICOS_ESPECIAL;
        return TECNICOS_GENERAL;
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
    const missingTecnicos = (!!exitDate || isDisponible) && selectedTecnicns.length === 0;
    const missingSolucion = (!!exitDate || isDisponible) && (!solucion || solucion.trim().length < 10);

    const handleToggleTecnico = (nombre: string) => {
        const current = selectedTecnicns || [];
        if (current.includes(nombre)) {
            setValue('tecnicos_involucrados', current.filter(t => t !== nombre));
        } else {
            setValue('tecnicos_involucrados', [...current, nombre]);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
                    <h2 className="text-xl font-bold">{initialData?.id ? 'Editar Registro' : 'Agregar Nuevo Tren'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-6">
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
                            <input
                                {...register('tren')}
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                                placeholder="Ej: 55"
                            />
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
                                {...register('fecha_hora_entrada')}
                                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
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
                                {...register('lugar_destino')}
                                className={`w-full bg-background border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none ${occupiedBy ? 'border-orange-500 ring-1 ring-orange-500/20' : 'border-border'}`}
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

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Motivo del Trabajo</label>
                        <textarea
                            {...register('motivo_trabajo')}
                            rows={3}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                            placeholder="Descripción detallada del motivo de ingreso..."
                        />
                        {errors.motivo_trabajo && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.motivo_trabajo.message as string}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Mini Filtros</label>
                        <select
                            {...register('mini_filtros')}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                        >
                            <option value="">Seleccionar filtro...</option>
                            {FILTROS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>



                    {initialData?.id && (
                        <>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Observaciones Adicionales</label>
                                <textarea
                                    {...register('observacion')}
                                    rows={2}
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                                    placeholder="Detalles, repuestos o notas..."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Solución / Trabajo Realizado</label>
                                <textarea
                                    {...register('solucion')}
                                    rows={2}
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                                    placeholder="Describa la solución aplicada..."
                                />
                                {missingSolucion && (
                                    <p className="text-[11px] text-destructive font-medium flex items-center gap-1 mt-1 animate-pulse">
                                        <AlertCircle className="w-3 h-3" /> Debe describir brevemente el trabajo realizado (mín. 10 caracteres).
                                    </p>
                                )}
                            </div>

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
                        </>
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
                </form>

                <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium hover:text-foreground transition-colors">
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={!!occupiedBy || !!duplicateTrain || missingTecnicos || missingSolucion}
                        onClick={handleSubmit(onSubmit)}
                        className={`btn-primary ${occupiedBy || duplicateTrain || missingTecnicos || missingSolucion ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                    >
                        <Save className="w-4 h-4" />
                        {initialData?.id ? 'Guardar Cambios' : 'Registrar Tren'}
                    </button>
                </div>
            </div>
        </div>
    );
}
