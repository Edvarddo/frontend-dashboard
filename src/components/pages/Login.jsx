import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import axios from 'axios';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [validCredentials, setValidCredentials] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuthToken, authToken, setIsAdmin, login, setUserId, refreshToken } = useAuth();

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

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginLoading(true);
    const isValid = password && (rut && rut.length === 12);
    if (!isValid) {
      setLoginLoading(false);
      return;
    }
    axios.post(`${import.meta.env.VITE_URL_PROD_VERCEL}token/`, {
      rut: rut.replace(/\./g, ''),
      password: password
    })
      .then((response) => {
        console.log(response);
        
        login(response.data.access, response.data.refresh,response.data.es_administrador);
        
        setLoginLoading(false);
        if (response.data.es_administrador) navigate('/dashboard');
        setRut('');
        setPassword('');
      })
      .catch((error) => {
        console.error(error);
        setValidCredentials(false);
        setLoginLoading(false);
      });
  };

  const handleEnterDashboard = () => {
    // console.log(refreshToken)
    navigate('/dashboard');
  };
  const verifyTokenFormat = (token) => {
    
    const tokenArray = token?.split('.');
    console.log(tokenArray)
    if (tokenArray?.length === 3) {
      return true;
    }
    return false;
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-sky-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <div className="mx-auto w-32 h-32 relative">
            <img
              src="https://www.municipalidadcalama.cl/resources/img/logotipo.png"
              alt="Municipalidad de Calama"
              className="object-contain w-full h-full"
            />
          </div>
          <h1 className="text-2xl font-bold text-center text-primary">
            Dashboard Municipal
          </h1>
          <p className="text-center text-muted-foreground">
            Tierra de Sol y Cobre
          </p>
        </CardHeader>
        <CardContent>
          {(authToken && verifyTokenFormat(authToken)) ? (
            <div className="space-y-4 text-center">
              <h2 className="text-xl font-semibold">Bienvenido</h2>
              <p>Ya has iniciado sesión.</p>
              <Button onClick={handleEnterDashboard} className="w-full">
                Ingresar al Dashboard
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rut">RUT</Label>
                <Input
                  id="rut"
                  type="text"
                  placeholder="12.345.678-9"
                  value={rut}
                  onChange={handleRutChange}
                  maxLength={12}
                  minLength={12}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">
                      {showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    </span>
                  </Button>
                </div>
              </div>
              {!validCredentials && (
                <div className="text-red-500 text-sm">* Rut o contraseña incorrecta</div>
              )}
              <Button
                type="submit"
                className="w-full  bg-green-500 hover:bg-green-600 text-white "
                disabled={!password || !(rut && rut.length === 12) || loginLoading}
              >
                {loginLoading ? (
                  <>
                    Cargando
                    <Spinner size="small" className="ml-2" />
                  </>
                ) : (
                  <span>Iniciar Sesión</span>
                )}
              </Button>
            </form>
          )}
          {/* {!authToken && (
            <div className="mt-4 text-center">
              <a href="#" className="text-sm text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          )} */}
        </CardContent>
      </Card>
    </div>
  );
}

