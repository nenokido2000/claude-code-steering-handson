import express from 'express'; // hook test

import router from './api/routes';
import { logger } from './utils/logger';

export const app = express();

app.use(express.json());
app.use('/api', router);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

if (require.main === module) {
  const PORT = process.env.PORT ?? 3000;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}
