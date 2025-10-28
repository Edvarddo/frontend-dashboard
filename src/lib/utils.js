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


