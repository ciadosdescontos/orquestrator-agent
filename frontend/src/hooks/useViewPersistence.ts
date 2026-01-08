import { useCallback } from 'react';
import { ModuleType } from '../types';

const VIEW_STORAGE_KEY = 'kanban_current_view';
const DEFAULT_VIEW: ModuleType = 'dashboard';

export const useViewPersistence = () => {
  // Recuperar view salva
  const getSavedView = useCallback((): ModuleType => {
    try {
      const saved = localStorage.getItem(VIEW_STORAGE_KEY);
      if (saved && ['dashboard', 'kanban', 'chat', 'settings'].includes(saved)) {
        return saved as ModuleType;
      }
    } catch (error) {
      console.error('Erro ao recuperar view:', error);
    }
    return DEFAULT_VIEW;
  }, []);

  // Salvar view atual
  const saveView = useCallback((view: ModuleType) => {
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, view);
    } catch (error) {
      console.error('Erro ao salvar view:', error);
    }
  }, []);

  // Limpar view salva (opcional)
  const clearSavedView = useCallback(() => {
    try {
      localStorage.removeItem(VIEW_STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao limpar view:', error);
    }
  }, []);

  return {
    getSavedView,
    saveView,
    clearSavedView,
  };
};
