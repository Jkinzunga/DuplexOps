import { Router } from 'express';
import { loadStore, recordAutomation, saveStore } from '../data/store';

const router = Router();

function renderTemplate(template: string, tenantName: string): string {
  return template.replace(/{{name}}/g, tenantName);
}

router.get('/', (_req, res) => {
  const store = loadStore();
  res.json(store.automations);
});

router.post('/run', (req, res) => {
  const { dayOfMonth = new Date().getDate() } = req.body as { dayOfMonth?: number };
  const store = loadStore();
  const triggered = [] as { tenantId: string; automationId: string; message: string }[];

  for (const rule of store.automations.filter((a) => a.active && a.triggerType === 'date')) {
    const [frequency, day] = rule.triggerValue.split('-');
    if (frequency !== 'monthly') continue;
    if (Number(day) !== dayOfMonth) continue;
    for (const tenant of store.tenants.filter((t) => t.status === 'active')) {
      const message = renderTemplate(rule.templateMessage, tenant.name);
      recordAutomation(rule, tenant, message);
      if (rule.actionType === 'sms-late-fee') {
        tenant.balance += 50;
      }
      triggered.push({ tenantId: tenant.id, automationId: rule.id, message });
    }
  }

  saveStore();
  res.json({ triggered });
});

export default router;
