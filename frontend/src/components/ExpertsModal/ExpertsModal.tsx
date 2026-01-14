import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Brain, Folder, Tag, Trash2, RefreshCw, Check, AlertCircle } from 'lucide-react';
import styles from './ExpertsModal.module.css';

interface ExpertSuggestion {
  id: string;
  name: string;
  keywords: string[];
  file_patterns: string[];
  detected: boolean;
}

interface ExpertConfig {
  name: string;
  keywords: string[];
  file_patterns: string[];
  created_at?: string;
}

interface ExpertsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AnalyzeResponse {
  success: boolean;
  is_orchestrator: boolean;
  project_path?: string;
  project_name?: string;
  message?: string;
  suggestions: ExpertSuggestion[];
}

interface StatusResponse {
  success: boolean;
  is_orchestrator: boolean;
  has_experts: boolean;
  experts: Record<string, ExpertConfig>;
}

export function ExpertsModal({ isOpen, onClose }: ExpertsModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOrchestrator, setIsOrchestrator] = useState(false);
  const [projectName, setProjectName] = useState<string>('');
  const [suggestions, setSuggestions] = useState<ExpertSuggestion[]>([]);
  const [existingExperts, setExistingExperts] = useState<Record<string, ExpertConfig>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Carregar status e sugestoes em paralelo
      const [statusRes, analyzeRes] = await Promise.all([
        fetch('/api/experts/status'),
        fetch('/api/experts/analyze')
      ]);

      const status: StatusResponse = await statusRes.json();
      const analyze: AnalyzeResponse = await analyzeRes.json();

      // Verificar se estamos no orquestrador
      if (status.is_orchestrator || analyze.is_orchestrator) {
        setIsOrchestrator(true);
        setExistingExperts(status.experts || {});
        setSuggestions([]);
        setProjectName('Orquestrador');
      } else {
        setIsOrchestrator(false);
        setExistingExperts(status.experts || {});
        setSuggestions(analyze.suggestions || []);
        setProjectName(analyze.project_name || '');

        // Pre-selecionar todas as sugestoes que nao existem ainda
        const newSuggestionIds = (analyze.suggestions || [])
          .filter((s: ExpertSuggestion) => !status.experts?.[s.id])
          .map((s: ExpertSuggestion) => s.id);
        setSelected(new Set(newSuggestionIds));
      }
    } catch (err) {
      console.error('Failed to load experts data:', err);
      setError('Falha ao carregar dados dos experts');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const handleCreate = async () => {
    if (selected.size === 0) return;

    setCreating(true);
    setError(null);

    try {
      const expertsToCreate = suggestions.filter(s => selected.has(s.id));

      const response = await fetch('/api/experts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experts: expertsToCreate })
      });

      if (!response.ok) {
        throw new Error('Failed to create experts');
      }

      // Recarregar dados
      await loadData();
    } catch (err) {
      console.error('Failed to create experts:', err);
      setError('Falha ao criar experts');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (expertId: string) => {
    setDeleting(expertId);
    setError(null);

    try {
      const response = await fetch(`/api/experts/${expertId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete expert');
      }

      // Recarregar dados
      await loadData();
    } catch (err) {
      console.error('Failed to delete expert:', err);
      setError('Falha ao remover expert');
    } finally {
      setDeleting(null);
    }
  };

  if (!isOpen) return null;

  const hasExistingExperts = Object.keys(existingExperts).length > 0;
  const newSuggestions = suggestions.filter(s => !existingExperts[s.id]);

  const modalContent = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <Brain size={24} />
            <h2>Configurar Experts</h2>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </header>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>
              <RefreshCw size={24} className={styles.spinner} />
              <span>Analisando codebase...</span>
            </div>
          ) : isOrchestrator ? (
            <div className={styles.orchestratorMessage}>
              <AlertCircle size={48} />
              <h3>Projeto Orquestrador</h3>
              <p>
                Voce esta trabalhando diretamente no projeto do orquestrador.
                Os experts ja estao configurados automaticamente.
              </p>
              <p className={styles.hint}>
                Carregue um projeto externo para configurar experts personalizados.
              </p>

              {hasExistingExperts && (
                <div className={styles.orchestratorExperts}>
                  <h4>Experts do Orquestrador:</h4>
                  <div className={styles.expertsList}>
                    {Object.entries(existingExperts).map(([id, config]) => (
                      <div key={id} className={styles.expertBadge}>
                        <Check size={14} />
                        {config.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {projectName && (
                <div className={styles.projectInfo}>
                  <Folder size={16} />
                  <span>Projeto: <strong>{projectName}</strong></span>
                </div>
              )}

              {error && (
                <div className={styles.error}>
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {/* Experts existentes */}
              {hasExistingExperts && (
                <section className={styles.section}>
                  <h3>Experts Ativos</h3>
                  <div className={styles.expertsList}>
                    {Object.entries(existingExperts).map(([id, config]) => (
                      <div key={id} className={styles.existingExpert}>
                        <div className={styles.expertInfo}>
                          <div className={styles.expertName}>
                            <Check size={16} className={styles.checkIcon} />
                            {config.name}
                          </div>
                          <div className={styles.expertMeta}>
                            <span className={styles.patterns}>
                              <Folder size={12} />
                              {config.file_patterns?.slice(0, 2).join(', ')}
                              {config.file_patterns?.length > 2 && '...'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(id)}
                          disabled={deleting === id}
                          className={styles.deleteBtn}
                          title="Remover expert"
                        >
                          {deleting === id ? (
                            <RefreshCw size={16} className={styles.spinner} />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Novas sugestoes */}
              {newSuggestions.length > 0 && (
                <section className={styles.section}>
                  <h3>Sugestoes Detectadas</h3>
                  <p className={styles.sectionHint}>
                    Baseado na analise da sua codebase
                  </p>
                  <div className={styles.suggestionsList}>
                    {newSuggestions.map(suggestion => (
                      <label key={suggestion.id} className={styles.suggestion}>
                        <input
                          type="checkbox"
                          checked={selected.has(suggestion.id)}
                          onChange={() => toggleSelection(suggestion.id)}
                        />
                        <div className={styles.suggestionContent}>
                          <div className={styles.suggestionName}>
                            {suggestion.name}
                          </div>
                          <div className={styles.suggestionMeta}>
                            <span className={styles.patterns}>
                              <Folder size={12} />
                              {suggestion.file_patterns.slice(0, 2).join(', ')}
                            </span>
                            <span className={styles.keywords}>
                              <Tag size={12} />
                              {suggestion.keywords.slice(0, 4).join(', ')}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </section>
              )}

              {/* Nenhuma sugestao e nenhum expert */}
              {!hasExistingExperts && newSuggestions.length === 0 && (
                <div className={styles.emptyState}>
                  <Brain size={48} />
                  <h3>Nenhuma tecnologia detectada</h3>
                  <p>
                    Nao foi possivel detectar tecnologias automaticamente neste projeto.
                    Os experts ajudam a fornecer contexto mais rico durante o desenvolvimento.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <footer className={styles.footer}>
          {!isOrchestrator && newSuggestions.length > 0 && (
            <button
              onClick={handleCreate}
              disabled={creating || selected.size === 0}
              className={styles.createBtn}
            >
              {creating ? (
                <>
                  <RefreshCw size={16} className={styles.spinner} />
                  Criando...
                </>
              ) : (
                <>
                  <Brain size={16} />
                  Criar {selected.size} Expert{selected.size !== 1 ? 's' : ''}
                </>
              )}
            </button>
          )}
          <button onClick={onClose} className={styles.closeFooterBtn}>
            Fechar
          </button>
        </footer>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
