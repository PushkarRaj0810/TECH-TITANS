import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createConnection } from 'typeorm';
import issueRoutes from './routes/issues';
import uploadRoutes from './routes/uploads';
import open311Routes from './routes/open311';

dotenv.config();

const app = express();

// Middleware
app.use(helmet()); // security headers
app.use(cors()); // enable CORS
app.use(morgan('dev')); // logging
app.use(express.json()); // parse JSON bodies
app.use(express.urlencoded({ extended: true })); // parse URL-encoded bodies

// Routes
app.use('/api/issues', issueRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/open311', open311Routes);

// Root endpoint
app.get('/', (_req, res) => {
  res.send('🛠️ CivicTrack API is running');
});

// Error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server only if not imported
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  createConnection()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Server started on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('❌ Failed to connect to database:', err);
    });
}

export default app;

server/
│
├── src/
│   ├── app.ts
│   ├── db.ts
│   ├── routes/
│   │   ├── issues.ts
│   │   ├── uploads.ts
│   │   └── open311.ts
│   └── entities/
│       ├── Issue.ts
│       ├── IssueCategory.ts
│       └── IssueAttachment.ts
