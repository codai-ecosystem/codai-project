import express from 'express';
import cors from 'cors';
import { db } from './lib/database';
import { redis } from './lib/redis';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        redis: 'connected'
    });
});

// API Routes
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await db.table('projects').select();
        res.json({ projects });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

app.post('/api/projects', async (req, res) => {
    try {
        const project = await db.table('projects').insert(req.body);
        res.status(201).json({ project });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create project' });
    }
});

app.get('/api/projects/:id', async (req, res) => {
    try {
        const project = await db.table('projects').where({ id: req.params.id }).select();
        if (project.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json({ project: project[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

app.put('/api/projects/:id', async (req, res) => {
    try {
        const project = await db.table('projects').where({ id: req.params.id }).update(req.body);
        res.json({ project });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update project' });
    }
});

app.delete('/api/projects/:id', async (req, res) => {
    try {
        await db.table('projects').where({ id: req.params.id }).delete();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// Cache endpoints
app.get('/api/cache/:key', async (req, res) => {
    try {
        const value = await redis.get(req.params.key);
        if (value === null) {
            return res.status(404).json({ error: 'Key not found' });
        }
        res.json({ value });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get cache value' });
    }
});

app.post('/api/cache/:key', async (req, res) => {
    try {
        await redis.set(req.params.key, req.body.value);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to set cache value' });
    }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

export { app };
