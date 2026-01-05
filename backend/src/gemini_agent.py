"""
Gemini Agent Integration Module

This module provides integration with Gemini CLI for executing commands
and performing chat completions using Google's Gemini models.
"""

import subprocess
import json
import asyncio
from pathlib import Path
from typing import AsyncGenerator, Optional, Dict, Any


class GeminiAgent:
    """Handler para integração com Gemini CLI"""

    def __init__(self, model: str = "gemini-3-pro"):
        """
        Initialize GeminiAgent with specified model.

        Args:
            model: Gemini model identifier (e.g., "gemini-3-pro", "gemini-3-flash")
        """
        self.model = model
        self.gemini_cli_path = "gemini"  # Assumindo que está no PATH

    async def execute_command(
        self,
        prompt: str,
        cwd: Optional[Path] = None,
        stream: bool = True,
        output_format: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        Executa um comando usando Gemini CLI via subprocess.

        Args:
            prompt: Prompt completo a ser enviado
            cwd: Diretório de trabalho
            stream: Se deve fazer streaming da resposta
            output_format: Formato de saída opcional (json, text, etc)

        Yields:
            String chunks da resposta do comando

        Raises:
            RuntimeError: Se o Gemini CLI retornar erro
        """
        # Mapear nomes de modelo para o formato CLI
        model_mapping = {
            "gemini-3-pro": "gemini-3-pro-preview",
            "gemini-3-flash": "gemini-3-flash-preview"
        }
        cli_model = model_mapping.get(self.model, self.model)

        # Monta o comando completo
        cmd_parts = [
            self.gemini_cli_path,
            "-y",  # Auto-approve
            "-p", prompt,
            "--model", cli_model,
        ]

        if output_format:
            cmd_parts.extend(["--output-format", output_format])

        print(f"[GeminiAgent] Executing command: {' '.join(cmd_parts[:4])}... (prompt truncated)")
        print(f"[GeminiAgent] Working directory: {cwd}")
        print(f"[GeminiAgent] Model: {self.model} (CLI: {cli_model})")

        # Executa o processo
        process = await asyncio.create_subprocess_exec(
            *cmd_parts,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=cwd
        )

        if stream:
            # Stream output line by line
            if process.stdout:
                print(f"[GeminiAgent] Streaming output...")
                async for line in process.stdout:
                    decoded = line.decode('utf-8')
                    print(f"[GeminiAgent] Chunk: {decoded[:100]}")
                    yield decoded

            # Check for errors after streaming
            await process.wait()
            if process.returncode != 0 and process.stderr:
                stderr_output = await process.stderr.read()
                error_msg = stderr_output.decode('utf-8')
                print(f"[GeminiAgent] ERROR: {error_msg}")
                raise RuntimeError(f"Gemini CLI error: {error_msg}")
        else:
            # Retorna output completo
            stdout, stderr = await process.communicate()
            if stderr:
                error_msg = stderr.decode('utf-8')
                print(f"[GeminiAgent] ERROR: {error_msg}")
                raise RuntimeError(f"Gemini CLI error: {error_msg}")
            yield stdout.decode('utf-8')

    async def chat_completion(
        self,
        messages: list[dict],
        system_prompt: Optional[str] = None,
        cwd: Optional[Path] = None
    ) -> AsyncGenerator[str, None]:
        """
        Realiza chat completion usando Gemini.

        Args:
            messages: Lista de mensagens no formato [{"role": "user", "content": "..."}]
            system_prompt: Prompt de sistema opcional
            cwd: Diretório de trabalho opcional

        Yields:
            String chunks da resposta do chat
        """
        # Formata mensagens para o formato esperado pelo Gemini
        formatted_prompt = self._format_messages(messages, system_prompt)

        # Executa chat usando Gemini CLI
        async for chunk in self.execute_command(
            prompt=formatted_prompt,
            cwd=cwd,
            stream=True
        ):
            yield chunk

    def _format_messages(
        self,
        messages: list[dict],
        system_prompt: Optional[str] = None
    ) -> str:
        """
        Formata mensagens para o formato do Gemini.

        Args:
            messages: Lista de mensagens
            system_prompt: Prompt de sistema opcional

        Returns:
            String formatada com todas as mensagens
        """
        parts = []

        if system_prompt:
            parts.append(f"System: {system_prompt}\n")

        for msg in messages:
            role = "User" if msg["role"] == "user" else "Assistant"
            parts.append(f"{role}: {msg['content']}\n")

        return "\n".join(parts)
