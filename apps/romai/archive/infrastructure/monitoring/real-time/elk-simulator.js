/**
 * ELK Stack Simulator for Week 3 Integration Testing
 * Simulates Elasticsearch, Kibana, and Logstash services
 */

const express = require('express');
const WebSocket = require('ws');
const { EventEmitter } = require('events');

class ELKStackSimulator extends EventEmitter {
    constructor() {
        super();
        this.services = {
            elasticsearch: { port: 9200, status: 'starting', uptime: 0 },
            kibana: { port: 5601, status: 'starting', uptime: 0 },
            logstash: { port: 9600, status: 'starting', uptime: 0 }
        };
        this.servers = {};
        this.startTime = Date.now();
    }

    async startServices() {
        console.log('🚀 Starting ELK Stack Simulator for Week 3 Integration...');

        try {
            // Start Elasticsearch simulator
            await this.startElasticsearch();

            // Start Kibana simulator  
            await this.startKibana();

            // Start Logstash simulator
            await this.startLogstash();

            console.log('✅ ELK Stack Simulator started successfully');
            this.emit('services_ready');

        } catch (error) {
            console.error('❌ Failed to start ELK Stack Simulator:', error);
            this.emit('services_error', error);
        }
    }

    async startElasticsearch() {
        const app = express();
        app.use(express.json());

        // Elasticsearch health endpoint
        app.get('/_cluster/health', (req, res) => {
            res.json({
                cluster_name: "romai-cluster",
                status: "green",
                timed_out: false,
                number_of_nodes: 1,
                number_of_data_nodes: 1,
                active_primary_shards: 5,
                active_shards: 5,
                relocating_shards: 0,
                initializing_shards: 0,
                unassigned_shards: 0
            });
        });

        // Elasticsearch index operations
        app.get('/_cat/indices', (req, res) => {
            res.send('green open romai-logs-2025.07.11 1 0 150 0 52.3kb 52.3kb\\n');
        });

        app.post('/:index/_doc', (req, res) => {
            res.json({
                _index: req.params.index,
                _type: "_doc",
                _id: this.generateId(),
                _version: 1,
                result: "created",
                _shards: { total: 1, successful: 1, failed: 0 }
            });
        });

        // Start server
        const server = app.listen(9200, () => {
            console.log('📊 Elasticsearch simulator listening on port 9200');
            this.services.elasticsearch.status = 'online';
        });

        this.servers.elasticsearch = server;
    }

    async startKibana() {
        const app = express();
        app.use(express.json());

        // Kibana health endpoint
        app.get('/api/status', (req, res) => {
            res.json({
                name: "romai-kibana",
                uuid: this.generateId(),
                version: { number: "8.0.0", build_hash: "simulator" },
                status: { overall: { level: "available" } },
                metrics: {
                    elasticsearch_client: { status: "green" },
                    last_updated: new Date().toISOString()
                }
            });
        });

        // Kibana dashboard endpoints
        app.get('/api/saved_objects/_find', (req, res) => {
            res.json({
                saved_objects: [],
                total: 0,
                per_page: 20,
                page: 1
            });
        });

        // Start server
        const server = app.listen(5601, () => {
            console.log('📈 Kibana simulator listening on port 5601');
            this.services.kibana.status = 'online';
        });

        this.servers.kibana = server;
    }    async startLogstash() {
        const app = express();
        app.use(express.json());
        
        // Enhanced Logstash node stats endpoint
        app.get('/_node/stats', (req, res) => {
            res.json({
                host: "romai-logstash",
                version: "8.0.0",
                http_address: "127.0.0.1:9600",
                id: this.generateId(),
                name: "romai-logstash",
                jvm: {
                    uptime_in_millis: Date.now() - this.startTime,
                    mem: { heap_used_percent: 25 }
                },
                process: { cpu: { percent: 5 } },
                pipeline: {
                    workers: 2,
                    batch_size: 125,
                    batch_delay: 50
                },
                status: "green"
            });
        });

        // Enhanced Logstash pipeline stats
        app.get('/_node/stats/pipelines', (req, res) => {
            res.json({
                pipelines: {
                    main: {
                        events: {
                            in: Math.floor(Math.random() * 1000) + 500,
                            filtered: Math.floor(Math.random() * 1000) + 500,
                            out: Math.floor(Math.random() * 1000) + 500
                        },
                        plugins: {
                            inputs: [{ id: "beats", events: { out: 500 } }],
                            filters: [{ id: "grok", events: { in: 500, out: 500 } }],
                            outputs: [{ id: "elasticsearch", events: { in: 500, out: 500 } }]
                        },
                        reloads: {
                            successes: 10,
                            failures: 0
                        }
                    }
                }
            });
        });

        // Health check endpoint
        app.get('/_health', (req, res) => {
            res.json({
                status: "green",
                uptime: Date.now() - this.startTime,
                version: "8.0.0"
            });
        });

        // Start server with error handling
        const server = app.listen(9600, () => {
            console.log('🔄 Logstash simulator listening on port 9600');
            this.services.logstash.status = 'online';
        });
        
        server.on('error', (error) => {
            console.error('❌ Logstash server error:', error);
            this.services.logstash.status = 'degraded';
        });
        
        this.servers.logstash = server;
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    getServiceStatus() {
        const uptime = Date.now() - this.startTime;
        Object.keys(this.services).forEach(service => {
            if (this.services[service].status === 'online') {
                this.services[service].uptime = Math.floor(uptime / 1000);
            }
        });
        return this.services;
    }

    async stopServices() {
        console.log('🛑 Stopping ELK Stack Simulator...');

        Object.values(this.servers).forEach(server => {
            server.close();
        });

        Object.keys(this.services).forEach(service => {
            this.services[service].status = 'stopped';
        });

        console.log('✅ ELK Stack Simulator stopped');
    }
}

// Start ELK Stack Simulator if run directly
if (require.main === module) {
    const elkSimulator = new ELKStackSimulator();

    elkSimulator.on('services_ready', () => {
        console.log('🎯 ELK Stack Simulator ready for integration testing');
        console.log('📊 Services status:', elkSimulator.getServiceStatus());

        // Keep simulator running
        setInterval(() => {
            const status = elkSimulator.getServiceStatus();
            console.log('💓 ELK Stack health check:', {
                elasticsearch: status.elasticsearch.status,
                kibana: status.kibana.status,
                logstash: status.logstash.status,
                uptime: `${status.elasticsearch.uptime}s`
            });
        }, 30000);
    });

    elkSimulator.on('services_error', (error) => {
        console.error('❌ ELK Stack Simulator error:', error);
        process.exit(1);
    });

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\\n📤 Received shutdown signal...');
        await elkSimulator.stopServices();
        process.exit(0);
    });

    elkSimulator.startServices();
}

module.exports = ELKStackSimulator;
