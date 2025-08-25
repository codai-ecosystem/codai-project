// Network service types\nexport interface ServiceConfig {\n  port?: number;\n  host?: string;\n  ssl?: boolean;\n  [key: string]: any;\n}\n\n"use strict";
/*!
 * CBD MCP Server
 * Model Context Protocol server for CBD (Codai Better Database)
 * Provides direct vector database operations and management
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value): any { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value): any { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value): any { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result): any { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n): any { return function (v) { return step([n, v]); }; }
    function step(op): any {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
export const CBDMCPServer = void 0;
var index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var index_js_2 = require("../index.js");
var config_js_1 = require("./config.js");
var health_js_1 = require("./tools/monitoring/health.js");
var stats_js_1 = require("./tools/monitoring/stats.js");
var CBDMCPServer = /** @class */ (function () {
    function CBDMCPServer(config): any {
        this.initialized = false;
        this.config = __assign(__assign({}, (0, config_js_1.getConfig)()), config);
        // Validate configuration
        var configErrors = (0, config_js_1.validateConfig)(this.config);
        if (configErrors.length > 0) {
            throw new Error("Configuration errors: ".concat(configErrors.join(', ')));
        }
        // Initialize MCP server
        this.server = new index_js_1.Server({
            name: this.config.server.name,
            version: this.config.server.version,
        }, {
            capabilities: {
                tools: {},
            },
        });
        // Initialize CBD engine with config
        this.engine = (0, index_js_2.createCBDEngine)({
            storage: {
                type: 'cbd-native',
                dataPath: this.config.database.path || './cbd-mcp-data'
            },
            embedding: {
                model: 'openai',
                apiKey: process.env.OPENAI_API_KEY || undefined,
                modelName: 'text-embedding-ada-002',
                dimensions: this.config.database.dimension || 1536
            },
            vector: {
                indexType: 'faiss',
                dimensions: this.config.database.dimension || 1536,
                similarityMetric: 'cosine'
            },
            cache: {
                enabled: true,
                maxSize: this.config.performance.cacheSize,
                ttl: 3600000 // 1 hour
            }
        });
        this.setupHandlers();
    }
    /**
     * Setup MCP request handlers
     */
    CBDMCPServer.prototype.setupHandlers = function () {
        var _this = this;
        // List available tools
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, ({
                        tools: [
                            // Monitoring Tools
                            {
                                name: 'health_check',
                                description: 'Check CBD MCP server health status',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        detailed: {
                                            type: 'boolean',
                                            description: 'Include detailed health information',
                                            default: false
                                        }
                                    }
                                }
                            },
                            {
                                name: 'get_server_stats',
                                description: 'Get CBD server statistics and performance metrics',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        detailed: {
                                            type: 'boolean',
                                            description: 'Include detailed statistics',
                                            default: false
                                        }
                                    }
                                }
                            },
                            // Vector Operations (Phase 2)
                            {
                                name: 'vector_search',
                                description: 'Search vectors by similarity',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        query: {
                                            type: 'string',
                                            description: 'Search query text'
                                        },
                                        limit: {
                                            type: 'number',
                                            description: 'Maximum number of results',
                                            default: 10
                                        },
                                        threshold: {
                                            type: 'number',
                                            description: 'Similarity threshold (0.0 to 1.0)',
                                            default: 0.0
                                        }
                                    },
                                    required: ['query']
                                }
                            },
                            {
                                name: 'vector_store',
                                description: 'Store a vector with metadata',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        content: {
                                            type: 'string',
                                            description: 'Content to store'
                                        },
                                        metadata: {
                                            type: 'object',
                                            description: 'Additional metadata'
                                        },
                                        project: {
                                            type: 'string',
                                            description: 'Project name',
                                            default: 'mcp'
                                        },
                                        session: {
                                            type: 'string',
                                            description: 'Session name',
                                            default: 'default'
                                        }
                                    },
                                    required: ['content']
                                }
                            },
                            // Memory Operations
                            {
                                name: 'search_memory',
                                description: 'Search stored memories by query',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        query: {
                                            type: 'string',
                                            description: 'Search query'
                                        },
                                        limit: {
                                            type: 'number',
                                            description: 'Maximum results to return',
                                            default: 10
                                        },
                                        project: {
                                            type: 'string',
                                            description: 'Filter by project name'
                                        },
                                        session: {
                                            type: 'string',
                                            description: 'Filter by session name'
                                        }
                                    },
                                    required: ['query']
                                }
                            },
                            {
                                name: 'get_memory',
                                description: 'Retrieve a specific memory by structured key',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        key: {
                                            type: 'string',
                                            description: 'Structured key (project_date_session_sequence)'
                                        }
                                    },
                                    required: ['key']
                                }
                            }
                        ]
                    })];
            });
        }); });
        // Handle tool calls
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, function (request) { return __awaiter(_this, void 0, void 0, function () {
            var _a, name, args, _b, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = request.params, name = _a.name, args = _a.arguments;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 17, , 18]);
                        return [4 /*yield*/, this.ensureInitialized()];
                    case 2:
                        _c.sent();
                        _b = name;
                        switch (_b) {
                            case 'health_check': return [3 /*break*/, 3];
                            case 'get_server_stats': return [3 /*break*/, 5];
                            case 'vector_search': return [3 /*break*/, 7];
                            case 'vector_store': return [3 /*break*/, 9];
                            case 'search_memory': return [3 /*break*/, 11];
                            case 'get_memory': return [3 /*break*/, 13];
                        }
                        return [3 /*break*/, 15];
                    case 3: return [4 /*yield*/, this.handleHealthCheck(Boolean(args === null || args === void 0 ? void 0 : args.detailed))];
                    case 4: return [2 /*return*/, _c.sent()];
                    case 5: return [4 /*yield*/, this.handleGetServerStats(Boolean(args === null || args === void 0 ? void 0 : args.detailed))];
                    case 6: return [2 /*return*/, _c.sent()];
                    case 7: return [4 /*yield*/, this.handleVectorSearch(args)];
                    case 8: return [2 /*return*/, _c.sent()];
                    case 9: return [4 /*yield*/, this.handleVectorStore(args)];
                    case 10: return [2 /*return*/, _c.sent()];
                    case 11: return [4 /*yield*/, this.handleSearchMemory(args)];
                    case 12: return [2 /*return*/, _c.sent()];
                    case 13: return [4 /*yield*/, this.handleGetMemory(args)];
                    case 14: return [2 /*return*/, _c.sent()];
                    case 15: throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, "Unknown tool: ".concat(name));
                    case 16: return [3 /*break*/, 18];
                    case 17:
                        error_1 = _c.sent();
                        throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, "Tool execution failed: ".concat((error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || 'Unknown error'));
                    case 18: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Ensure the CBD engine is initialized
     */
    CBDMCPServer.prototype.ensureInitialized = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.initialized) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.engine.initialize()];
                    case 1:
                        _a.sent();
                        this.initialized = true;
                        if (this.config.logging.enabled) {
                            console.log("\uD83D\uDE80 CBD MCP Server initialized (".concat(this.config.server.name, " v").concat(this.config.server.version, ")"));
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle health check tool
     */
    CBDMCPServer.prototype.handleHealthCheck = function () {
        return __awaiter(this, arguments, void 0, function (detailed) {
            var health, _a;
            if (detailed === void 0) { detailed = false; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!detailed) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, health_js_1.healthCheck)(this.engine, this.config)];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, (0, health_js_1.quickHealthCheck)(this.engine)];
                    case 3:
                        _a = _b.sent();
                        _b.label = 4;
                    case 4:
                        health = _a;
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: 'text',
                                        text: JSON.stringify(health, null, 2)
                                    }
                                ]
                            }];
                }
            });
        });
    };
    /**
     * Handle get server stats tool
     */
    CBDMCPServer.prototype.handleGetServerStats = function () {
        return __awaiter(this, arguments, void 0, function (detailed) {
            var stats, _a;
            if (detailed === void 0) { detailed = false; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!detailed) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, stats_js_1.getServerStats)(this.engine, this.config, true)];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, (0, stats_js_1.getBasicStats)(this.engine, this.config)];
                    case 3:
                        _a = _b.sent();
                        _b.label = 4;
                    case 4:
                        stats = _a;
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: 'text',
                                        text: JSON.stringify(stats, null, 2)
                                    }
                                ]
                            }];
                }
            });
        });
    };
    /**
     * Handle vector search tool
     */
    CBDMCPServer.prototype.handleVectorSearch = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var searchResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(args === null || args === void 0 ? void 0 : args.query)) {
                            throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, 'Query is required');
                        }
                        return [4 /*yield*/, this.engine.search_memory(args.query, args.limit || 10, args.threshold || 0.0)];
                    case 1:
                        searchResult = _a.sent();
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: 'text',
                                        text: JSON.stringify({
                                            query: args.query,
                                            limit: args.limit || 10,
                                            summary: searchResult.summary,
                                            results: searchResult.memories.length,
                                            matches: searchResult.memories.map(function (result) { return ({
                                                key: result.memory.structuredKey,
                                                score: result.relevanceScore,
                                                content: result.memory.userRequest + ' ' + result.memory.assistantResponse,
                                                metadata: {
                                                    projectName: result.memory.projectName,
                                                    sessionName: result.memory.sessionName,
                                                    agentId: result.memory.agentId,
                                                    timestamp: result.memory.createdAt
                                                }
                                            }); })
                                        }, null, 2)
                                    }
                                ]
                            }];
                }
            });
        });
    };
    /**
     * Handle vector store tool
     */
    CBDMCPServer.prototype.handleVectorStore = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var structuredKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(args === null || args === void 0 ? void 0 : args.content)) {
                            throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, 'Content is required');
                        }
                        return [4 /*yield*/, this.engine.store_memory(args.content, 'MCP Response', __assign({ projectName: args.project || 'mcp', sessionName: args.session || 'default', agentId: 'cbd-mcp-server' }, args.metadata))];
                    case 1:
                        structuredKey = _a.sent();
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: 'text',
                                        text: JSON.stringify({
                                            success: true,
                                            key: structuredKey,
                                            project: args.project || 'mcp',
                                            session: args.session || 'default'
                                        }, null, 2)
                                    }
                                ]
                            }];
                }
            });
        });
    };
    /**
     * Handle search memory tool
     */
    CBDMCPServer.prototype.handleSearchMemory = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var searchResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(args === null || args === void 0 ? void 0 : args.query)) {
                            throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, 'Query is required');
                        }
                        return [4 /*yield*/, this.engine.search_memory(args.query, args.limit || 10)];
                    case 1:
                        searchResult = _a.sent();
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: 'text',
                                        text: JSON.stringify({
                                            query: args.query,
                                            summary: searchResult.summary,
                                            results: searchResult.memories.map(function (result) { return ({
                                                key: result.memory.structuredKey,
                                                score: result.relevanceScore,
                                                userRequest: result.memory.userRequest,
                                                assistantResponse: result.memory.assistantResponse,
                                                projectName: result.memory.projectName,
                                                sessionName: result.memory.sessionName,
                                                agentId: result.memory.agentId,
                                                timestamp: result.memory.createdAt
                                            }); })
                                        }, null, 2)
                                    }
                                ]
                            }];
                }
            });
        });
    };
    /**
     * Handle get memory tool
     */
    CBDMCPServer.prototype.handleGetMemory = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var memory;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(args === null || args === void 0 ? void 0 : args.key)) {
                            throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, 'Key is required');
                        }
                        return [4 /*yield*/, this.engine.get_memory(args.key)];
                    case 1:
                        memory = _a.sent();
                        if (!memory) {
                            return [2 /*return*/, {
                                    content: [
                                        {
                                            type: 'text',
                                            text: JSON.stringify({ error: 'Memory not found' }, null, 2)
                                        }
                                    ]
                                }];
                        }
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: 'text',
                                        text: JSON.stringify({
                                            key: args.key,
                                            structuredKey: memory.structuredKey,
                                            userRequest: memory.userRequest,
                                            assistantResponse: memory.assistantResponse,
                                            projectName: memory.projectName,
                                            sessionName: memory.sessionName,
                                            agentId: memory.agentId,
                                            timestamp: memory.createdAt,
                                            sequenceNumber: memory.sequenceNumber,
                                            confidenceScore: memory.confidenceScore
                                        }, null, 2)
                                    }
                                ]
                            }];
                }
            });
        });
    };
    /**
     * Start the MCP server
     */
    CBDMCPServer.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var transport;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transport = new stdio_js_1.StdioServerTransport();
                        return [4 /*yield*/, this.server.connect(transport)];
                    case 1:
                        _a.sent();
                        if (this.config.logging.enabled) {
                            console.error('🤖 CBD MCP Server running on stdio');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Stop the MCP server
     */
    CBDMCPServer.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.initialized) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.engine.shutdown()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    return CBDMCPServer;
}());
export const CBDMCPServer = CBDMCPServer;
__exportStar(require("./types.js"), exports);

