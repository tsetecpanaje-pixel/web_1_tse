'use client';

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ConfigTecnico, ConfigTren, CategoriaTecnico } from '@/types/database';

// ─── TÉCNICOS ────────────────────────────────────────
export function useConfigTecnicos() {
    const queryClient = useQueryClient();

    const { user } = useAuth();
    const { data: tecnicos = [], isLoading } = useQuery({
        queryKey: ['config_tecnicos', user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('config_tecnicos')
                .select('*')
                .order('nombre', { ascending: true });
            if (error) {
                console.error('Error fetching config_tecnicos:', error);
                throw error;
            }
            return (data || []) as ConfigTecnico[];
        },
        enabled: !!user,
    });

    const safeTecnicos = tecnicos || [];

    const addTecnico = useMutation({
        mutationFn: async ({ nombre, categoria }: { nombre: string; categoria: CategoriaTecnico }) => {
            const { error } = await supabase.from('config_tecnicos').insert([{ nombre, categoria }]);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['config_tecnicos'] }),
    });

    const updateTecnico = useMutation({
        mutationFn: async ({ id, nombre, categoria, activo }: Partial<ConfigTecnico> & { id: string }) => {
            const updates: any = {};
            if (nombre !== undefined) updates.nombre = nombre;
            if (categoria !== undefined) updates.categoria = categoria;
            if (activo !== undefined) updates.activo = activo;
            const { error } = await supabase.from('config_tecnicos').update(updates).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['config_tecnicos'] }),
    });

    const deleteTecnico = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('config_tecnicos').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['config_tecnicos'] }),
    });

    // Helpers
    const tecnicosPorCategoria = (cat: CategoriaTecnico) => safeTecnicos.filter(t => t.categoria === cat && t.activo);

    return { tecnicos: safeTecnicos, isLoading, addTecnico, updateTecnico, deleteTecnico, tecnicosPorCategoria };
}

// ─── TRENES PARQUE ───────────────────────────────────
export function useConfigTrenes() {
    const queryClient = useQueryClient();

    const { user } = useAuth();
    const { data: trenes = [], isLoading } = useQuery({
        queryKey: ['config_trenes', user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('config_trenes')
                .select('*')
                .order('numero', { ascending: true });
            if (error) {
                console.error('Error fetching config_trenes:', error);
                throw error;
            }
            return (data || []) as ConfigTren[];
        },
        enabled: !!user,
    });

    const safeTrenes = trenes || [];

    const addTren = useMutation({
        mutationFn: async ({ numero, modelo }: { numero: string; modelo: string }) => {
            const { error } = await supabase.from('config_trenes').insert([{ numero, modelo }]);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['config_trenes'] }),
    });

    const updateTren = useMutation({
        mutationFn: async ({ id, numero, modelo, activo }: Partial<ConfigTren> & { id: string }) => {
            const updates: any = {};
            if (numero !== undefined) updates.numero = numero;
            if (modelo !== undefined) updates.modelo = modelo;
            if (activo !== undefined) updates.activo = activo;
            const { error } = await supabase.from('config_trenes').update(updates).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['config_trenes'] }),
    });

    const deleteTren = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('config_trenes').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['config_trenes'] }),
    });

    return { trenes: safeTrenes, isLoading, addTren, updateTren, deleteTren };
}
