import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { AutomationRule, MaintenanceRequest, Message, Tenant } from '../types/models';

interface DataStoreShape {
  tenants: Tenant[];
  messages: Message[];
  maintenance: MaintenanceRequest[];
  automations: AutomationRule[];
}

const dataDir = path.join(process.cwd(), 'data');
const dataFile = path.join(dataDir, 'store.json');

function ensureStore(): DataStoreShape {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir);
  }

  if (!existsSync(dataFile)) {
    const now = new Date().toISOString();
    const seed: DataStoreShape = {
      tenants: [],
      messages: [],
      maintenance: [],
      automations: [
        {
          id: uuid(),
          name: 'Rent reminder',
          triggerType: 'date',
          triggerValue: 'monthly-3',
          actionType: 'sms-reminder',
          templateMessage: 'Rent is due on the 1st. Reply if you have questions.',
          active: true,
        },
        {
          id: uuid(),
          name: 'Late fee notice',
          triggerType: 'date',
          triggerValue: 'monthly-6',
          actionType: 'sms-late-fee',
          templateMessage: 'Your rent appears overdue. A late fee may apply. Please contact us.',
          active: true,
        },
      ],
    };
    writeFileSync(dataFile, JSON.stringify(seed, null, 2));
  }

  const raw = readFileSync(dataFile, 'utf-8');
  return JSON.parse(raw) as DataStoreShape;
}

let cache: DataStoreShape | null = null;

export function loadStore(): DataStoreShape {
  if (!cache) {
    cache = ensureStore();
  }
  return cache;
}

export function saveStore(): void {
  if (!cache) return;
  writeFileSync(dataFile, JSON.stringify(cache, null, 2));
}

export function createTenant(payload: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt' | 'balance' | 'status'> & { balance?: number; status?: Tenant['status'] }): Tenant {
  const now = new Date().toISOString();
  const tenant: Tenant = {
    id: uuid(),
    balance: payload.balance ?? 0,
    status: payload.status ?? 'active',
    ...payload,
    createdAt: now,
    updatedAt: now,
  };
  const store = loadStore();
  store.tenants.push(tenant);
  saveStore();
  return tenant;
}

export function updateTenant(id: string, updates: Partial<Tenant>): Tenant | undefined {
  const store = loadStore();
  const tenant = store.tenants.find((t) => t.id === id);
  if (!tenant) return undefined;
  Object.assign(tenant, updates, { updatedAt: new Date().toISOString() });
  saveStore();
  return tenant;
}

export function archiveTenant(id: string): Tenant | undefined {
  return updateTenant(id, { status: 'archived' });
}

export function addMessage(tenantId: string, direction: Message['direction'], content: string, status?: string): Message {
  const message: Message = {
    id: uuid(),
    tenantId,
    direction,
    content,
    status,
    timestamp: new Date().toISOString(),
  };
  const store = loadStore();
  store.messages.push(message);
  saveStore();
  return message;
}

export function createMaintenanceRequest(tenantId: string, description: string, category?: string): MaintenanceRequest {
  const now = new Date().toISOString();
  const request: MaintenanceRequest = {
    id: uuid(),
    tenantId,
    description,
    category,
    status: 'open',
    createdAt: now,
    updatedAt: now,
  };
  const store = loadStore();
  store.maintenance.push(request);
  saveStore();
  return request;
}

export function updateMaintenanceStatus(id: string, status: MaintenanceRequest['status'], internalNotes?: string): MaintenanceRequest | undefined {
  const store = loadStore();
  const request = store.maintenance.find((r) => r.id === id);
  if (!request) return undefined;
  request.status = status;
  request.updatedAt = new Date().toISOString();
  if (internalNotes) request.internalNotes = internalNotes;
  saveStore();
  return request;
}

export function seedTenantIfEmpty(): void {
  const store = loadStore();
  if (store.tenants.length === 0) {
    createTenant({
      name: 'Alexis Brown',
      phone: '+15550001111',
      email: 'alexis@example.com',
      unit: '152 Gregg St Unit B',
      leaseStart: '2024-06-01',
      leaseEnd: '2025-05-31',
      rentAmount: 1800,
      dueDate: 1,
      balance: 0,
      notes: 'Has dog, great communicator',
    });
  }
}

export function recordAutomation(rule: AutomationRule, tenant: Tenant, renderedMessage: string): Message {
  const message = addMessage(tenant.id, 'outgoing', renderedMessage, rule.actionType);
  tenant.updatedAt = new Date().toISOString();
  saveStore();
  return message;
}
