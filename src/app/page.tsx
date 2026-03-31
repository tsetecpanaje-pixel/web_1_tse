'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRegistros, useTecnicos } from '@/hooks/useRegistros';
import { useConfigTrenes, useConfigTecnicos } from '@/hooks/useConfig';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Header from '@/components/layout/Header';
import MenuNavigation from '@/components/layout/MenuNavigation';
import DashboardCard from '@/components/dashboard/DashboardCard';
import TrainRecordsTable from '@/components/registros/TrainRecordsTable';
import FormularioRegistro from '@/components/forms/FormularioRegistro';
import TrainSummaryModal from '@/components/registros/TrainSummaryModal';
import FilterPanel, { FilterState } from '@/components/registros/FilterPanel';
import GraficoIngresos from '@/components/dashboard/GraficoIngresos';
import WorkshopStatus from '@/components/dashboard/WorkshopStatus';
import ConfiguracionPage from '@/components/config/ConfiguracionPage';
import ProfilePage from '@/components/config/ProfilePage';
import SubirDatos from '@/components/subir-datos/SubirDatos';
import GraficosPage from '@/components/graficos/GraficosPage';
import AuthForm from '@/components/auth/AuthForm';
import { RegistroTren, LugarDestino } from '@/types/database';
import { getModeloTren } from '@/lib/utils';
import { exportToExcel } from '@/lib/export';
import { Train, ShieldCheck, AlertCircle, Clock, Calendar, Search, ChevronLeft } from 'lucide-react';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { user, loading: authLoading, isUsuario, canEdit, canAccessConfig, role } = useAuth();
  const { registros, isLoading } = useRegistros();
  const { data: tecnicosData = [] } = useTecnicos();
  const { tecnicos: tecnicosConfig = [] } = useConfigTecnicos();
  const { trenes: trenesConfig = [] } = useConfigTrenes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Partial<RegistroTren> | undefined>(undefined);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'move'>('add');
  const [summaryRecord, setSummaryRecord] = useState<RegistroTren | null>(null);

  const initialFilters: FilterState = {
    search: '',
    model: '',
    tipoAtencion: '',
    lugar: '',
    tecnico: '',
    fechaInicio: '',
    fechaFin: '',
    soloActivos: false,
    miniFiltros: ''
  };
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [activeView, setActiveView] = useState<'dashboard' | 'filters' | 'config' | 'subir-datos' | 'profile' | 'charts'>('dashboard');
  const [isFilterPanelCollapsed, setIsFilterPanelCollapsed] = useState(false);

  // Reset scroll to top when changing views
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView]);

  const filteredRegistros = useMemo(() => {
    return registros.filter(reg => {
      // Búsqueda por número
      if (filters.search && reg.tren.toLowerCase() !== filters.search.toLowerCase()) return false;

      // Modelo
      if (filters.model && getModeloTren(reg.tren) !== filters.model) return false;

      // Tipo Atención
      if (filters.tipoAtencion && reg.tipo_atencion !== filters.tipoAtencion) return false;

      // Lugar
      if (filters.lugar && reg.lugar_destino !== filters.lugar) return false;

      // Técnico
      if (filters.tecnico && !(reg.tecnicos_involucrados || []).some(t => t.toLowerCase().includes(filters.tecnico.toLowerCase()))) return false;

      // Mini Filtros
      if (filters.miniFiltros && !(reg.mini_filtros || '').toLowerCase().includes(filters.miniFiltros.toLowerCase())) return false;

      // Fecha Inicio
      if (filters.fechaInicio && new Date(reg.fecha_hora_entrada) < new Date(filters.fechaInicio)) return false;

      // Fecha Fin (inclusive)
      if (filters.fechaFin) {
        const endDay = new Date(filters.fechaFin);
        endDay.setHours(23, 59, 59, 999);
        if (new Date(reg.fecha_hora_entrada) > endDay) return false;
      }

      // Solo Activos (Siguen en taller)
      if (filters.soloActivos && reg.fecha_hora_salida) return false;

      return true;
    });
  }, [registros, filters]);

  const totalParqueActivo = trenesConfig.filter((t: any) => t.activo).length;

  const trenStatsByModel = (() => {
    // 1. Inicializar conteos por modelo basados en la configuración de trenes activos
    const counts: Record<string, { enTaller: number; total: number }> = {
      'NS-74': { enTaller: 0, total: 0 },
      'NS-93': { enTaller: 0, total: 0 },
      'NS-16': { enTaller: 0, total: 0 }
    };

    trenesConfig.forEach((t: any) => {
      if (t.activo && counts[t.modelo]) {
        counts[t.modelo].total++;
      }
    });

    // 2. Identificar trenes que están actualmente en el taller (sin fecha de salida)
    const trenesEnTaller = registros.filter(r => !r.fecha_hora_salida);
    // Usamos un Set para evitar duplicados si un tren tiene múltiples registros abiertos (aunque no debería pasar)
    const distinctTrenesEnTaller = new Set(trenesEnTaller.map(r => r.tren));

    distinctTrenesEnTaller.forEach(trenNum => {
      const model = getModeloTren(trenNum);
      if (counts[model]) {
        counts[model].enTaller++;
      }
    });

    return counts;
  })();

  const totalEnTaller = Object.values(trenStatsByModel).reduce((acc, curr) => acc + curr.enTaller, 0);
  const totalDisponiblesLinea = totalParqueActivo - totalEnTaller;

  const last30DaysDate = new Date();
  last30DaysDate.setHours(0, 0, 0, 0); // Start of day
  last30DaysDate.setDate(last30DaysDate.getDate() - 30);

  const stats = {
    hoy: registros.filter(r =>
      new Date(r.fecha_hora_entrada).toDateString() === new Date().toDateString() &&
      !r.es_movimiento
    ).length,
    correctivas: registros.filter(r =>
      (r.tipo_atencion === 'Avería' || r.tipo_atencion === 'O. Especial') &&
      new Date(r.fecha_hora_entrada) >= last30DaysDate &&
      !r.es_movimiento
    ).length,
    preventivas: registros.filter(r =>
      r.tipo_atencion === 'Mantenimiento Preventivo' &&
      new Date(r.fecha_hora_entrada) >= last30DaysDate &&
      !r.es_movimiento
    ).length,
    disponibles: totalDisponiblesLinea,
  };

  const handleSubmit = async (formData: any) => {
    try {
      // Limpiar datos: convertir strings vacíos a null para campos opcionales/timestamps
      const data = { ...formData };
      if (!data.fecha_hora_salida || data.fecha_hora_salida === '') {
        data.fecha_hora_salida = null; // Establecer explícitamente a null para que Supabase actualice
      }
      if (data.mini_filtros === '') data.mini_filtros = null;
      if (data.observacion === '') data.observacion = null;
      if (data.solucion === '') data.solucion = null;

      console.log('Sumbitting data:', data);

      if (modalMode === 'move') {
        const { nueva_posicion, nueva_fecha_hora_entrada, ...oldRecordData } = data;

        // 1. Update the old record
        const { error: updateError } = await supabase
          .from('trenes_registros')
          .update({
            ...oldRecordData,
            disponible: true, // Force available when moved
            updated_at: new Date().toISOString()
          })
          .eq('id', editingRecord?.id);

        if (updateError) throw updateError;

        // 2. Create the new record
        const { error: insertError } = await supabase
          .from('trenes_registros')
          .insert([{
            tren: data.tren,
            // Ahora conservamos el tipo de atención original
            tipo_atencion: data.tipo_atencion,
            lugar_destino: nueva_posicion,
            // El motivo original debe ir primero, luego la info del cambio de posición
            motivo_trabajo: `${data.motivo_trabajo} (Cambio de posición desde ${data.lugar_destino})`,
            mini_filtros: data.mini_filtros,
            fecha_hora_entrada: nueva_fecha_hora_entrada,
            tecnicos_involucrados: [],
            disponible: false,
            // Marcamos como movimiento para no contarlo como nuevo ingreso hoy
            es_movimiento: true
          }]);

        if (insertError) throw insertError;
      } else if (editingRecord?.id) {
        const { nueva_posicion, nueva_fecha_hora_entrada, ...restData } = data;
        const { error } = await supabase
          .from('trenes_registros')
          .update({
            ...restData
          })
          .eq('id', editingRecord.id);
        if (error) throw error;
      } else {
        const { nueva_posicion, nueva_fecha_hora_entrada, ...restData } = data;
        const { error } = await supabase
          .from('trenes_registros')
          .insert([{
            ...restData
          }]);
        if (error) throw error;
      }
      queryClient.invalidateQueries({ queryKey: ['registros'] });
      setIsModalOpen(false);
      setEditingRecord(undefined);
    } catch (err: any) {
      console.error('Error saving full:', JSON.stringify(err, null, 2), err);
      const errorMessage = err?.message || err?.error_description || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      const errorDetails = err?.details || err?.hint || '';
      alert(`Error al guardar: ${errorMessage}. Detalle: ${errorDetails}`);
    }
  };

  const handleEdit = (registro: RegistroTren) => {
    setEditingRecord(registro);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleMove = (registro: RegistroTren) => {
    setSummaryRecord(null);
    setEditingRecord(registro);
    setModalMode('move');
    setIsModalOpen(true);
  };

  const handleViewSummary = (registro: RegistroTren) => {
    setSummaryRecord(registro);
  };

  const handleEditFromSummary = (registro: RegistroTren) => {
    setSummaryRecord(null);
    setEditingRecord(registro);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDashboardClick = () => {
    setFilters(initialFilters);
    setActiveView('dashboard');
  };

  const handleFilterClick = () => {
    setActiveView('filters');
    setIsFilterPanelCollapsed(false);
  };

  const handleConfigClick = () => {
    setActiveView('config');
  };

  const handleProfileClick = () => {
    setActiveView('profile');
  };

  const handleChartsClick = () => {
    setActiveView('charts');
  };

  const handleNavigateToFilters = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({
      ...initialFilters,
      ...newFilters
    }));
    setActiveView('filters');
    setIsFilterPanelCollapsed(true);
  };

  const handleAddNew = (lugar?: LugarDestino) => {
    setEditingRecord(lugar ? { lugar_destino: lugar } : undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      try {
        console.log('Attempting to delete record with ID:', id);
        const { error, status, statusText } = await supabase
          .from('trenes_registros')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Supabase delete error:', error);
          throw error;
        }

        console.log('Delete successful, status:', status, statusText);
        queryClient.invalidateQueries({ queryKey: ['registros'] });
      } catch (err: any) {
        console.error('Error in handleDelete:', err);
        const errorMsg = err?.message || err?.error_description || (typeof err === 'object' ? JSON.stringify(err) : String(err));
        alert(`Error al eliminar: ${errorMsg}`);
      }
    }
  };

  return (
    <>
      {authLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex items-center gap-3 text-muted-foreground">
            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Cargando...</span>
          </div>
        </div>
      ) : !user ? (
        <AuthForm />
      ) : (
        <div className="min-h-screen bg-background relative flex flex-col">
          <Header onAddClick={() => handleAddNew()} onProfileClick={handleProfileClick} onConfigClick={handleConfigClick} />

          <div className="flex flex-1 overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            <MenuNavigation
              onDashboardClick={handleDashboardClick}
              onFilterClick={handleFilterClick}
              onChartsClick={handleChartsClick}
              activeView={activeView}
            />

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 pb-32 lg:pb-8">
              {activeView === 'profile' ? (
                <ProfilePage onClose={handleDashboardClick} />
              ) : activeView === 'config' ? (
                <ConfiguracionPage onBack={handleDashboardClick} />
              ) : activeView === 'charts' ? (
                <GraficosPage
                  registros={registros}
                  onBack={handleDashboardClick}
                  onFilterClick={(f) => handleNavigateToFilters({ search: f.tren, miniFiltros: f.mini_filtros })}
                />
              ) : !isUsuario ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                  <WorkshopStatus
                    registros={registros}
                    onViewSummary={handleViewSummary}
                    onAdd={() => { }}
                    canEdit={false}
                  />
                  <div className="dashboard-card p-6 border-l-4 border-emerald-500">
                    <h3 className="font-bold mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Train className="w-4 h-4 text-emerald-500" /> Disponibilidad en Línea
                      </div>
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(trenStatsByModel).map(([model, stats]) => (
                        <div key={model} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${model === 'NS-74' ? 'bg-orange-500' :
                              model === 'NS-93' ? 'bg-emerald-500' : 'bg-yellow-500'
                              }`}></span>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold">{model}</span>
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-black">
                                Total: {stats.total}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-black">{stats.total - stats.enTaller}</span>
                            <span className="text-[10px] text-muted-foreground block font-bold leading-none uppercase">Disp.</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Total Línea</span>
                        <span className="text-2xl font-black text-emerald-500">{totalDisponiblesLinea}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Parque Activo</span>
                        <span className="text-xl font-black">{totalParqueActivo}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeView === 'dashboard' ? (
                <>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                    <WorkshopStatus
                      registros={registros}
                      onViewSummary={handleViewSummary}
                      onAdd={handleAddNew}
                      canEdit={canEdit}
                    />
                    <GraficoIngresos registros={registros} onFilterClick={(f) => handleNavigateToFilters({ search: f.tren, miniFiltros: f.mini_filtros, tipoAtencion: f.tipo_atencion })} />
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    <DashboardCard
                      title="Total Ingresos Hoy"
                      value={stats.hoy}
                      subtitle="Trenes ingresados hoy"
                      icon={<Train className="w-5 h-5" />}
                      color="blue"
                    />
                    <DashboardCard
                      title="Atenciones Correctivas"
                      value={stats.correctivas}
                      subtitle="Últimos 30 días"
                      icon={<AlertCircle className="w-5 h-5" />}
                      color="orange"
                    />
                    <DashboardCard
                      title="Mantenimiento Preventivo"
                      value={stats.preventivas}
                      subtitle="Últimos 30 días"
                      icon={<ShieldCheck className="w-5 h-5" />}
                      color="green"
                    />
                    <DashboardCard
                      title="Flota en Línea"
                      value={stats.disponibles}
                      subtitle="Trenes operativos fuera de taller"
                      icon={<Train className="w-5 h-5" />}
                      color="blue"
                    />
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 space-y-8">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-bold flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            Últimos Registros
                          </h2>
                        </div>

                        <TrainRecordsTable
                          registros={filteredRegistros.slice(0, 300)}
                          isLoading={isLoading}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          pageSize={25}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="dashboard-card p-6 border-l-4 border-emerald-500">
                        <h3 className="font-bold mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Train className="w-4 h-4 text-emerald-500" /> Disponibilidad en Línea
                          </div>
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(trenStatsByModel).map(([model, stats]) => (
                            <div key={model} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${model === 'NS-74' ? 'bg-orange-500' :
                                  model === 'NS-93' ? 'bg-emerald-500' : 'bg-yellow-500'
                                  }`}></span>
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold">{model}</span>
                                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-black">
                                    Total: {stats.total}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-xl font-black">{stats.total - stats.enTaller}</span>
                                <span className="text-[10px] text-muted-foreground block font-bold leading-none uppercase">Disp.</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Total Línea</span>
                            <span className="text-2xl font-black text-emerald-500">{totalDisponiblesLinea}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Parque Activo</span>
                            <span className="text-xl font-black">{totalParqueActivo}</span>
                          </div>
                        </div>
                      </div>

                      <div className="dashboard-card p-6 border-l-4 border-primary">
                        <h3 className="font-bold mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" /> Turno Actual
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">Mañana: 06:00 - 14:00</p>
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-bold">
                              T{i}
                            </div>
                          ))}
                          <div className="w-8 h-8 rounded-full border-2 border-card bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                            +25
                          </div>
                        </div>
                      </div>

                      <div className="dashboard-card p-6">
                        <h3 className="font-bold mb-3">Accesos Directos</h3>
                        <div className="space-y-2">
                          <button className="w-full text-left p-2 text-sm hover:bg-muted rounded transition-colors flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div> Generar OT Lavado
                          </button>
                          <button className="w-full text-left p-2 text-sm hover:bg-muted rounded transition-colors flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div> Reporte Diario PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : activeView === 'subir-datos' ? (
                <SubirDatos />
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleDashboardClick}
                      className="p-2.5 rounded-xl bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95 border border-border/40"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                      <Search className="w-6 h-6 text-primary" />
                      Búsqueda y Filtros Avanzados
                    </h2>
                  </div>

                  <FilterPanel
                    filters={filters}
                    onFilterChange={setFilters}
                    onReset={() => setFilters(initialFilters)}
                    onBack={handleDashboardClick}
                    tecnicos={tecnicosConfig.filter((t: any) => t.categoria === 'general').map((t: any) => ({ nombre: t.nombre }))}
                    isCollapsed={isFilterPanelCollapsed}
                    onToggleCollapse={() => setIsFilterPanelCollapsed(!isFilterPanelCollapsed)}
                    onExport={() => exportToExcel(filteredRegistros)}
                  />

                  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                    <TrainRecordsTable
                      registros={filteredRegistros}
                      isLoading={isLoading}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      pageSize={100}
                    />
                  </div>
                </div>
              )}
            </main>
          </div>

          {isModalOpen && (
            <FormularioRegistro
              initialData={editingRecord}
              mode={modalMode}
              onSubmit={handleSubmit}
              onClose={() => {
                setIsModalOpen(false);
                setEditingRecord(undefined);
              }}
              tecnicos={tecnicosData.map((t: any) => t.nombre)}
              registros={registros}
            />
          )}

          {summaryRecord && (
            <TrainSummaryModal
              registro={summaryRecord}
              onClose={() => setSummaryRecord(null)}
              onEdit={handleEditFromSummary}
              onMove={handleMove}
            />
          )}
        </div>
      )}
    </>
  );
}
