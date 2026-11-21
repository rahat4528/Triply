import dotenv from 'dotenv';
import { createServer } from './server';

dotenv.config();

const PORT = process.env.PORT || 4003;
const app = createServer();

app.listen(PORT, () => {
  console.log(`Triply Travel Planner backend active on port ${PORT}`);
});
