'use client';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FormularioRegistro;
var react_1 = require("react");
var react_2 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var z = require("zod");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var useConfig_1 = require("@/hooks/useConfig");
var registroSchema = z.object({
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
var TIPOS_ATENCION = ['Avería', 'Mantenimiento Preventivo', 'O. Especial', 'Evacuación', 'Lavado', 'Estacionado', 'Cambio de Posición', 'Otro'];
var LUGARES = ['Foso 1', 'Foso 2', 'Foso 3', 'Foso 4', 'Foso 5', 'Foso 6', 'Nave Lavado', 'Vía Prueba', 'FV VV', 'FV PM', 'Cochera G14-1', 'Cochera G14-2', 'Cochera_1', 'Cochera_2', 'Cochera_3', 'Cochera_4'];
var FILTROS = ['MIT/MIF', 'Puertas', 'OR', 'CVS / NCB', 'Neumáticos', 'PA', 'Humo', 'Otros'];
function FormularioRegistro(_a) {
    var initialData = _a.initialData, onSubmit = _a.onSubmit, onClose = _a.onClose, tecnicos = _a.tecnicos, registros = _a.registros, _b = _a.mode, mode = _b === void 0 ? 'add' : _b;
    var tecnicosPorCategoria = (0, useConfig_1.useConfigTecnicos)().tecnicosPorCategoria;
    var trenes = (0, useConfig_1.useConfigTrenes)().trenes;
    var _c = (0, react_1.useState)(false), showTrenSelector = _c[0], setShowTrenSelector = _c[1];
    // Build dynamic lists from DB
    var TECNICOS_PREVENTIVO = tecnicosPorCategoria('preventivo').map(function (t) { return t.nombre; }).sort();
    var TECNICOS_CORRECTIVO = tecnicosPorCategoria('general').map(function (t) { return t.nombre; }).sort();
    var TECNICOS_EXTERNO_ONLY = tecnicosPorCategoria('especial').map(function (t) { return t.nombre; });
    var TECNICOS_EXTERNO = __spreadArray(__spreadArray([], TECNICOS_EXTERNO_ONLY, true), TECNICOS_CORRECTIVO, true).sort();
    var TECNICOS_TODOS = Array.from(new Set(__spreadArray(__spreadArray([], TECNICOS_PREVENTIVO, true), TECNICOS_EXTERNO, true))).sort();
    var _d = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(registroSchema),
        defaultValues: {
            tren: (initialData === null || initialData === void 0 ? void 0 : initialData.tren) || '',
            fecha_hora_entrada: (0, utils_1.formatDateTimeLocal)((initialData === null || initialData === void 0 ? void 0 : initialData.fecha_hora_entrada) || new Date()),
            tipo_atencion: (initialData === null || initialData === void 0 ? void 0 : initialData.tipo_atencion) || 'Avería',
            lugar_destino: (initialData === null || initialData === void 0 ? void 0 : initialData.lugar_destino) || 'Foso 1',
            motivo_trabajo: (initialData === null || initialData === void 0 ? void 0 : initialData.motivo_trabajo) || '',
            om: (initialData === null || initialData === void 0 ? void 0 : initialData.om) || '',
            mini_filtros: (initialData === null || initialData === void 0 ? void 0 : initialData.mini_filtros)
                ? (Array.isArray(initialData.mini_filtros) ? initialData.mini_filtros : [initialData.mini_filtros])
                : [],
            observacion: (initialData === null || initialData === void 0 ? void 0 : initialData.observacion) || '',
            solucion: (initialData === null || initialData === void 0 ? void 0 : initialData.solucion) || '',
            disponible: (initialData === null || initialData === void 0 ? void 0 : initialData.disponible) || false,
            tecnicos_involucrados: (initialData === null || initialData === void 0 ? void 0 : initialData.tecnicos_involucrados) || [],
            fecha_hora_salida: (0, utils_1.formatDateTimeLocal)((initialData === null || initialData === void 0 ? void 0 : initialData.fecha_hora_salida) || (mode === 'move' ? new Date() : undefined)),
            nueva_posicion: 'Foso 1',
            nueva_fecha_hora_entrada: (0, utils_1.formatDateTimeLocal)(new Date()),
        }
    }), register = _d.register, handleSubmit = _d.handleSubmit, errors = _d.formState.errors, setValue = _d.setValue, watch = _d.watch;
    var selectedTecnicns = watch('tecnicos_involucrados');
    var selectedFiltros = watch('mini_filtros');
    var selectedLugar = watch('lugar_destino');
    var selectedTipo = watch('tipo_atencion');
    var isDisponible = watch('disponible');
    var trenColors = trenes.filter(function (t) { return t.activo; }).map(function (tren) { return ({
        numero: tren.numero,
        modelo: tren.modelo,
        colorClass: tren.modelo === 'NS-74'
            ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
            : tren.modelo === 'NS-93'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                : 'bg-purple-500/20 text-purple-400 border-purple-500/40'
    }); });
    // Get trains already in workshop (without exit date)
    var trainsInWorkshop = registros
        .filter(function (r) { return !r.fecha_hora_salida && r.id !== (initialData === null || initialData === void 0 ? void 0 : initialData.id); })
        .map(function (r) { return r.tren; });
    // Filter available trains (not in workshop or editing current record) - sorted by complete number
    var availableTrains = trenColors
        .filter(function (t) { return !trainsInWorkshop.includes(t.numero); })
        .sort(function (a, b) { return a.numero.localeCompare(b.numero, undefined, { numeric: true, sensitivity: 'base' }); });
    // Auto-set mini-filtros for O. Especial and Mantenimiento Preventivo
    (0, react_2.useEffect)(function () {
        if (selectedTipo === 'O. Especial' || selectedTipo === 'Mantenimiento Preventivo') {
            setValue('mini_filtros', ['Otros']);
        }
    }, [selectedTipo, setValue]);
    var getDisplayedTecnicos = function () {
        if (selectedTipo === 'Otro')
            return TECNICOS_TODOS;
        if (selectedTipo === 'Mantenimiento Preventivo')
            return TECNICOS_PREVENTIVO;
        if (selectedTipo === 'O. Especial')
            return TECNICOS_EXTERNO;
        return TECNICOS_CORRECTIVO;
    };
    var displayedTecnicos = getDisplayedTecnicos();
    var checkOccupancy = function () {
        var occupiedBy = registros.find(function (r) {
            return r.lugar_destino === selectedLugar &&
                (!r.fecha_hora_salida) &&
                r.id !== (initialData === null || initialData === void 0 ? void 0 : initialData.id);
        });
        return occupiedBy;
    };
    var checkTrainInWorkshop = function () {
        var trainNumber = watch('tren');
        if (!trainNumber)
            return null;
        var existingTrain = registros.find(function (r) {
            return r.tren === trainNumber &&
                (!r.fecha_hora_salida) &&
                r.id !== (initialData === null || initialData === void 0 ? void 0 : initialData.id);
        });
        return existingTrain;
    };
    var occupiedBy = checkOccupancy();
    var duplicateTrain = checkTrainInWorkshop();
    var exitDate = watch('fecha_hora_salida');
    var solucion = watch('solucion');
    var nuevaPosicion = watch('nueva_posicion');
    var nuevaFechaEntrada = watch('nueva_fecha_hora_entrada');
    var missingTecnicos = (mode === 'move' || !!exitDate || isDisponible) && selectedTecnicns.length === 0;
    var missingSolucion = (mode === 'move' || !!exitDate || isDisponible) && (!solucion || solucion.trim().length < 10);
    var missingMoveFields = mode === 'move' && (!exitDate || !nuevaPosicion || !nuevaFechaEntrada);
    var handleToggleTecnico = function (nombre) {
        var current = selectedTecnicns || [];
        if (current.includes(nombre)) {
            setValue('tecnicos_involucrados', current.filter(function (t) { return t !== nombre; }));
        }
        else {
            setValue('tecnicos_involucrados', __spreadArray(__spreadArray([], current, true), [nombre], false));
        }
    };
    var handleToggleFiltro = function (filtro) {
        var current = selectedFiltros || [];
        if (current.includes(filtro)) {
            setValue('mini_filtros', current.filter(function (f) { return f !== filtro; }));
        }
        else {
            setValue('mini_filtros', __spreadArray(__spreadArray([], current, true), [filtro], false));
        }
    };
    var handleInternalSubmit = function (data) {
        // Fix for the date/time issue: ensure dates are properly converted to ISO
        var formattedData = __assign(__assign({}, data), { fecha_hora_entrada: new Date(data.fecha_hora_entrada).toISOString(), fecha_hora_salida: data.fecha_hora_salida ? new Date(data.fecha_hora_salida).toISOString() : null, nueva_fecha_hora_entrada: data.nueva_fecha_hora_entrada ? new Date(data.nueva_fecha_hora_entrada).toISOString() : null, mini_filtros: Array.isArray(data.mini_filtros) ? data.mini_filtros.join(', ') : data.mini_filtros });
        onSubmit(formattedData);
    };
    return (<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose}/>

            <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {mode === 'move' ? (<><lucide_react_1.ArrowRightLeft className="w-5 h-5 text-orange-500"/> Cambio de Posición</>) : (initialData === null || initialData === void 0 ? void 0 : initialData.id) ? (<>Editar Registro</>) : (<>Agregar Nuevo Tren</>)}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <lucide_react_1.X className="w-5 h-5"/>
                    </button>
                </div>

                <form onSubmit={handleSubmit(handleInternalSubmit)} className="p-6 overflow-y-auto space-y-6">
                    {mode === 'move' && (<div className="space-y-6 bg-orange-500/5 p-4 rounded-xl border border-orange-500/10 mb-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase text-orange-600 tracking-wider">Fecha y Hora de Salida (Actual)</label>
                                    <input type="datetime-local" {...register('fecha_hora_salida')} className="w-full bg-background border-orange-500/20 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none"/>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase text-orange-600 tracking-wider">Nueva Posición (Destino)</label>
                                    <select {...register('nueva_posicion')} className="w-full bg-background border-orange-500/20 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none">
                                        {LUGARES.map(function (l) { return <option key={l} value={l}>{l}</option>; })}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-orange-600 tracking-wider">Nueva Fecha y Hora de Entrada</label>
                                <input type="datetime-local" {...register('nueva_fecha_hora_entrada')} className="w-full bg-background border-orange-500/20 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none"/>
                            </div>
                            <div className="border-t border-orange-500/10 pt-4 mt-2">
                                <p className="text-[10px] text-muted-foreground italic">El tren se marcará como disponible en su posición actual y se creará un nuevo ingreso en la nueva posición.</p>
                            </div>
                        </div>)}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Número de Tren</label>
                                {watch('tren') && (<span className="text-[10px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 uppercase tracking-tighter animate-in fade-in slide-in-from-right-2 duration-300">
                                        {(0, utils_1.getModeloTren)(watch('tren'))}
                                    </span>)}
                            </div>
                            <div className="relative">
                                <button type="button" disabled={!!(initialData === null || initialData === void 0 ? void 0 : initialData.id)} onClick={function () { return setShowTrenSelector(!showTrenSelector); }} className={"w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none flex items-center justify-between hover:border-primary/50 transition-colors ".concat((initialData === null || initialData === void 0 ? void 0 : initialData.id) ? 'opacity-50 cursor-not-allowed' : '')}>
                                    <div className="flex items-center gap-2">
                                        <lucide_react_1.Train className={"w-4 h-4 ".concat(watch('tren') ? 'text-primary' : 'text-muted-foreground')}/>
                                        <span className={watch('tren') ? 'font-medium' : 'text-muted-foreground'}>
                                            {watch('tren') || 'Seleccionar tren...'}
                                        </span>
                                    </div>
                                    {!(initialData === null || initialData === void 0 ? void 0 : initialData.id) && <lucide_react_1.ChevronDown className={"w-4 h-4 text-muted-foreground transition-transform ".concat(showTrenSelector ? 'rotate-180' : '')}/>}
                                </button>
                                {showTrenSelector && (<div className="absolute z-20 w-full mt-2 bg-card border border-border rounded-xl shadow-2xl max-h-64 overflow-hidden">
                                        <div className="p-2 grid grid-cols-3 gap-1.5 max-h-56 overflow-y-auto">
                                            {availableTrains.length === 0 ? (<p className="col-span-3 p-4 text-xs text-muted-foreground text-center">Todos los trenes están en taller</p>) : (availableTrains.map(function (item) { return (<button key={item.numero} type="button" onClick={function () {
                    setValue('tren', item.numero);
                    setShowTrenSelector(false);
                }} className={"\n                                                            relative p-2.5 rounded-lg border-2 transition-all duration-200 hover:scale-105 hover:shadow-md\n                                                            ".concat(watch('tren') === item.numero
                    ? "".concat(item.colorClass, " ring-2 ring-primary/50 ring-offset-2 ring-offset-card")
                    : "bg-muted/30 border-border hover:border-primary/50", "\n                                                        ")}>
                                                        <span className={"text-lg font-black leading-none block ".concat(watch('tren') === item.numero ? 'opacity-100' : 'opacity-70')}>
                                                            {item.numero}
                                                        </span>
                                                        <span className={"text-[8px] font-bold block mt-1 opacity-60 truncate"}>
                                                            {item.modelo}
                                                        </span>
                                                    </button>); }))}
                                        </div>
                                    </div>)}
                            </div>
                            {errors.tren && <p className="text-xs text-destructive flex items-center gap-1"><lucide_react_1.AlertCircle className="w-3 h-3"/> {errors.tren.message}</p>}
                            {duplicateTrain && (<div className="mt-2 bg-destructive/10 border border-destructive/20 p-2 rounded-lg flex items-start gap-2">
                                    <lucide_react_1.AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5"/>
                                    <div>
                                        <p className="text-[11px] font-bold text-destructive leading-tight">Tren ya en Taller</p>
                                        <p className="text-[10px] text-destructive/80 leading-tight">El Tren {duplicateTrain.tren} ya tiene un ingreso activo en {duplicateTrain.lugar_destino}.</p>
                                    </div>
                                </div>)}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Fecha y Hora de Entrada</label>
                            <input type="datetime-local" disabled={mode === 'move'} {...register('fecha_hora_entrada')} className={"w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none ".concat(mode === 'move' ? 'opacity-50 cursor-not-allowed' : '')}/>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Tipo de Atención</label>
                            <select {...register('tipo_atencion')} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none">
                                {TIPOS_ATENCION.map(function (t) { return <option key={t} value={t}>{t}</option>; })}
                            </select>
                        </div>

                            <div className="space-y-1.5">
                            <label className="text-sm font-medium">Lugar de Destino</label>
                            <select disabled={mode === 'move' || !!(initialData === null || initialData === void 0 ? void 0 : initialData.id)} {...register('lugar_destino')} className={"w-full bg-background border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none ".concat(occupiedBy ? 'border-orange-500 ring-1 ring-orange-500/20' : 'border-border', " ").concat((mode === 'move' || (initialData === null || initialData === void 0 ? void 0 : initialData.id)) ? 'opacity-50 cursor-not-allowed' : '')}>
                                {LUGARES.map(function (l) { return <option key={l} value={l}>{l}</option>; })})}
                            </select>
                            {occupiedBy && (<div className="mt-2 bg-destructive/10 border border-destructive/20 p-2 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                                    <lucide_react_1.AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5"/>
                                    <div>
                                        <p className="text-[11px] font-bold text-destructive leading-tight">Ubicación Ocupada</p>
                                        <p className="text-[10px] text-destructive/80 leading-tight">Este puesto ya está ocupado por el Tren {occupiedBy.tren}.</p>
                                    </div>
                                </div>)}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2 space-y-1.5">
                            <label className="text-sm font-medium">Motivo del Trabajo</label>
                            <textarea {...register('motivo_trabajo')} rows={3} spellCheck="true" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none" placeholder="Descripción detallada del motivo de ingreso..."/>
                            {errors.motivo_trabajo && <p className="text-xs text-destructive flex items-center gap-1"><lucide_react_1.AlertCircle className="w-3 h-3"/> {errors.motivo_trabajo.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">OM / OT</label>
                            <input type="text" inputMode="numeric" maxLength={13} {...register('om', {
        onChange: function (e) {
            e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 13);
            setValue('om', e.target.value);
        }
    })} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Número de OM/OT"/>
                            {watch('om') && (<p className="text-[11px] text-destructive font-medium flex items-center gap-1 mt-1 animate-pulse">
                                    <lucide_react_1.AlertCircle className="w-3 h-3"/> Máx. 13 caracteres numéricos.
                                </p>)}
                        </div>
                    </div>




                    {(initialData === null || initialData === void 0 ? void 0 : initialData.id) && (<>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Observaciones Adicionales</label>
                                <textarea {...register('observacion')} rows={2} spellCheck="true" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none" placeholder="Detalles, repuestos o notas..."/>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Solución / Trabajo Realizado</label>
                                <textarea {...register('solucion')} rows={2} spellCheck="true" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none" placeholder="Describa la solución aplicada..."/>
                                {missingSolucion && (<p className="text-[11px] text-destructive font-medium flex items-center gap-1 mt-1 animate-pulse">
                                        <lucide_react_1.AlertCircle className="w-3 h-3"/> Debe describir brevemente el trabajo realizado (mín. 10 caracteres).
                                    </p>)}
                            </div>

                            {mode !== 'move' && (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Fecha y Hora de Salida</label>
                                        <input type="datetime-local" {...register('fecha_hora_salida')} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none"/>
                                    </div>

                                    <div className="flex flex-col justify-end">
                                        <div className="flex items-center justify-between p-2.5 bg-muted/20 rounded-xl border border-border">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-semibold">¿Tren Disponible?</p>
                                            </div>
                                            <button type="button" onClick={function () { return setValue('disponible', !watch('disponible')); }} className={"relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ring-2 ring-primary/20 ".concat(watch('disponible') ? 'bg-primary' : 'bg-muted-foreground/30')}>
                                                <span className={"inline-block h-3 w-3 transform rounded-full bg-white transition-transform ".concat(watch('disponible') ? 'translate-x-5' : 'translate-x-1')}/>
                                            </button>
                                        </div>
                                    </div>
                                </div>)}
                            <div className="border-t border-border pt-4 mt-6">
                                <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Técnicos Involucrados</h3>
                                <div className="flex flex-wrap gap-2">
                                    {displayedTecnicos.map(function (t) { return (<button key={t} type="button" onClick={function () { return handleToggleTecnico(t); }} className={"px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border ".concat((selectedTecnicns || []).includes(t)
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105'
                    : 'bg-muted/50 border-border text-muted-foreground hover:border-muted-foreground/50')}>
                                            {t}
                                        </button>); })}
                                </div>
                                {missingTecnicos && (<div className="mt-3 bg-destructive/10 border border-destructive/20 p-2.5 rounded-lg flex items-start gap-2 animate-pulse">
                                        <lucide_react_1.AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5"/>
                                        <div>
                                            <p className="text-[11px] font-bold text-destructive leading-tight">Acción Requerida</p>
                                            <p className="text-[10px] text-destructive/80 leading-tight">Debe seleccionar al menos un técnico para dar la salida o disponibilidad.</p>
                                        </div>
                                    </div>)}
                            </div>

                        </>)}

                    <div className="space-y-1.5 pt-4 border-t border-border mt-6">
                        <label className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Mini Filtros</label>
                        <div className="flex flex-wrap gap-2">
                            {FILTROS.map(function (f) { return (<button key={f} type="button" onClick={function () { return handleToggleFiltro(f); }} className={"px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border ".concat(selectedFiltros.includes(f)
                ? 'bg-secondary text-secondary-foreground border-secondary shadow-lg shadow-secondary/20 scale-105'
                : 'bg-muted/50 border-border text-muted-foreground hover:border-muted-foreground/50')}>
                                    {f}
                                </button>); })}
                        </div>
                    </div>
                </form>

                <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium hover:text-foreground transition-all duration-200 hover:scale-[1.03] active:scale-95 rounded-xl hover:bg-muted">
                        Cancelar
                    </button>
                    <button type="submit" disabled={!!occupiedBy || !!duplicateTrain || missingTecnicos || missingSolucion || missingMoveFields} onClick={handleSubmit(handleInternalSubmit)} className={"btn-primary transition-all duration-200 hover:scale-[1.03] active:scale-95 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 ".concat(occupiedBy || duplicateTrain || missingTecnicos || missingSolucion || missingMoveFields ? 'opacity-50 cursor-not-allowed grayscale hover:scale-100 hover:translate-y-0 hover:shadow-none' : '')}>
                        <lucide_react_1.Save className="w-4 h-4"/>
                        {mode === 'move' ? 'Confirmar Cambio de Posición' : ((initialData === null || initialData === void 0 ? void 0 : initialData.id) ? 'Guardar Cambios' : 'Registrar Tren')}
                    </button>
                </div>
            </div>
        </div>);
}
