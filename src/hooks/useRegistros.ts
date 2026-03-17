'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { RegistroTren } from '@/types/database';

export function useRegistros() {
    const queryClient = useQueryClient();

    const { user } = useAuth();
    const { data: registros = [], isLoading, error } = useQuery({
        queryKey: ['registros', user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('trenes_registros')
                .select('*')
                .order('fecha_hora_entrada', { ascending: false });

            if (error) throw error;
            return data as RegistroTren[];
        },
        enabled: !!user, // Only fetch if user is logged in
    });

    useEffect(() => {
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'trenes_registros',
                },
                (payload) => {
                    console.log('Real-time event received:', payload);
                    queryClient.invalidateQueries({ queryKey: ['registros'] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    return { registros, isLoading, error };
}

export function useTecnicos() {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['tecnicos', user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('tecnicos')
                .select('*')
                .eq('activo', true)
                .order('nombre_completo', { ascending: true });

            if (error) throw error;
            return data;
        },
        enabled: !!user,
    });
}
