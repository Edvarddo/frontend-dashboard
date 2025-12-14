import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"



export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export const categoryColors = {
  "Seguridad": "#FF6B6B",
  "Basura": "#4ECDC4",
  "Áreas verdes": "#45B7D1",
  "Asistencia Social": "#FFA07A",
  "Mantención de Calles": "#A0522D",
  "Señales de tránsito": "#F06292",
  "Semáforos": "#FFD700",
  "Escombros": "#98D8C8",
  "Comercio ilegal": "#BA68C8",
  "Construcción irregular": "#FF8C00",
  "Contaminación": "#20B2AA",
  "Otro fuera de clasificación": "#778899"
};

export const getColorForCategory = (category) => {
  return categoryColors[category] || "#778899";
};

export const chartColors = Object.values(categoryColors);


// ========================= RUT Validation and Cleaning =======================

export function limpiarRut(rut) {
  return rut.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase();
}

export function calcularDigitoVerificador(rutNumerico) {
  let suma = 0;
  let multiplicador = 2;

  // Recorremos de derecha a izquierda
  for (let i = rutNumerico.length - 1; i >= 0; i--) {
    suma += parseInt(rutNumerico[i], 10) * multiplicador;
    multiplicador++;
    if (multiplicador > 7) multiplicador = 2;
  }

  const resto = suma % 11;
  const dvCalculado = 11 - resto;

  if (dvCalculado === 11) return '0';
  if (dvCalculado === 10) return 'K';
  return String(dvCalculado);
}


export function verificarRut(rutCompleto) {
  const rutLimpio = limpiarRut(rutCompleto);

  if (!/^\d+[-]?[0-9K]$/i.test(rutLimpio)) return false;

  // separar número y DV
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1).toUpperCase();

  const dvOk = calcularDigitoVerificador(cuerpo);
  return dv === dvOk;
}