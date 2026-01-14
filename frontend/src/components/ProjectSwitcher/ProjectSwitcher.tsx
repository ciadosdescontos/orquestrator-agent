import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Clock, Star, FolderOpen, Search, Brain, X, Command } from 'lucide-react';
import { Project } from '../../types';
import { getRecentProjects, quickSwitchProject, toggleFavorite } from '../../api/projects';
import { ExpertsModal } from '../ExpertsModal';
import styles from './ProjectSwitcher.module.css';

interface ProjectSwitcherProps {
  currentProject: Project | null;
  onProjectSwitch: (project: Project) => void;
}

export function ProjectSwitcher({ currentProject, onProjectSwitch }: ProjectSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'recent' | 'favorites'>('recent');
  const [showExpertsModal, setShowExpertsModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Cmd+K / Ctrl+K to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      loadProjects();
      setFilter('');
      setSelectedIndex(0);
      // Small delay to ensure the DOM is ready
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, activeTab]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const projectList = await getRecentProjects(activeTab);
      setProjects(projectList);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = async (project: Project) => {
    // Verifica se é o mesmo projeto já carregado
    if (currentProject?.path === project.path) {
      console.log('[ProjectSwitcher] Project already loaded, skipping reload');
      setIsOpen(false);
      return;
    }

    try {
      const loaded = await quickSwitchProject(project.path);
      onProjectSwitch(loaded);
      setIsOpen(false);

      // Adiciona um pequeno delay para garantir que o estado foi salvo
      // antes de fazer o reload completo da página
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('[ProjectSwitcher] Failed to switch project:', error);
      // Mantém o dropdown aberto em caso de erro
    }
  };

  const handleToggleFavorite = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleFavorite(project.id);
      await loadProjects();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase()) ||
    p.path.toLowerCase().includes(filter.toLowerCase())
  );

  // Reset selected index when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filter]);

  // Keyboard navigation within the list
  const handleKeyNavigation = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredProjects.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredProjects[selectedIndex]) {
      e.preventDefault();
      handleProjectSelect(filteredProjects[selectedIndex]);
    }
  }, [filteredProjects, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && filteredProjects.length > 0) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex, filteredProjects.length]);

  // Modal content rendered via Portal
  const modalContent = isOpen && createPortal(
    <div className={styles.modalOverlay} onClick={() => setIsOpen(false)}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyNavigation}
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <FolderOpen size={20} />
            <span>Trocar Projeto</span>
          </div>
          <div className={styles.modalShortcut}>
            <Command size={12} />
            <span>K</span>
          </div>
          <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className={styles.modalSearch}>
          <Search size={18} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar projeto por nome ou caminho..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            onKeyDown={handleKeyNavigation}
          />
        </div>

        {/* Tabs */}
        <div className={styles.modalTabs}>
          <button
            className={activeTab === 'recent' ? styles.activeTab : ''}
            onClick={() => setActiveTab('recent')}
          >
            <Clock size={16} />
            Recentes
          </button>
          <button
            className={activeTab === 'favorites' ? styles.activeTab : ''}
            onClick={() => setActiveTab('favorites')}
          >
            <Star size={16} />
            Favoritos
          </button>
          <button
            className={styles.expertsTab}
            onClick={() => {
              setShowExpertsModal(true);
              setIsOpen(false);
            }}
          >
            <Brain size={16} />
            Experts
          </button>
        </div>

        {/* Project List */}
        <div className={styles.modalList} ref={listRef}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <span>Carregando projetos...</span>
            </div>
          ) : filteredProjects.length > 0 ? (
            filteredProjects.map((project, index) => (
              <div
                key={project.id}
                className={`${styles.projectRow} ${project.id === currentProject?.id ? styles.currentProject : ''} ${index === selectedIndex ? styles.selectedProject : ''}`}
                onClick={() => handleProjectSelect(project)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className={styles.projectDetails}>
                  <div className={styles.projectNameRow}>
                    <span className={styles.projectNameText}>{project.name}</span>
                    {project.hasClaudeConfig && (
                      <span className={styles.claudeBadge}>.claude</span>
                    )}
                  </div>
                  <div className={styles.projectPathText}>{project.path}</div>
                </div>
                <div className={styles.projectActions}>
                  {project.id === currentProject?.id && (
                    <span className={styles.currentBadge}>Ativo</span>
                  )}
                  <button
                    className={`${styles.favButton} ${project.isFavorite ? styles.isFavorite : ''}`}
                    onClick={(e) => handleToggleFavorite(project, e)}
                  >
                    <Star size={16} fill={project.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <FolderOpen size={32} />
              <span>Nenhum projeto {activeTab === 'recent' ? 'recente' : 'favorito'} encontrado</span>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className={styles.modalFooter}>
          <span><kbd>↑↓</kbd> navegar</span>
          <span><kbd>Enter</kbd> selecionar</span>
          <span><kbd>Esc</kbd> fechar</span>
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      <button
        className={styles.triggerButton}
        onClick={() => setIsOpen(!isOpen)}
        title="Trocar projeto (Cmd+K)"
      >
        <FolderOpen size={18} />
        <span className={styles.triggerText}>{currentProject?.name || 'Nenhum projeto'}</span>
        <div className={styles.triggerShortcut}>
          <Command size={10} />
          <span>K</span>
        </div>
      </button>

      {modalContent}

      <ExpertsModal
        isOpen={showExpertsModal}
        onClose={() => setShowExpertsModal(false)}
      />
    </>
  );
}
