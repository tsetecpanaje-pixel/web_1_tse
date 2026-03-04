'use client';

import { useState, useMemo } from 'react';
import { useRegistros, useTecnicos } from '@/hooks/useRegistros';
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
import { RegistroTren, LugarDestino } from '@/types/database';
import { getModeloTren } from '@/lib/utils';
import { Train, ShieldCheck, AlertCircle, Clock, Calendar, Menu, Search, ListFilter } from 'lucide-react';

export default function DashboardPage() {
  const { registros, isLoading } = useRegistros();
  const { data: tecnicosData = [] } = useTecnicos();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Partial<RegistroTren> | undefined>(undefined);
  const [summaryRecord, setSummaryRecord] = useState<RegistroTren | null>(null);

  const initialFilters: FilterState = {
    search: '',
    model: '',
    tipoAtencion: '',
    lugar: '',
    tecnico: '',
    fechaInicio: '',
    fechaFin: '',
    soloActivos: false
  };
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [activeView, setActiveView] = useState<'dashboard' | 'filters'>('dashboard');

  const filteredRegistros = useMemo(() => {
    return registros.filter(reg => {
      // Búsqueda por número
      if (filters.search && !reg.tren.toLowerCase().includes(filters.search.toLowerCase())) return false;

      // Modelo
      if (filters.model && getModeloTren(reg.tren) !== filters.model) return false;

      // Tipo Atención
      if (filters.tipoAtencion && reg.tipo_atencion !== filters.tipoAtencion) return false;

      // Lugar
      if (filters.lugar && reg.lugar_destino !== filters.lugar) return false;

      // Técnico
      if (filters.tecnico && !reg.tecnicos_involucrados.some(t => t.toLowerCase().includes(filters.tecnico.toLowerCase()))) return false;

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

  const stats = {
    hoy: registros.filter(r => new Date(r.fecha_hora_entrada).toDateString() === new Date().toDateString()).length,
    correctivas: registros.filter(r => r.tipo_atencion === 'Avería' || r.tipo_atencion === 'O. Especial').length,
    preventivas: registros.filter(r => r.tipo_atencion === 'Mantenimiento Preventivo').length,
    disponibles: registros.filter(r => r.disponible).length,
  };

  const handleSubmit = async (formData: any) => {
    try {
      // Limpiar datos: convertir strings vacíos a null para campos opcionales/timestamps
      const data = { ...formData };
      if (!data.fecha_hora_salida || data.fecha_hora_salida === '') {
        delete data.fecha_hora_salida; // Supabase lo tratará como null si es opcional
      }
      if (data.mini_filtros === '') data.mini_filtros = null;
      if (data.observacion === '') data.observacion = null;
      if (data.solucion === '') data.solucion = null;

      console.log('Sumbitting data:', data);

      if (editingRecord?.id) {
        const { error } = await supabase
          .from('trenes_registros')
          .update(data)
          .eq('id', editingRecord.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('trenes_registros')
          .insert([data]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      setEditingRecord(undefined);
    } catch (err: any) {
      console.error('Detailed Error Context:', {
        message: err.message,
        details: err.details,
        hint: err.hint,
        code: err.code,
        fullError: err
      });
      alert(`Error al guardar: ${err.message || 'Error desconocido'}. Detalle: ${err.details || ''}`);
    }
  };

  const handleEdit = (registro: RegistroTren) => {
    setEditingRecord(registro);
    setIsModalOpen(true);
  };

  const handleViewSummary = (registro: RegistroTren) => {
    setSummaryRecord(registro);
  };

  const handleEditFromSummary = (registro: RegistroTren) => {
    setSummaryRecord(null);
    setEditingRecord(registro);
    setIsModalOpen(true);
  };

  const handleDashboardClick = () => {
    setFilters(initialFilters);
    setActiveView('dashboard');
  };

  const handleFilterClick = () => {
    setActiveView('filters');
  };

  const handleAddNew = (lugar?: LugarDestino) => {
    setEditingRecord(lugar ? { lugar_destino: lugar } : undefined);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      try {
        const { error } = await supabase
          .from('trenes_registros')
          .delete()
          .eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error('Error deleting record:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <Header onAddClick={() => handleAddNew()} />

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        <MenuNavigation
          onDashboardClick={handleDashboardClick}
          onFilterClick={handleFilterClick}
          activeView={activeView}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 pb-32 lg:pb-8">
          {activeView === 'dashboard' ? (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                <WorkshopStatus
                  registros={registros}
                  onViewSummary={handleViewSummary}
                  onAdd={handleAddNew}
                />
                <GraficoIngresos registros={registros} />
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
                  subtitle="Averías y órdenes especiales"
                  icon={<AlertCircle className="w-5 h-5" />}
                  color="orange"
                  trend="+2 vs ayer"
                />
                <DashboardCard
                  title="Mantenimiento Preventivo"
                  value={stats.preventivas}
                  subtitle="Siga y cíclicos"
                  icon={<ShieldCheck className="w-5 h-5" />}
                  color="green"
                />
                <DashboardCard
                  title="Trenes Disponibles"
                  value={stats.disponibles}
                  subtitle="Listos para operación"
                  icon={<Clock className="w-5 h-5" />}
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
                      registros={filteredRegistros}
                      isLoading={isLoading}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </div>
                </div>

                <div className="space-y-4">
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
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                  <Search className="w-6 h-6 text-primary" />
                  Búsqueda y Filtros Avanzados
                </h2>
              </div>

              <FilterPanel
                filters={filters}
                onFilterChange={setFilters}
                onReset={() => setFilters(initialFilters)}
              />

              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                <TrainRecordsTable
                  registros={filteredRegistros}
                  isLoading={isLoading}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {isModalOpen && (
        <FormularioRegistro
          initialData={editingRecord}
          onSubmit={handleSubmit}
          onClose={() => setIsModalOpen(false)}
          tecnicos={tecnicosData.map((t: any) => t.nombre_completo)}
          registros={registros}
        />
      )}

      {summaryRecord && (
        <TrainSummaryModal
          registro={summaryRecord}
          onClose={() => setSummaryRecord(null)}
          onEdit={handleEditFromSummary}
        />
      )}
    </div>
  );
}
