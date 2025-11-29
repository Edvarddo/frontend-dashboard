import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth'; // Asegúrate que la ruta es correcta
import axios from 'axios';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [validCredentials, setValidCredentials] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [autoProgress, setAutoProgress] = useState(0);
  const [roleError, setRoleError] = useState("");

  const navigate = useNavigate();

  const {
    authToken,
    login, // Usamos la nueva función login optimizada del contexto
    authMessage,
  } = useAuth();

  // Formateador de RUT
  const formatRut = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 1) return cleaned;
    let formatted = cleaned.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    return formatted + '-' + cleaned.slice(-1);
  };

  const handleRutChange = (e) => {
    const value = e.target.value.replace(/[^\d\-kK]/g, '');
    setRut(formatRut(value));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setValidCredentials(true);
    setRoleError("");

    const isValid = password && (rut && rut.length >= 11); // Validación básica
    if (!isValid) {
      setLoginLoading(false);
      return;
    }

    try {
      // 1) Solicitar token al backend (Ahora retorna datos completos)
      const { data } = await axios.post(
        `${import.meta.env.VITE_URL_PROD_VERCEL}token/`,
        {
          rut: rut.replace(/\./g, ""), // Enviar RUT limpio sin puntos
          password: password,
        }
      );

      console.log("Login response:", data);

      // Desestructurar la nueva respuesta enriquecida
      const {
        access,
        refresh,
        id,
        es_administrador,
        tipo_usuario,
        nombre,
        departamento_asignado
      } = data;

      const tipoUsuarioStr = tipo_usuario?.toLowerCase?.() || "";

      // 2) Validación de Rol (Bloquear vecinos)
      if (tipoUsuarioStr === "vecino") {
        setRoleError(
          "Tu usuario está registrado como 'vecino', por lo que no tienes permisos para acceder al Dashboard Municipal. Si eres funcionario municipal, solicita al administrador que actualice tu tipo de usuario."
        );
        setLoginLoading(false);
        setRut("");
        setPassword("");
        return;
      }

      // 3) Login en Contexto (Sin segunda llamada API)
      // Preparamos el objeto de datos de usuario para el contexto
      // Nota: Verificamos si departamento_asignado es objeto o string
      let departamentoObj = null;
      if (departamento_asignado && typeof departamento_asignado === 'object') {
        departamentoObj = departamento_asignado;
      } else if (departamento_asignado && departamento_asignado !== "No aplica") {
        // Si por alguna razón llega como string pero no es "No aplica", lo intentamos adaptar
        departamentoObj = { nombre: departamento_asignado, id: null };
      }

      const userData = {
        id: id,
        es_administrador: es_administrador,
        nombre: nombre,
        rol: tipo_usuario,
        departamento: departamentoObj // Pasamos el objeto o null
      };

      login(access, refresh, userData);

      setValidCredentials(true);
      setLoginLoading(false);
      setRut("");
      setPassword("");

      // Redirección inmediata si es administrador (opcional, ya que el efecto de abajo también redirige)
      if (es_administrador) {
        navigate("/dashboard");
      }

    } catch (error) {
      console.error("Error en login:", error);
      setLoginLoading(false);

      if (error.response?.status === 401) {
        setValidCredentials(false);
      } else {
        setRoleError("Ocurrió un error al intentar iniciar sesión. Intenta nuevamente.");
      }
    }
  };

  const handleEnterDashboard = () => {
    navigate('/dashboard');
  };

  const verifyTokenFormat = (token) => {
    const tokenArray = token?.split('.');
    return tokenArray?.length === 3;
  }

  // Efecto para redirección automática tras login exitoso
  useEffect(() => {
    if (!(authToken && verifyTokenFormat(authToken))) return;

    setAutoProgress(0);
    const totalMs = 1500; // Reducido a 1.5s para UX más ágil
    const stepMs = 50;

    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += stepMs;
      const pct = Math.min((elapsed / totalMs) * 100, 100);
      setAutoProgress(pct);

      if (elapsed >= totalMs) {
        clearInterval(interval);
        navigate('/dashboard');
      }
    }, stepMs);

    return () => clearInterval(interval);
  }, [authToken, navigate]);

  // --- RENDERIZADO (Sin cambios visuales mayores) ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-white ">
      {(authToken && verifyTokenFormat(authToken)) ? (
        <div className="w-full max-w-2xl">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="relative border border-gray-200 rounded-2xl p-8 md:p-12 shadow-lg bg-white">
              {/* Animación de éxito */}
              <div className="flex justify-center mb-8">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 bg-green-500 rounded-full opacity-10 blur-lg animate-pulse"></div>
                  <div className="relative flex items-center justify-center w-full h-full bg-green-500 rounded-full">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-3">
                ¡Bienvenido de vuelta!
              </h1>
              <p className="text-center text-gray-600 text-lg md:text-xl mb-8 max-w-xl mx-auto leading-relaxed">
                Tu sesión ha sido iniciada correctamente.
              </p>

              {/* Barra de progreso */}
              <div className="space-y-3 mb-6">
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-100"
                    style={{ width: `${autoProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Redirigiendo al dashboard...
                </p>
              </div>

              <button
                onClick={handleEnterDashboard}
                className="w-full group relative overflow-hidden rounded-xl bg-green-600 p-1 transition-all duration-300 hover:shadow-md hover:shadow-green-600/30"
              >
                <div className="relative bg-green-600 rounded-[10px] px-6 py-3 flex items-center justify-center gap-2 group-hover:bg-green-700 transition-colors">
                  <span className="text-white font-semibold">Ir ahora al Dashboard</span>
                  <ArrowRight className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-amber-50 via-orange-50 to-emerald-50 px-6 relative">
          <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_top,_#f97316_0,_transparent_60%),_radial-gradient(circle_at_bottom,_#22c55e_0,_transparent_60%)]" />

          <Card className="relative w-full max-w-lg backdrop-blur-md bg-white/80 border border-white/40 shadow-2xl rounded-3xl">
            <CardHeader className="space-y-6 pt-10 pb-4 px-10 text-center">
              <div className="mx-auto w-32 h-32 relative mb-2">
                <div className="absolute inset-0 bg-emerald-400/25 rounded-full blur-xl" />
                <img
                  src="https://www.municipalidadcalama.cl/resources/img/logotipo.png"
                  alt="Municipalidad de Calama"
                  className="object-contain w-full h-full relative"
                />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Dashboard Municipal
              </h1>
              <p className="text-sm uppercase tracking-[0.3em] text-amber-600">
                Tierra de Sol y Cobre
              </p>
              <p className="text-base text-muted-foreground">
                Inicia sesión con tu cuenta institucional.
              </p>
            </CardHeader>

            <CardContent className="px-10 pb-10 space-y-6">
              {authMessage && (
                <div className="p-4 rounded-xl border border-green-200 bg-green-50 flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <p className="text-sm text-green-800">{authMessage}</p>
                </div>
              )}

              {roleError && (
                <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <p className="text-sm text-amber-800">{roleError}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="rut" className="text-sm font-medium text-slate-700">
                    RUT
                  </Label>
                  <Input
                    id="rut"
                    type="text"
                    placeholder="12.345.678-9"
                    value={rut}
                    onChange={handleRutChange}
                    maxLength={12}
                    minLength={8}
                    required
                    className="h-12 text-base bg-white/70 border-slate-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 text-base bg-white/70 border-slate-300 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-4 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                {!validCredentials && (
                  <div className="text-red-500 text-sm flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>RUT o contraseña incorrecta.</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl mt-2"
                  disabled={!password || !rut || loginLoading}
                >
                  {loginLoading ? (
                    <>
                      Validando…
                      <Spinner size="small" className="ml-2" />
                    </>
                  ) : (
                    <span>Ingresar al sistema</span>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-2">
                  Acceso exclusivo para funcionarios municipales.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}