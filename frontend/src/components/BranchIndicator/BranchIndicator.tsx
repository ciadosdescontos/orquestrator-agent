import React from 'react';
import styles from './BranchIndicator.module.css';
import { MergeStatus } from '../../types';

interface BranchIndicatorProps {
  branchName: string;
  mergeStatus: MergeStatus;
  onClick?: () => void;
}

export const BranchIndicator: React.FC<BranchIndicatorProps> = ({
  branchName,
  mergeStatus,
  onClick
}) => {
  const getStatusIcon = () => {
    switch (mergeStatus) {
      case 'merging': return '\u23F3'; // hourglass
      case 'resolving': return '\uD83E\uDD16'; // robot (IA resolvendo conflitos)
      case 'merged': return '\u2713'; // checkmark
      case 'failed': return '\u274C'; // X (IA nao conseguiu resolver)
      default: return '\uD83D\uDD00'; // shuffle (branch ativo)
    }
  };

  // Mostrar apenas short name (ex: "agent/abc123-1234567890" -> "abc123")
  const shortName = branchName.replace('agent/', '').split('-')[0];

  return (
    <button
      className={`${styles.branchBadge} ${styles[mergeStatus]}`}
      onClick={onClick}
      title={branchName}
    >
      <span className={styles.icon}>{getStatusIcon()}</span>
      <span className={styles.name}>{shortName}</span>
    </button>
  );
};
