import dotenv from 'dotenv';
dotenv.config();

import { createServer } from './server';

const port = process.env.PORT || 4001;
const app = createServer();

app.listen(port, () => {
  console.log(`[Weather Application Backend] Server listening on http://localhost:${port}`);
  console.log(`[Healthcheck] Available at http://localhost:${port}/health`);
});
