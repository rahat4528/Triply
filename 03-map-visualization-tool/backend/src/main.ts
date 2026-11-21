import dotenv from 'dotenv';
dotenv.config();

import { createServer } from './server';

const port = process.env.PORT || 4003;
const app = createServer();

app.listen(port, () => {
  console.log(`[Map Visualization Tool Backend] Running on http://localhost:${port}`);
  console.log(`[Healthcheck] Available at http://localhost:${port}/health`);
});
