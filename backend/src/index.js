import 'dotenv/config';
import express from 'express';
import webhookRouter  from './routes/webhook.js';
import bookingsRouter from './routes/bookings.js';
import leadsRouter    from './routes/leads.js';
import callsRouter    from './routes/calls.js';
import usersRouter    from './routes/users.js';
import activityRouter from './routes/activity.js';
import statsRouter    from './routes/stats.js';
import pricingRouter   from './routes/pricing.js';
import driversRouter   from './routes/drivers.js';
import { startStatusScheduler } from './services/statusScheduler.js';
import { getClient, startTokenRefresh } from './services/pbService.js';

const app  = express();
const PORT = process.env.PORT ?? 3000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin',  process.env.DASHBOARD_URL ?? 'http://localhost:3001');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/webhook',  webhookRouter);
app.use('/bookings', bookingsRouter);
app.use('/leads',    leadsRouter);
app.use('/calls',    callsRouter);
app.use('/users',    usersRouter);
app.use('/activity', activityRouter);
app.use('/stats',    statsRouter);
app.use('/pricing',  pricingRouter);
app.use('/drivers',  driversRouter);

app.listen(PORT, async () => {
  console.info(`[server] Running on port ${PORT}`);
  // Authenticate immediately on startup — fail fast if credentials are wrong
  try {
    await getClient();
    startTokenRefresh();
    startStatusScheduler();
    console.info('[server] All services ready');
  } catch (err) {
    console.error('[server] Startup failed — check PocketBase credentials:', err.message);
  }
});
