import styles from './ModelSelector.module.css';

export interface AIModel {
  id: string;
  name: string;
  provider: 'anthropic' | 'openai' | 'google';
  maxTokens: number;
  description: string;
}

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    maxTokens: 200000,
    description: 'Balanced performance and speed'
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    maxTokens: 200000,
    description: 'Most capable, best for complex tasks'
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    maxTokens: 128000,
    description: 'OpenAI\'s most advanced model'
  }
];

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ selectedModel, onModelChange, disabled = false }: ModelSelectorProps) {
  const currentModel = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0];

  return (
    <div className={styles.modelSelector}>
      <label htmlFor="model-select" className={styles.label}>
        AI Model:
      </label>
      <select
        id="model-select"
        className={styles.select}
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        disabled={disabled}
        aria-label="Select AI Model"
      >
        {AVAILABLE_MODELS.map(model => (
          <option key={model.id} value={model.id}>
            {model.name} - {model.description}
          </option>
        ))}
      </select>
      <div className={styles.modelInfo}>
        <span className={styles.provider}>{currentModel.provider}</span>
        <span className={styles.tokens}>{(currentModel.maxTokens / 1000).toFixed(0)}K tokens</span>
      </div>
    </div>
  );
}
