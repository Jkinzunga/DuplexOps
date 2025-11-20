import { Router } from 'express';
import { createMaintenanceRequest, loadStore, updateMaintenanceStatus } from '../data/store';

const router = Router();

router.get('/', (_req, res) => {
  const store = loadStore();
  res.json(store.maintenance);
});

router.post('/', (req, res) => {
  const { tenantId, description, category } = req.body;
  if (!tenantId || !description) return res.status(400).json({ error: 'Missing tenantId/description' });
  const store = loadStore();
  const tenant = store.tenants.find((t) => t.id === tenantId);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  const request = createMaintenanceRequest(tenantId, description, category);
  res.status(201).json(request);
});

router.patch('/:id', (req, res) => {
  const { status, internalNotes } = req.body;
  if (!status) return res.status(400).json({ error: 'Missing status' });
  const updated = updateMaintenanceStatus(req.params.id, status, internalNotes);
  if (!updated) return res.status(404).json({ error: 'Maintenance request not found' });
  res.json(updated);
});

export default router;
