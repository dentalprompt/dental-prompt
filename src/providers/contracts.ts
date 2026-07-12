export type StorageUploadInput = {
  key: string;
  contentType: string;
  body: Buffer | Uint8Array;
};

export type StorageUploadResult = {
  key: string;
  url: string;
};

export interface StorageProvider {
  upload(input: StorageUploadInput): Promise<StorageUploadResult>;
  remove(key: string): Promise<void>;
  getPublicUrl(key: string): string;
}

export type AiChatInput = {
  model: string;
  temperature: number;
  systemPrompt: string;
  userMessage: string;
};

export type AiChatResult = {
  outputText: string;
  inputTokens?: number;
  outputTokens?: number;
};

export interface AiProvider {
  chat(input: AiChatInput): Promise<AiChatResult>;
}

export type WhatsappInstancePayload = {
  tenantId: string;
  agentId: string;
  number: string;
};

export interface WhatsappProvider {
  createInstance(payload: WhatsappInstancePayload): Promise<{ instanceId: string; qrCode?: string }>;
  restartInstance(instanceId: string): Promise<void>;
  deleteInstance(instanceId: string): Promise<void>;
}
