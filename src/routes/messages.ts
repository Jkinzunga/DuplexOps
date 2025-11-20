import { Router } from 'express';
import { addMessage, createMaintenanceRequest, loadStore } from '../data/store';

const router = Router();

router.get('/', (_req, res) => {
  const store = loadStore();
  res.json(store.messages);
});

router.post('/webhook', (req, res) => {
  const { from, body } = req.body as { from?: string; body?: string };
  if (!from || !body) {
    return res.status(400).json({ error: 'Missing from/body' });
  }
  const store = loadStore();
  const tenant = store.tenants.find((t) => t.phone === from);
  if (!tenant) {
    return res.status(404).json({ error: 'Unknown tenant phone' });
  }
  const message = addMessage(tenant.id, 'incoming', body, 'received');
  if (body.toLowerCase().includes('leak') || body.toLowerCase().includes('fix') || body.toLowerCase().includes('maintenance')) {
    const request = createMaintenanceRequest(tenant.id, body, 'general');
    return res.json({ message, request, info: 'Maintenance ticket created and queued' });
  }
  res.json({ message, info: 'Message logged' });
});

router.post('/reply', (req, res) => {
  const { tenantId, content } = req.body as { tenantId?: string; content?: string };
  if (!tenantId || !content) return res.status(400).json({ error: 'Missing tenantId/content' });
  const store = loadStore();
  const tenant = store.tenants.find((t) => t.id === tenantId);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  const message = addMessage(tenant.id, 'outgoing', content, 'queued');
  res.json({ message, info: 'Reply captured; connect Twilio credentials to send SMS' });
});

export default router;
