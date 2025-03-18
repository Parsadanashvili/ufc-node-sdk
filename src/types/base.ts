import { HttpsProxyAgentOptions } from "https-proxy-agent";

export type UfcPayOptions = {
  cert?: string;
  cert_phrase?: string;
  currency?: number;
  httpAgent?: {
    url: string;
    options?: HttpsProxyAgentOptions<string>;
  };
};

export type BaseUfcPayRequest = {
  ip: string;
  description?: string;
  language?: "ka" | "ge" | "en" | "ru";
  query?: Record<string, string>;
  options?: Omit<UfcPayOptions, "currency">;
};
