"use client";

import { useState, useEffect } from "react";

export type AIProvider = "anthropic" | "openai-compatible";

export interface AIConfig {
  provider: AIProvider;
  baseURL: string;
  apiKey: string;
  modelId: string;
}

const STORAGE_KEY = "writter-ai-config";

const DEFAULT_CONFIG: AIConfig = {
  provider: "anthropic",
  baseURL: "",
  apiKey: "",
  modelId: "claude-3-5-sonnet-20241022",
};

export function useAIConfig() {
  const [config, setConfigState] = useState<AIConfig>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setConfigState({ ...DEFAULT_CONFIG, ...JSON.parse(stored) });
      } catch {
        setConfigState(DEFAULT_CONFIG);
      }
    }
    setIsLoaded(true);
  }, []);

  function setConfig(config: AIConfig) {
    setConfigState(config);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }

  return { config, setConfig, isLoaded };
}
