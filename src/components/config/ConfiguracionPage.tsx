'use client';

import { useState } from 'react';
import { useConfigTecnicos, useConfigTrenes } from '@/hooks/useConfig';
import { CategoriaTecnico, ConfigTecnico, ConfigTren } from '@/types/database';
import SubirDatos from '@/components/subir-datos/SubirDatos';
import {
    Users, Train, Plus, Trash2, Edit2, Check, X, Search,
    Shield, Wrench, Star, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, Upload
} from 'lucide-react';

const CATEGORIAS: { id: CategoriaTecnico; label: string; icon: React.ReactNode; color: string; desc: string }[] = [
    { id: 'preventivo', label: 'Preventivo', icon: <Shield className="w-4 h-4" />, color: 'emerald', desc: 'Mantenimiento Preventivo' },
    { id: 'general', label: 'Correctivo', icon: <Wrench className="w-4 h-4" />, color: 'blue', desc: 'Averías y trabajo correctivo' },
    { id: 'especial', label: 'Externo', icon: <Star className="w-4 h-4" />, color: 'amber', desc: 'Empresas Externas' },
];

const MODELOS = ['NS-74', 'NS-93', 'NS-16'];

export default function ConfiguracionPage({ onBack }: { onBack: () => void }) {
    const [activeTab, setActiveTab] = useState<'tecnicos' | 'trenes' | 'subir-datos'>('tecnicos');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                            <Wrench className="w-6 h-6 text-primary" />
                        </div>
                        Configuración
                    </h1>
                    <p className="text-sm text-muted-foreground ml-14">Administra técnicos y parque de trenes</p>
                </div>
                <button
                    onClick={onBack}
                    className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground border border-border rounded-xl hover:bg-muted transition-all"
                >
                    ← Volver
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-muted/30 rounded-xl border border-border w-fit">
                <button
                    onClick={() => setActiveTab('tecnicos')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'tecnicos'
                        ? 'bg-card shadow-md text-foreground border border-border'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" /> <span>Técnicos</span>
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('trenes')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'trenes'
                        ? 'bg-card shadow-md text-foreground border border-border'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Train className="w-4 h-4" /> <span>Parque de Trenes</span>
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('subir-datos')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'subir-datos'
                        ? 'bg-card shadow-md text-foreground border border-border'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4" /> <span>Subir Datos</span>
                    </div>
                </button>
            </div>

            {/* Content */}
            {activeTab === 'tecnicos' ? (
                <TecnicosSection />
            ) : activeTab === 'trenes' ? (
                <TrenesSection />
            ) : (
                <SubirDatos />
            )}
        </div>
    );
}

// ─── SECCIÓN TÉCNICOS ────────────────────────────────────
function TecnicosSection() {
    const { tecnicos, isLoading, addTecnico, updateTecnico, deleteTecnico } = useConfigTecnicos();
    const [expandedCat, setExpandedCat] = useState<CategoriaTecnico | null>(null);
    const [newNombre, setNewNombre] = useState('');
    const [addingTo, setAddingTo] = useState<CategoriaTecnico | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editNombre, setEditNombre] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const handleAdd = async (categoria: CategoriaTecnico) => {
        if (!newNombre.trim()) return;
        await addTecnico.mutateAsync({ nombre: newNombre.trim(), categoria });
        setNewNombre('');
        setAddingTo(null);
    };

    const handleUpdate = async (id: string) => {
        if (!editNombre.trim()) return;
        await updateTecnico.mutateAsync({ id, nombre: editNombre.trim() });
        setEditingId(null);
        setEditNombre('');
    };

    const handleToggleActive = async (tec: ConfigTecnico) => {
        await updateTecnico.mutateAsync({ id: tec.id, activo: !tec.activo });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este técnico permanentemente?')) return;
        await deleteTecnico.mutateAsync(id);
    };

    if (isLoading) return <LoadingSkeleton />;

    const filterTecnicos = (cat: CategoriaTecnico) => {
        const list = tecnicos.filter(t => t.categoria === cat);
        if (!searchQuery) return list;
        return list.filter(t => t.nombre.toLowerCase().includes(searchQuery.toLowerCase()));
    };

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Buscar técnico..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-muted/30 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/40 outline-none"
                />
            </div>

            {/* Categories */}
            {CATEGORIAS.map(cat => {
                const list = filterTecnicos(cat.id);
                const activeCount = list.filter(t => t.activo).length;
                const isExpanded = expandedCat === cat.id;
                const colorMap: Record<string, string> = {
                    emerald: 'border-emerald-500/20 bg-emerald-500/5',
                    blue: 'border-blue-500/20 bg-blue-500/5',
                    amber: 'border-amber-500/20 bg-amber-500/5',
                };
                const badgeColor: Record<string, string> = {
                    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                };

                return (
                    <div key={cat.id} className={`rounded-2xl border overflow-hidden transition-all ${colorMap[cat.color]}`}>
                        <button
                            onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                            className="w-full flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg border ${badgeColor[cat.color]}`}>
                                    {cat.icon}
                                </div>
                                <div className="text-left">
                                    <h3 className="text-sm font-bold">{cat.label}</h3>
                                    <p className="text-[10px] text-muted-foreground">{cat.desc}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-2 py-0.5 text-[10px] font-black rounded-full border ${badgeColor[cat.color]}`}>
                                    {activeCount} activos
                                </span>
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                            </div>
                        </button>

                        {isExpanded && (
                            <div className="px-4 pb-4 space-y-2">
                                {addingTo === cat.id ? (
                                    <div className="flex items-center gap-2 bg-background p-2 rounded-xl border border-border">
                                        <input
                                            type="text"
                                            value={newNombre}
                                            onChange={e => setNewNombre(e.target.value)}
                                            placeholder="Nombre del técnico..."
                                            className="flex-1 bg-transparent text-sm outline-none px-2"
                                            autoFocus
                                            onKeyDown={e => e.key === 'Enter' && handleAdd(cat.id)}
                                        />
                                        <button onClick={() => handleAdd(cat.id)} className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors">
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => { setAddingTo(null); setNewNombre(''); }} className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setAddingTo(cat.id)}
                                        className="w-full flex items-center justify-center gap-2 p-2 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all text-sm"
                                    >
                                        <Plus className="w-4 h-4" /> Agregar Técnico
                                    </button>
                                )}

                                <div className="space-y-1.5">
                                    {list.map(tec => (
                                        <div
                                            key={tec.id}
                                            className={`flex items-center justify-between p-2.5 rounded-xl bg-background/60 border border-border/50 group transition-all ${!tec.activo ? 'opacity-50' : ''}`}
                                        >
                                            {editingId === tec.id ? (
                                                <div className="flex items-center gap-2 flex-1">
                                                    <input
                                                        type="text"
                                                        value={editNombre}
                                                        onChange={e => setEditNombre(e.target.value)}
                                                        className="flex-1 bg-transparent text-sm outline-none border-b border-primary/40 px-1 py-0.5"
                                                        autoFocus
                                                        onKeyDown={e => e.key === 'Enter' && handleUpdate(tec.id)}
                                                    />
                                                    <button onClick={() => handleUpdate(tec.id)} className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded-lg">
                                                        <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="p-1 text-muted-foreground hover:bg-muted rounded-lg">
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="text-sm font-medium">{tec.nombre}</span>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleToggleActive(tec)}
                                                            className="p-1 hover:bg-muted rounded-lg transition-colors"
                                                            title={tec.activo ? 'Desactivar' : 'Activar'}
                                                        >
                                                            {tec.activo
                                                                ? <ToggleRight className="w-4 h-4 text-emerald-500" />
                                                                : <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                                                            }
                                                        </button>
                                                        <button
                                                            onClick={() => { setEditingId(tec.id); setEditNombre(tec.nombre); }}
                                                            className="p-1 hover:bg-muted rounded-lg transition-colors"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(tec.id)}
                                                            className="p-1 hover:bg-destructive/10 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                    {list.length === 0 && (
                                        <p className="text-xs text-muted-foreground italic text-center py-4">
                                            {searchQuery ? 'Sin resultados' : 'Sin técnicos en esta categoría'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── SECCIÓN TRENES ──────────────────────────────────────
function TrenesSection() {
    const { trenes, isLoading, addTren, updateTren, deleteTren } = useConfigTrenes();
    const [isAdding, setIsAdding] = useState(false);
    const [newNumero, setNewNumero] = useState('');
    const [newModelo, setNewModelo] = useState('NS-74');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editNumero, setEditNumero] = useState('');
    const [editModelo, setEditModelo] = useState('');
    const [filterModelo, setFilterModelo] = useState('');

    const handleAdd = async () => {
        if (!newNumero.trim()) return;
        const existeTren = trenes.some(t => t.numero === newNumero.trim());
        if (existeTren) {
            alert(`El tren ${newNumero.trim()} ya existe en el parque`);
            return;
        }
        await addTren.mutateAsync({ numero: newNumero.trim(), modelo: newModelo as any });
        setNewNumero('');
        setNewModelo('NS-74');
        setIsAdding(false);
    };

    const handleUpdate = async (id: string) => {
        if (!editNumero.trim()) return;
        const existeTren = trenes.some(t => t.numero === editNumero.trim() && t.id !== id);
        if (existeTren) {
            alert(`El tren ${editNumero.trim()} ya existe en el parque`);
            return;
        }
        await updateTren.mutateAsync({ id, numero: editNumero.trim(), modelo: editModelo as any });
        setEditingId(null);
    };

    const handleToggle = async (tren: ConfigTren) => {
        await updateTren.mutateAsync({ id: tren.id, activo: !tren.activo });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este tren permanentemente?')) return;
        await deleteTren.mutateAsync(id);
    };

    if (isLoading) return <LoadingSkeleton />;

    const MODEL_ORDER: Record<string, number> = { 'NS-74': 0, 'NS-93': 1, 'NS-16': 2 };

    const filteredTrenes = (filterModelo
        ? trenes.filter(t => t.modelo === filterModelo)
        : trenes
    ).sort((a, b) => {
        const modelDiff = (MODEL_ORDER[a.modelo] ?? 99) - (MODEL_ORDER[b.modelo] ?? 99);
        if (modelDiff !== 0) return modelDiff;
        return a.numero.localeCompare(b.numero, undefined, { numeric: true });
    });

    const activeCount = trenes.filter(t => t.activo).length;

    const modeloColors: Record<string, string> = {
        'NS-74': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        'NS-93': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        'NS-16': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    };

    const getModeloColor = (modelo: string) => modeloColors[modelo] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-bold">{activeCount} activos</span>
                    <span className="text-xs text-muted-foreground">/ {trenes.length} total</span>
                </div>
                <div className="flex gap-2 ml-auto flex-wrap">
                    <button
                        onClick={() => setFilterModelo('')}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-all ${!filterModelo ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted/30 text-muted-foreground border-border hover:text-foreground'}`}
                    >
                        Todos
                    </button>
                    {MODELOS.map(m => (
                        <button
                            key={m}
                            onClick={() => setFilterModelo(filterModelo === m ? '' : m)}
                            className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-all ${filterModelo === m ? modeloColors[m] : 'bg-muted/30 text-muted-foreground border-border hover:text-foreground'}`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            {isAdding ? (
                <div className="flex items-center gap-2 bg-card p-3 rounded-xl border border-border">
                    <input
                        type="text"
                        value={newNumero}
                        onChange={e => setNewNumero(e.target.value)}
                        placeholder="N° Tren (ej: 44)"
                        className="flex-1 bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                        autoFocus
                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    />
                    <select
                        value={newModelo}
                        onChange={e => setNewModelo(e.target.value)}
                        className="bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm outline-none"
                    >
                        {MODELOS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <button onClick={handleAdd} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors">
                        <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setIsAdding(false); setNewNumero(''); }} className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all text-sm font-bold"
                >
                    <Plus className="w-4 h-4" /> Agregar Tren al Parque
                </button>
            )}

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {filteredTrenes.map(tren => (
                    <div
                        key={tren.id}
                        className={`group relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${tren.activo
                            ? `${getModeloColor(tren.modelo)} hover:scale-105 hover:shadow-md`
                            : 'bg-muted/10 border-border/30 opacity-40 grayscale'
                            }`}
                    >
                        {editingId === tren.id ? (
                            <div className="space-y-2 w-full">
                                <input
                                    type="text"
                                    value={editNumero}
                                    onChange={e => setEditNumero(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs outline-none text-center"
                                    autoFocus
                                    onKeyDown={e => e.key === 'Enter' && handleUpdate(tren.id)}
                                />
                                <select
                                    value={editModelo}
                                    onChange={e => setEditModelo(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-1 py-1 text-[10px] outline-none"
                                >
                                    {MODELOS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <div className="flex gap-1 justify-center">
                                    <button onClick={() => handleUpdate(tren.id)} className="p-1 text-emerald-500"><Check className="w-3 h-3" /></button>
                                    <button onClick={() => setEditingId(null)} className="p-1 text-muted-foreground"><X className="w-3 h-3" /></button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Train className="w-5 h-5 mb-1" />
                                <span className="text-lg font-black leading-none">{tren.numero}</span>
                                <span className="text-[9px] font-bold opacity-70 mt-0.5">{tren.modelo}</span>

                                <div className="absolute inset-0 bg-card/95 backdrop-blur-sm rounded-xl flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => handleToggle(tren)} className="p-1.5 hover:bg-muted rounded-lg" title={tren.activo ? 'Desactivar' : 'Activar'}>
                                        {tren.activo ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                                    </button>
                                    <button onClick={() => { setEditingId(tren.id); setEditNumero(tren.numero); setEditModelo(tren.modelo); }} className="p-1.5 hover:bg-muted rounded-lg">
                                        <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                                    </button>
                                    <button onClick={() => handleDelete(tren.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg">
                                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {filteredTrenes.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8 italic">No se encontraron trenes con ese filtro.</p>
            )}
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-muted/20 rounded-2xl animate-pulse border border-border/30" />
            ))}
        </div>
    );
}
