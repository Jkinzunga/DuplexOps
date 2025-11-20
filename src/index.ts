import express from 'express';
import cors from 'cors';
import tenantsRouter from './routes/tenants';
import messagesRouter from './routes/messages';
import maintenanceRouter from './routes/maintenance';
import automationsRouter from './routes/automations';
import dashboardRouter from './routes/dashboard';
import { seedTenantIfEmpty } from './data/store';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

seedTenantIfEmpty();

app.get('/', (_req, res) => {
  res.json({
    name: 'DuplexOps MVP',
    endpoints: {
      tenants: '/api/tenants',
      messages: '/api/messages',
      maintenance: '/api/maintenance',
      automations: '/api/automations',
      dashboard: '/api/dashboard/summary',
    },
  });
});

app.use('/api/tenants', tenantsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/automations', automationsRouter);
app.use('/api/dashboard', dashboardRouter);

app.listen(PORT, () => {
  console.log(`DuplexOps MVP API running on port ${PORT}`);
});
