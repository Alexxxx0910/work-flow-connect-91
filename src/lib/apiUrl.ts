
// Configuración de la URL de la API
// En desarrollo puede ser http://localhost:5000
// En producción debemos usar mock data o una API real accesible

// Determinar si estamos en producción o desarrollo
const isProduction = import.meta.env.PROD;

// URL base de la API
export const API_URL = isProduction 
  ? "/api" // Para producción usaremos rutas relativas o ajustar a una URL real
  : "http://localhost:5000/api";

// Flag para usar datos mock
export const USE_MOCK_DATA = isProduction || true; // Siempre usar mock data por ahora
