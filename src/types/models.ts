export type TenantStatus = 'active' | 'archived';

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email: string;
  unit: string;
  leaseStart: string;
  leaseEnd: string;
  rentAmount: number;
  dueDate: number;
  balance: number;
  status: TenantStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type MessageDirection = 'incoming' | 'outgoing';

export interface Message {
  id: string;
  tenantId: string;
  direction: MessageDirection;
  content: string;
  timestamp: string;
  status?: string;
}

export type MaintenanceStatus = 'open' | 'in-progress' | 'completed';

export interface MaintenanceRequest {
  id: string;
  tenantId: string;
  description: string;
  category?: string;
  status: MaintenanceStatus;
  createdAt: string;
  updatedAt: string;
  internalNotes?: string;
}

export type AutomationTriggerType = 'date' | 'event';

export interface AutomationRule {
  id: string;
  name: string;
  triggerType: AutomationTriggerType;
  triggerValue: string;
  actionType: string;
  templateMessage: string;
  active: boolean;
}

export interface TaskSummary {
  todayTasks: string[];
  pendingRequests: MaintenanceRequest[];
  rentStatus: { tenantId: string; name: string; status: 'paid' | 'unpaid'; balance: number }[];
}
