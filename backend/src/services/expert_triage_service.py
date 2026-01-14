"""Expert Triage Service.

Identifies relevant expert agents for a card based on its title and description.
Uses keyword matching to determine which experts should be consulted.

IMPORTANTE:
- Quando NÃO há projeto carregado (project_path=None): usa experts do orquestrador
- Quando há projeto carregado: usa experts do projeto (pode ser vazio)
"""

from __future__ import annotations

import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple, Optional

from ..config.experts import get_experts, get_expert_config, ExpertConfig
from ..schemas.expert import ExpertMatch


def _normalize_text(text: str) -> str:
    """Normalize text for keyword matching (lowercase, remove punctuation)."""
    # Convert to lowercase and remove common punctuation
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    return text


def _calculate_keyword_matches(text: str, keywords: List[str]) -> Tuple[List[str], int]:
    """
    Calculate keyword matches in text.

    Returns:
        Tuple of (matched_keywords, score)
    """
    normalized_text = _normalize_text(text)
    words = set(normalized_text.split())

    matched_keywords = []
    score = 0

    for keyword in keywords:
        normalized_keyword = _normalize_text(keyword)

        # Check for exact word match
        if normalized_keyword in words:
            matched_keywords.append(keyword)
            score += 2  # Higher score for exact word match
        # Check for substring match (for multi-word keywords or partial matches)
        elif normalized_keyword in normalized_text:
            matched_keywords.append(keyword)
            score += 1  # Lower score for substring match

    return matched_keywords, score


def _determine_confidence(score: int, num_matches: int) -> str:
    """
    Determine confidence level based on matching score and number of matches.

    - high: 3+ matches or score >= 5
    - medium: 2 matches or score >= 3
    - low: 1 match
    """
    if num_matches >= 3 or score >= 5:
        return "high"
    elif num_matches >= 2 or score >= 3:
        return "medium"
    else:
        return "low"


def _generate_reason(expert_name: str, matched_keywords: List[str]) -> str:
    """Generate a human-readable reason for why this expert was identified."""
    if len(matched_keywords) == 1:
        return f"Menciona '{matched_keywords[0]}' que e area do {expert_name}"
    elif len(matched_keywords) <= 3:
        keywords_str = ", ".join(f"'{k}'" for k in matched_keywords)
        return f"Menciona {keywords_str} que sao areas do {expert_name}"
    else:
        keywords_str = ", ".join(f"'{k}'" for k in matched_keywords[:3])
        return f"Menciona {keywords_str} e mais {len(matched_keywords) - 3} termos relacionados ao {expert_name}"


def _read_knowledge_summary(knowledge_path: str, cwd: str) -> str | None:
    """Read a brief summary from the expert's KNOWLEDGE.md file."""
    try:
        full_path = Path(cwd) / knowledge_path
        if not full_path.exists():
            return None

        content = full_path.read_text()

        # Extract first section (usually technology/overview)
        lines = content.split('\n')
        summary_lines = []
        in_section = False

        for line in lines:
            if line.startswith('## '):
                if in_section:
                    break
                in_section = True
                continue
            if in_section and line.strip():
                summary_lines.append(line.strip())
                if len(summary_lines) >= 5:
                    break

        if summary_lines:
            return ' '.join(summary_lines[:3])
        return None
    except Exception:
        return None


def identify_experts(
    title: str,
    description: str | None = None,
    cwd: str | None = None,
    project_path: Optional[str] = None
) -> Dict[str, ExpertMatch]:
    """
    Identify relevant experts for a card based on its content.

    Args:
        title: Card title
        description: Card description (optional)
        cwd: Working directory for reading knowledge files (optional)
        project_path: Path do projeto carregado (None = orquestrador)

    Returns:
        Dict mapping expert_id to ExpertMatch with confidence and reason
        Retorna {} (vazio) se não houver experts configurados no projeto
    """
    # Obter experts baseado no contexto
    available_experts = get_experts(project_path)

    # Se não há experts, retorna vazio (não é erro)
    if not available_experts:
        return {}

    # Combine title and description for analysis
    text_to_analyze = title
    if description:
        text_to_analyze += " " + description

    identified_experts: Dict[str, ExpertMatch] = {}
    now = datetime.utcnow().isoformat() + "Z"

    for expert_id, config in available_experts.items():
        matched_keywords, score = _calculate_keyword_matches(
            text_to_analyze,
            config["keywords"]
        )

        # Only include if at least one keyword matched
        if matched_keywords:
            confidence = _determine_confidence(score, len(matched_keywords))
            reason = _generate_reason(config["name"], matched_keywords)

            # Read knowledge summary if cwd provided
            knowledge_summary = None
            if cwd:
                knowledge_summary = _read_knowledge_summary(config["knowledge_path"], cwd)

            identified_experts[expert_id] = ExpertMatch(
                reason=reason,
                confidence=confidence,
                identified_at=now,
                knowledge_summary=knowledge_summary,
                matched_keywords=matched_keywords
            )

    return identified_experts


def get_expert_knowledge_content(
    expert_id: str,
    cwd: str,
    project_path: Optional[str] = None
) -> str | None:
    """
    Read the full KNOWLEDGE.md content for an expert.

    Args:
        expert_id: ID of the expert
        cwd: Working directory (project root)
        project_path: Path do projeto carregado (None = orquestrador)

    Returns:
        Full content of the KNOWLEDGE.md file or None if not found
    """
    config = get_expert_config(expert_id, project_path)
    if not config:
        return None

    try:
        full_path = Path(cwd) / config["knowledge_path"]
        if full_path.exists():
            return full_path.read_text()
        return None
    except Exception:
        return None


def build_expert_context_for_plan(
    experts: Dict[str, ExpertMatch | dict],
    cwd: str,
    project_path: Optional[str] = None
) -> str:
    """
    Build context string from identified experts to inject into plan prompt.

    Args:
        experts: Dict of identified experts (ExpertMatch objects or plain dicts)
        cwd: Working directory (project root)
        project_path: Path do projeto carregado (None = orquestrador)

    Returns:
        Formatted string with expert context for the plan prompt
    """
    if not experts:
        return ""

    # Obter experts disponíveis para este contexto
    available_experts = get_experts(project_path)

    context_parts = ["## Contexto dos Experts Relevantes\n"]

    for expert_id, match in experts.items():
        config = available_experts.get(expert_id)
        if not config:
            continue

        # Handle both ExpertMatch objects and plain dicts
        if isinstance(match, dict):
            confidence = match.get("confidence", "unknown")
            reason = match.get("reason", "")
        else:
            confidence = match.confidence
            reason = match.reason

        context_parts.append(f"### {config['name']} (confidence: {confidence})")
        context_parts.append(f"**Identificado porque:** {reason}\n")

        # Read and include knowledge content
        knowledge = get_expert_knowledge_content(expert_id, cwd, project_path)
        if knowledge:
            # Truncate if too long (keep first ~2000 chars)
            if len(knowledge) > 2000:
                knowledge = knowledge[:2000] + "\n\n[... truncado para brevidade ...]"
            context_parts.append("**Knowledge Base:**")
            context_parts.append(f"```\n{knowledge}\n```\n")

    return "\n".join(context_parts)
