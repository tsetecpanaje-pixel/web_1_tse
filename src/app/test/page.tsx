'use client';

import Link from 'next/link';

export default function TestAdminPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-black mb-4">PÁGINA DE ADMIN</h1>
        <p className="text-muted-foreground mb-8">Si ves esto, la ruta /admin funciona correctamente</p>
        <Link href="/" className="text-primary hover:underline">
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}
