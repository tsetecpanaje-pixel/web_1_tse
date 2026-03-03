export type TipoAtencion = 'Avería' | 'Mantenimiento Preventivo' | 'O. Especial' | 'Evacuación' | 'Lavado' | 'Estacionado' | 'Otro';

export type LugarDestino = 'Foso 1' | 'Foso 2' | 'Foso 3' | 'Foso 4' | 'Foso 5' | 'Foso 6' | 'Nave Lavado' | 'Vía Prueba' | 'FV VV' | 'FV PM' | 'Cochera G14-1' | 'Cochera G14-2' | 'Cochera';

export type MiniFiltros = 'MIT/MIF' | 'Puertas' | 'OR' | 'CVS / NCB' | 'Neumáticos' | 'PA' | 'Humo' | 'Otros';

export interface RegistroTren {
    id: string;
    tren: string;
    fecha_hora_entrada: string;
    fecha_hora_salida?: string;
    tipo_atencion: TipoAtencion;
    lugar_destino: LugarDestino;
    motivo_trabajo: string;
    mini_filtros?: MiniFiltros;
    observacion?: string;
    solucion?: string;
    tecnicos_involucrados: string[];
    disponible: boolean;
    created_at: string;
    updated_at: string;
}

export interface Tecnico {
    id: string;
    nombre_completo: string;
    activo: boolean;
    created_at: string;
}
