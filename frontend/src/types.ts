export interface ServiceInfo {
  id: string;
  name: string;
  description: string;
  url?: string;
  icon: string;
}

export type ServiceStatus = "up" | "down" | "unknown";

export interface ServiceHealth {
  id: string;
  status: ServiceStatus;
  latency_ms?: number;
}
