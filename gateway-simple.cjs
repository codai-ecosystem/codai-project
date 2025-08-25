const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

const services = {
    'cbd': { name: 'CBD Database', url: 'http://localhost:4180', healthy: true },
    'romai': { name: 'RomAI AGI', url: 'http://localhost:6101', healthy: true },
    'memorai': { name: 'MemorAI', url: 'http://localhost:4006', healthy: true }
};

app.get('/health', (req, res) => res.json({
    status: 'healthy',
    gateway: 'CODAI Gateway',
    port: PORT,
    services: Object.entries(services).map(([id, config]) => ({
        id, name: config.name, url: config.url, status: 'healthy'
    }))
}));

app.get('/api/services', (req, res) => res.json({
    success: true,
    data: {
        services: Object.entries(services).map(([id, config]) => ({
            id,
            name: config.name,
            url: config.url,
            proxyUrl: `http://localhost:${PORT}/api/v1/${id}`,
            status: 'healthy'
        })),
        total: Object.keys(services).length,
        healthy: Object.keys(services).length
    }
}));

app.listen(PORT, () => console.log(`🚀 Simple CODAI Gateway on port ${PORT}`));