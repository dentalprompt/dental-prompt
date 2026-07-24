export type ClinicSettingsView = {
  tenantId: string;
  clinicName: string;
  legalName: string;
  email: string;
  phone: string;
  whatsapp: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
};

export type ZApiInstanceView = {
  tenantId: string;
  configured: boolean;
  apiBaseUrl: string;
  instanceId: string;
  whatsappNumber: string;
  status: string;
  connected: boolean;
  smartphoneConnected: boolean;
  connectedPhone: string;
  profileName: string;
  qrCodeBase64: string;
  qrCodeText: string;
  lastError: string;
  webhookUrl: string;
  updatedAt: string | null;
};

export type AnamnesisTemplateItem = {
  id: string;
  name: string;
  description: string;
  specialty: string;
  isActive: boolean;
};

export type ContractTemplateItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  isActive: boolean;
};

export type FinancialAccountItem = {
  id: string;
  name: string;
  bank: string;
  agency: string;
  account: string;
  type: string;
  initialBalance: number;
  isActive: boolean;
};

export type ChairItem = {
  id: string;
  name: string;
  code: string;
  room: string;
  color: string;
  notes: string;
  isActive: boolean;
};
