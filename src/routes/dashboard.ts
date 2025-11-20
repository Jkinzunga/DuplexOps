import { Router } from 'express';
import { loadStore } from '../data/store';
import { TaskSummary } from '../types/models';

const router = Router();

router.get('/summary', (_req, res) => {
  const store = loadStore();
  const today = new Date();
  const dueToday = store.tenants.filter((t) => t.dueDate === today.getDate() && t.status === 'active');
  const pendingRequests = store.maintenance.filter((m) => m.status !== 'completed');
  const rentStatus = store.tenants.map((tenant) => ({
    tenantId: tenant.id,
    name: tenant.name,
    status: tenant.balance > 0 ? 'unpaid' : 'paid',
    balance: tenant.balance,
  }));
  const summary: TaskSummary = {
    todayTasks: dueToday.map((t) => `Collect rent from ${t.name} (${t.unit})`),
    pendingRequests,
    rentStatus,
  };
  res.json(summary);
});

export default router;
