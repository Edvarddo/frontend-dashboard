import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import axios from 'axios';
import { set } from 'date-fns';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [validCredentials, setValidCredentials] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [autoProgress, setAutoProgress] = useState(0);
  const navigate = useNavigate();
  const {
    setAuthToken,
    authToken,
    setIsAdmin,
    login,
    setUserId,
    refreshToken,
    userId,
    setNombre,
    setRol,
    setDepartamento,
    setDepartamentoId,
    authMessage,
  } = useAuth();
  const [data, setData] = useState(null);
  const [roleError, setRoleError] = useState("");


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

    const isValid = password && (rut && rut.length === 12);
    if (!isValid) {
      setLoginLoading(false);
      return;
    }

    try {
      // 1) Pedir token
      const { data } = await axios.post(
        `${import.meta.env.VITE_URL_PROD_VERCEL}token/`,
        {
          rut: rut.replace(/\./g, ""),
          password: password,
        }
      );

      console.log("Login response:", data);

      const { access, refresh, es_administrador, id } = data;

      // 2) Pedir detalles de usuario
      const userRes = await axios.get(
        `${import.meta.env.VITE_URL_PROD_VERCEL}usuarios/${id}/`,
        { headers: { Authorization: `Bearer ${access}` } }
      );

      const user = userRes.data;
      console.log("User details:", user);

      const tipoUsuario = user.tipo_usuario?.toLowerCase?.() || "";

      // 3) Si es VECINO → NO login, mostrar mensaje y resetear campos
      if (tipoUsuario === "vecino") {
        setRoleError(
          "Tu usuario está registrado como 'vecino', por lo que no tienes permisos para acceder al Dashboard Municipal. Si eres funcionario municipal, solicita al administrador que actualice tu tipo de usuario."
        );
        setLoginLoading(false);
        setRut("");
        setPassword("");
        return;
      }

      // 4) Si NO es vecino → login normal
      login(access, refresh, es_administrador);

      // Guardar datos en contexto y localStorage
      setUserId(user.id);
      setNombre(user.nombre);
      setRol(user.tipo_usuario);
      setDepartamento(user.departamento_asignado?.nombre);
      setDepartamentoId(user.departamento_asignado?.id);

      localStorage.setItem("userId", user.id);
      localStorage.setItem("nombre", user.nombre);
      localStorage.setItem("rol", user.tipo_usuario);
      localStorage.setItem("departamento", user.departamento_asignado?.nombre || "");
      localStorage.setItem("departamentoId", user.departamento_asignado?.id || "");

      setValidCredentials(true);
      setLoginLoading(false);
      setRut("");
      setPassword("");

      // si es administrador → dashboard
      if (es_administrador) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error en login:", error);
      setLoginLoading(false);

      // Credenciales incorrectas
      if (error.response?.status === 401) {
        setValidCredentials(false);
      } else {
        setRoleError("Ocurrió un error al intentar iniciar sesión. Intenta nuevamente.");
      }
    }

    console.log(authToken, userId);
  };


  const handleEnterDashboard = () => {
    // console.log(refreshToken)
    navigate('/dashboard');
  };

  const handleRetryLogin = () => {
    setRut('');
    setPassword('');
    navigate('/');
  };

  const verifyTokenFormat = (token) => {

    const tokenArray = token?.split('.');
    console.log(tokenArray)
    if (tokenArray?.length === 3) {
      return true;
    }
    return false;
  }
  const getUserDetails = async (userId, authToken) => {
    axios.get(`${import.meta.env.VITE_URL_PROD_VERCEL}usuarios/${userId}/`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    )
      .then((response) => {
        console.log('User details:', response.data);
        setUserId(response.data.id);
        setNombre(response.data.nombre);
        setRol(response.data.tipo_usuario);
        setDepartamento(response.data.departamento_asignado.nombre);
        setDepartamentoId(response.data.departamento_asignado.id);
        localStorage.setItem('userId', response.data.id);
        localStorage.setItem('nombre', response.data.nombre);
        localStorage.setItem('rol', response.data.tipo_usuario);
        localStorage.setItem('departamento', response.data.departamento_asignado.nombre);
        localStorage.setItem('departamentoId', response.data.departamento_asignado.id);
      })
      .catch((error) => {
        console.error('Error fetching user details:', error);
      });
  }
  useEffect(() => {
    // Solo activar el auto-redirect si hay token válido
    if (!(authToken && verifyTokenFormat(authToken))) return;

    setAutoProgress(0);
    const totalMs = 5000; // 5 segundos para redirigir
    const stepMs = 100;

    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += stepMs;
      const pct = Math.min((elapsed / totalMs) * 100, 100);
      setAutoProgress(pct);

      if (elapsed >= totalMs) {
        clearInterval(interval);
        navigate('/dashboard'); // mismo handler que tu botón
      }
    }, stepMs);

    return () => clearInterval(interval);
  }, [authToken, navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-white ">
      {(authToken && verifyTokenFormat(authToken)) ? (
        <div className="w-full max-w-2xl">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="relative border border-gray-200 rounded-2xl p-8 md:p-12 shadow-lg bg-white">
              {/* Top decorative element */}
              <div className="flex justify-center mb-8">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 bg-green-500 rounded-full opacity-10 blur-lg animate-pulse"></div>
                  <div className="relative flex items-center justify-center w-full h-full bg-green-500 rounded-full">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                </div>
              </div>

              {/* Main heading */}
              <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-3">
                ¡Bienvenido de vuelta!
              </h1>

              {/* Subheading */}
              <p className="text-center text-gray-600 text-lg md:text-xl mb-8 max-w-xl mx-auto leading-relaxed">
                Tu sesión ha sido iniciada correctamente. Acceso total al Dashboard Municipal.
              </p>

              {/* Status indicators */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-xs text-gray-600 text-center">Autenticación</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-2">
                    <Zap className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-xs text-gray-600 text-center">Sistema Activo</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-xs text-gray-600 text-center">Datos Listos</span>
                </div>
              </div>

              {/* Barra de carga + info */}
              <div className="space-y-3 mb-6">
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-100"
                    style={{ width: `${autoProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Redirigiendo automáticamente al dashboard…
                </p>
              </div>

              {/* CTA Button opcional (acceso inmediato) */}
              <button
                onClick={handleEnterDashboard}
                className="w-full group relative overflow-hidden rounded-xl bg-green-600 p-1 transition-all duration-300 hover:shadow-md hover:shadow-green-600/30"
              >
                <div className="relative bg-green-600 rounded-[10px] px-6 py-3 flex items-center justify-center gap-2 group-hover:bg-green-700 transition-colors">
                  <span className="text-white font-semibold">Ir ahora al Dashboard</span>
                  <ArrowRight className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Texto de apoyo */}
              <p className="text-center text-gray-500 text-sm mt-4">
                Si no haces nada, te redirigiremos automáticamente.
              </p>
            </div>
          </div>

          {/* Tres puntos con pulse y desfase */}
          <div className="mt-8 flex justify-center gap-3">
            <span
              className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"
              style={{ animationDelay: '0s' }}
            />
            <span
              className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"
              style={{ animationDelay: '0.25s' }}
            />
            <span
              className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"
              style={{ animationDelay: '0.5s' }}
            />
          </div>
        </div>
      ) : (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-amber-50 via-orange-50 to-emerald-50 px-6 relative">

          {/* Fondos decorativos suaves */}
          <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_top,_#f97316_0,_transparent_60%),_radial-gradient(circle_at_bottom,_#22c55e_0,_transparent_60%)]" />

          {/* CARD grande centrada */}
          <Card className="relative w-full max-w-lg backdrop-blur-md bg-white/80 border border-white/40 shadow-2xl rounded-3xl">

            <CardHeader className="space-y-6 pt-10 pb-4 px-10 text-center">

              {/* Logo con glow */}
              <div className="mx-auto w-32 h-32 relative mb-2">
                <div className="absolute inset-0 bg-emerald-400/25 rounded-full blur-xl" />
                <img
                  src="https://www.municipalidadcalama.cl/resources/img/logotipo.png"
                  alt="Municipalidad de Calama"
                  className="object-contain w-full h-full relative"
                />
              </div>

              {/* Títulos */}
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

              {/* Mensaje verde */}
              {authMessage && (
                <div className="p-4 rounded-xl border border-green-200 bg-green-50 flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <p className="text-sm text-green-800">{authMessage}</p>
                </div>
              )}

              {/* Mensaje VECINO */}
              {roleError && (
                <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <p className="text-sm text-amber-800">{roleError}</p>
                </div>
              )}

              {/* FORMULARIO */}
              <form onSubmit={handleLogin} className="space-y-6">

                {/* RUT */}
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
                    minLength={12}
                    required
                    className="h-12 text-base bg-white/70 border-slate-300"
                  />
                </div>

                {/* PASSWORD */}
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

                {/* Credenciales incorrectas */}
                {!validCredentials && (
                  <div className="text-red-500 text-sm flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>RUT o contraseña incorrecta.</span>
                  </div>
                )}

                {/* BOTÓN */}
                <Button
                  type="submit"
                  className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl mt-2"
                  disabled={!password || !(rut && rut.length === 12) || loginLoading}
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
