'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Train, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, User, Loader2 } from 'lucide-react';

type Mode = 'login' | 'register' | 'reset';

export default function AuthForm() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else if (mode === 'register') {
        if (password !== confirmPassword) {
          throw new Error('Las contraseñas no coinciden');
        }
        if (password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres');
        }
        if (!nombre.trim()) {
          throw new Error('El nombre es obligatorio');
        }
        const { error } = await signUp(email, password, nombre.trim());
        if (error) throw error;
        setSuccessMessage('¡Registro exitoso! Por favor revisa tu correo para confirmar tu cuenta.');
        setEmail('');
        setNombre('');
        setPassword('');
        setConfirmPassword('');
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setSuccessMessage('Se ha enviado un correo para restablecer tu contraseña.');
        setEmail('');
      }
    } catch (err: any) {
      setError(err.message || 'Ha ocurrido un error');
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setEmail('');
    setNombre('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccessMessage(null);
  };

  // Asegurar que el formulario esté limpio al montar el componente
  useEffect(() => {
    setEmail('');
    setNombre('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccessMessage(null);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background p-4 transition-colors duration-500">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 mb-4 drop-shadow-2xl">
            <img src="/SGT_01.png" alt="SGT_01" className="w-full h-full object-contain dark:brightness-125 select-none pointer-events-none drop-shadow-2xl transition-all" />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">
            TALLER LÍNEA 5
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            {mode === 'login' && 'Ingresa a tu cuenta'}
            {mode === 'register' && 'Crea una nueva cuenta'}
            {mode === 'reset' && 'Restablece tu contraseña'}
          </p>
        </div>

        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:bg-primary/10 transition-colors" />
          
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm animate-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm animate-in slide-in-from-top-1">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                {successMessage}
              </div>
            )}

            {mode !== 'reset' && (
              <div className="space-y-5">
                {mode === 'register' && (
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2 px-1">
                      Nombre completo
                    </label>
                    <div className="relative group/input">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-muted/30 border border-border rounded-2xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-inner"
                        placeholder="Tu nombre completo"
                        required={mode === 'register'}
                        autoComplete="name"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2 px-1">
                    Correo electrónico
                  </label>
                  <div className="relative group/input">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-muted/30 border border-border rounded-2xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-inner"
                      placeholder="correo@ejemplo.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>
              </div>
            )}

            {mode === 'reset' && (
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-2 px-1">
                  Correo electrónico
                </label>
                <div className="relative group/input">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-muted/30 border border-border rounded-2xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-inner"
                    placeholder="correo@ejemplo.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
            )}

            {mode !== 'reset' && (
              <>
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2 px-1">
                    Contraseña
                  </label>
                  <div className="relative group/input">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3.5 bg-muted/30 border border-border rounded-2xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-inner"
                      placeholder="••••••••"
                      required
                      minLength={6}
                      autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2 px-1">
                      Confirmar contraseña
                    </label>
                    <div className="relative group/input">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-muted/30 border border-border rounded-2xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-inner"
                        placeholder="••••••••"
                        required
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-black uppercase tracking-widest rounded-2xl transition-all hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando...
                </span>
              ) : (
                <>
                  {mode === 'login' && 'Iniciar sesión'}
                  {mode === 'register' && 'Crear cuenta'}
                  {mode === 'reset' && 'Recuperar acceso'}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 space-y-6 relative z-10">
            {mode === 'login' && (
              <button
                onClick={() => handleModeChange('reset')}
                className="w-full text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}

            {mode === 'reset' && (
              <button
                onClick={() => handleModeChange('login')}
                className="w-full text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
              >
                Volver a iniciar sesión
              </button>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase font-black tracking-widest">
                <span className="px-3 bg-card text-muted-foreground/40">
                  O
                </span>
              </div>
            </div>

            <button
              onClick={() => handleModeChange(mode === 'login' ? 'register' : 'login')}
              className="w-full py-3 px-4 border-2 border-border hover:border-primary/50 text-foreground font-bold rounded-2xl transition-all hover:bg-muted/50"
            >
              {mode === 'login' ? 'CREAR UNA CUENTA' : 'YA TENGO CUENTA'}
            </button>
          </div>
        </div>

        <p className="hidden sm:block text-center text-muted-foreground/40 text-[10px] font-black uppercase tracking-[0.2em] mt-8">
          SISTEMA GESTIÓN DE TRENES • TALLER LÍNEA 5
        </p>
      </div>
    </div>
  );
}
