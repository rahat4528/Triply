import dotenv from 'dotenv';
dotenv.config();

import { createServer } from './server';

const port = process.env.PORT || 4002;
const app = createServer();

app.listen(port, () => {
  console.log(`[Location-Based Service Backend] Running on http://localhost:${port}`);
  console.log(`[Healthcheck] Available at http://localhost:${port}/health`);
});
