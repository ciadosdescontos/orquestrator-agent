import { useEffect, RefObject } from 'react';

/**
 * Hook para detectar cliques fora de um elemento
 * Útil para fechar dropdowns, modals, tooltips, etc.
 */
export function useClickOutside(
  ref: RefObject<HTMLElement>,
  handler: () => void
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler]);
}
