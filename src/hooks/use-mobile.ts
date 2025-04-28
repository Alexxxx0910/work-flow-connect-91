
import { useState, useEffect } from 'react';

export const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Verificar tamaño inicial
    const checkSize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Ejecutar al cargar y al cambiar tamaño
    checkSize();
    window.addEventListener('resize', checkSize);
    
    // Limpiar listener
    return () => window.removeEventListener('resize', checkSize);
  }, [breakpoint]);

  return isMobile;
};
