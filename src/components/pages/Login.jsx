import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

// import AuthContext from '../../contexts/AuthContext';
import useAuth from '../../hooks/useAuth';

import axios from 'axios';
// use history

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [validCredentials, setValidCredentials] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuthToken, authToken, setIsAdmin, login } = useAuth();


  // Formato de RUT mientras el usuario escribe (XX.XXX.XXX-X)
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
    setLoginLoading(true);
    e.preventDefault();
    const isValid = password && (rut && rut.length === 12);
    if (!isValid) return;
    axios.post(import.meta.env.VITE_URL_PROD_VERCEL + 'token/',
      {
        rut: rut.replace(/\./g, ''),
        password: password
      }
    )
      .then((response) => {

        console.log(response);
        // localStorage.setItem('authToken', response.data.access);
        // setAuthToken(response.data.access);
        login(response.data.access);
        setIsAdmin(response.data.es_administrador);
        setLoginLoading(false);
        if (response.data.es_administrador) navigate('/listado-publicaciones');

        setRut('');
        setPassword('');
      })
      .catch((error) => {
        console.error(error);
        setValidCredentials(false);
        setLoginLoading(false);
      });


  }




  // useEffect(() => {
  //   const verifyTokenFormat = (token) => {
  //     const tokenArray = token?.split('.');
  //     console.log(tokenArray)
  //     if (tokenArray?.length !== 3) {
  //       return false;
  //     }
  //     return true;
  //   }
  //   const isTokenValid = verifyTokenFormat(authToken);
  //   console.log(isTokenValid)
  //   console.log(authToken)
  //   if (authToken && isTokenValid) {
  //     navigate('/listado-publicaciones')
  //     console.log("aaaaaaaaaaaaaaa2")
  //   } else {
  //     navigate('/')
  //     console.log("aaaaaaaaaaaaaaa")
  //   }

  // }, [authToken])


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
          <form className="space-y-4">
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
            {/* feedback if error */}
            {
              !validCredentials && (
                <div className="text-red-500 text-sm">* Rut o contraseña incorrecta</div>
              )
            }

            <Button
              onClick={handleLogin}
              disabled={
                !password ||
                !(rut && rut.length === 12)
              }
              type="submit" className={`w-full  `}

            >


              {
                loginLoading ?
                  (
                    <>
                      Cargando
                      <Spinner size="small" className={``} />
                    </>
                  ) :
                  (<span>Iniciar Sesión</span>)
              }

            </Button>
          </form>
          <div className="mt-4 text-center">
            <a href="#" className="text-sm text-primary hover:underline">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
