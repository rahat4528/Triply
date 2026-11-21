import dotenv from 'dotenv';
import { createServer } from './server';

dotenv.config();

const PORT = process.env.PORT || 4004;
const app = createServer();

app.listen(PORT, () => {
  console.log(`Triply Delivery Route Optimizer backend active on port ${PORT}`);
});
