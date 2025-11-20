import { Router } from 'express';
import { archiveTenant, createTenant, loadStore, updateTenant } from '../data/store';

const router = Router();

router.get('/', (_req, res) => {
  const store = loadStore();
  res.json(store.tenants);
});

router.get('/:id', (req, res) => {
  const store = loadStore();
  const tenant = store.tenants.find((t) => t.id === req.params.id);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  res.json(tenant);
});

router.post('/', (req, res) => {
  const { name, phone, email, unit, leaseStart, leaseEnd, rentAmount, dueDate, balance, notes } = req.body;
  if (!name || !phone || !rentAmount || !dueDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const tenant = createTenant({
    name,
    phone,
    email,
    unit,
    leaseStart,
    leaseEnd,
    rentAmount: Number(rentAmount),
    dueDate: Number(dueDate),
    balance: Number(balance ?? 0),
    notes,
  });
  res.status(201).json(tenant);
});

router.put('/:id', (req, res) => {
  const tenant = updateTenant(req.params.id, req.body);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  res.json(tenant);
});

router.post('/:id/archive', (req, res) => {
  const tenant = archiveTenant(req.params.id);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  res.json(tenant);
});

export default router;
