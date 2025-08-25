// Data processing types\nexport interface DataConfig {\n  vectorSize?: number;\n  embeddingModel?: string;\n  [key: string]: any;\n}\n\n"use strict";
/**
 * CBD Memory Engine
 * Core engine for conversation exchange management and semantic search
 */
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
export const CBDMemoryEngine = void 0;
var VectorStore_js_1 = require("../vector/VectorStore.js");
var EmbeddingService_js_1 = require("../embedding/EmbeddingService.js");
var CBDNativeStorageAdapter_js_1 = require("../storage/CBDNativeStorageAdapter.js");
var CBDMemoryEngine = /** @class */ (function () {
    function CBDMemoryEngine(config): any {
        this.initialized = false;
        this.config = config;
        this.vectorStore = new VectorStore_js_1.FaissVectorStore(config.vector.dimensions);
        this.storageAdapter = new CBDNativeStorageAdapter_js_1.CBDNativeStorageAdapter(config.storage.dataPath || './cbd-data');
        // Initialize embedding model based on config
        if (config.embedding.model === 'openai') {
            this.embeddingModel = new EmbeddingService_js_1.OpenAIEmbeddingModel(config.embedding.apiKey, config.embedding.modelName);
        }
        else {
            this.embeddingModel = new EmbeddingService_js_1.LocalEmbeddingModel(config.embedding.modelName || 'sentence-transformers/all-MiniLM-L6-v2');
        }
    }
    /**
     * Initialize the CBD engine
     */
    CBDMemoryEngine.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.initialized)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.vectorStore.initialize()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.storageAdapter.connect()];
                    case 3:
                        _a.sent();
                        console.log('🚀 CBD Memory Engine initialized successfully');
                        this.initialized = true;
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        throw new Error("Failed to initialize CBD Memory Engine: ".concat(error_1));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * HPKV API: Store a conversation exchange
     */
    CBDMemoryEngine.prototype.store_memory = function (userRequest, assistantResponse, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var now, dateStr, sequence, _a, structuredKey, exchange, combinedContent, embedding, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.ensureInitialized()];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 8, , 9]);
                        now = new Date();
                        dateStr = now.toISOString().split('T')[0];
                        _a = metadata.sequenceNumber;
                        if (_a) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.getNextSequenceNumber(metadata.projectName, metadata.sessionName)];
                    case 3:
                        _a = (_b.sent());
                        _b.label = 4;
                    case 4:
                        sequence = _a;
                        structuredKey = "".concat(metadata.projectName, "_").concat(dateStr, "_").concat(metadata.sessionName, "_").concat(sequence);
                        exchange = {
                            structuredKey: structuredKey,
                            projectName: metadata.projectName,
                            sessionName: metadata.sessionName,
                            sequenceNumber: sequence,
                            agentId: metadata.agentId,
                            userRequest: userRequest,
                            assistantResponse: assistantResponse,
                            conversationContext: this.buildConversationContext(userRequest, assistantResponse),
                            metadata: metadata,
                            confidenceScore: 0.8, // Default confidence
                            createdAt: now,
                            updatedAt: now
                        };
                        combinedContent = "".concat(userRequest, " ").concat(assistantResponse);
                        return [4 /*yield*/, this.embeddingModel.generateEmbedding(combinedContent)];
                    case 5:
                        embedding = _b.sent();
                        exchange.vectorEmbedding = embedding;
                        // Store in vector index
                        return [4 /*yield*/, this.vectorStore.addVector(structuredKey, embedding, {
                                projectName: metadata.projectName,
                                sessionName: metadata.sessionName,
                                agentId: metadata.agentId,
                                confidence: exchange.confidenceScore,
                                timestamp: now.getTime()
                            })];
                    case 6:
                        // Store in vector index
                        _b.sent();
                        // Store in persistent storage
                        return [4 /*yield*/, this.storageAdapter.storeConversation(exchange)];
                    case 7:
                        // Store in persistent storage
                        _b.sent();
                        console.log("\uD83D\uDCBE Stored conversation: ".concat(structuredKey));
                        return [2 /*return*/, structuredKey];
                    case 8:
                        error_2 = _b.sent();
                        throw new Error("Failed to store memory: ".concat(error_2));
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * HPKV API: Semantic search with AI-powered summarization
     */
    CBDMemoryEngine.prototype.search_memory = function (query_1) {
        return __awaiter(this, arguments, void 0, function (query, limit, confidenceThreshold) {
            var queryEmbedding, vectorResults, memories, _i, _a, result, exchange, summary, error_3;
            if (limit === void 0) { limit = 10; }
            if (confidenceThreshold === void 0) { confidenceThreshold = 0.5; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.ensureInitialized()];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 10, , 11]);
                        return [4 /*yield*/, this.embeddingModel.generateEmbedding(query)];
                    case 3:
                        queryEmbedding = _b.sent();
                        return [4 /*yield*/, this.vectorStore.searchSimilar(queryEmbedding, {
                                topK: limit * 2, // Get more candidates for filtering
                                minScore: confidenceThreshold,
                                includeMetadata: true
                            })];
                    case 4:
                        vectorResults = _b.sent();
                        memories = [];
                        _i = 0, _a = vectorResults.slice(0, limit);
                        _b.label = 5;
                    case 5:
                        if (!(_i < _a.length)) return [3 /*break*/, 8];
                        result = _a[_i];
                        return [4 /*yield*/, this.storageAdapter.getConversation(result.id)];
                    case 6:
                        exchange = _b.sent();
                        if (exchange) {
                            memories.push({
                                memory: exchange,
                                relevanceScore: result.score,
                                confidence: exchange.confidenceScore
                            });
                        }
                        _b.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 5];
                    case 8: return [4 /*yield*/, this.generateMemorySummary(query, memories)];
                    case 9:
                        summary = _b.sent();
                        return [2 /*return*/, { summary: summary, memories: memories }];
                    case 10:
                        error_3 = _b.sent();
                        throw new Error("Memory search failed: ".concat(error_3));
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * HPKV API: Search for memory keys using vector similarity
     */
    CBDMemoryEngine.prototype.search_keys = function (query_1) {
        return __awaiter(this, arguments, void 0, function (query, topK, minScore) {
            var queryEmbedding, results, error_4;
            if (topK === void 0) { topK = 10; }
            if (minScore === void 0) { minScore = 0.3; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureInitialized()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, this.embeddingModel.generateEmbedding(query)];
                    case 3:
                        queryEmbedding = _a.sent();
                        return [4 /*yield*/, this.vectorStore.searchSimilar(queryEmbedding, {
                                topK: topK,
                                minScore: minScore,
                                includeMetadata: true
                            })];
                    case 4:
                        results = _a.sent();
                        return [2 /*return*/, results.map(function (r) { return ({
                                key: r.id,
                                score: r.score,
                                metadata: r.metadata
                            }); })];
                    case 5:
                        error_4 = _a.sent();
                        throw new Error("Key search failed: ".concat(error_4));
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * HPKV API: Get memory by exact structured key
     */
    CBDMemoryEngine.prototype.get_memory = function (structuredKey) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureInitialized()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.storageAdapter.getConversation(structuredKey)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        error_5 = _a.sent();
                        throw new Error("Failed to get memory ".concat(structuredKey, ": ").concat(error_5));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Migration utility: Import existing memories with vector generation
     */
    CBDMemoryEngine.prototype.migrateFromLegacy = function (legacyMemories) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, _b, index, memory, userRequest, assistantResponse, keyParts, metadata, error_6;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.ensureInitialized()];
                    case 1:
                        _d.sent();
                        console.log("\uD83D\uDD04 Migrating ".concat(legacyMemories.length, " legacy memories to CBD..."));
                        _i = 0, _a = legacyMemories.entries();
                        _d.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 8];
                        _b = _a[_i], index = _b[0], memory = _b[1];
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 6, , 7]);
                        userRequest = memory.user_request || memory.content || '';
                        assistantResponse = memory.assistant_response || memory.response || '';
                        keyParts = ((_c = memory.structured_key) === null || _c === void 0 ? void 0 : _c.split('_')) || [];
                        metadata = {
                            projectName: keyParts[0] || 'legacy',
                            sessionName: keyParts[2] || 'imported',
                            agentId: memory.agent_id || 'system',
                            sequenceNumber: parseInt(keyParts[3]) || index + 1,
                            importedFrom: 'legacy',
                            originalKey: memory.structured_key
                        };
                        if (!(userRequest && assistantResponse)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.store_memory(userRequest, assistantResponse, metadata)];
                    case 4:
                        _d.sent();
                        _d.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_6 = _d.sent();
                        console.error("Failed to migrate memory ".concat(memory.structured_key || index, ":"), error_6);
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 2];
                    case 8:
                        console.log('✅ Legacy memory migration completed');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Private helper methods
     */
    CBDMemoryEngine.prototype.ensureInitialized = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.initialized) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    CBDMemoryEngine.prototype.getNextSequenceNumber = function (projectName, sessionName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.storageAdapter.getNextSequenceNumber(projectName, sessionName)];
                    case 1: 
                    // Use storage adapter to get the next sequence number
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    CBDMemoryEngine.prototype.buildConversationContext = function (userRequest, assistantResponse) {
        return "User: ".concat(userRequest, "\n\nAssistant: ").concat(assistantResponse);
    };
    CBDMemoryEngine.prototype.generateMemorySummary = function (query, memories) {
        return __awaiter(this, void 0, void 0, function () {
            var memoryContents, summary, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (memories.length === 0) {
                            return [2 /*return*/, {
                                    summary: 'No relevant memories found.',
                                    sourceMemories: [],
                                    confidenceScore: 0.0,
                                    relevantTopics: []
                                }];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        memoryContents = memories.map(function (m) {
                            return "".concat(m.memory.userRequest, "\n").concat(m.memory.assistantResponse);
                        }).join('\n\n---\n\n');
                        summary = void 0;
                        if (!(this.config.embedding.model === 'openai' && this.config.embedding.apiKey)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.generateAISummary(query, memoryContents)];
                    case 2:
                        summary = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        summary = this.generateSimpleSummary(memories);
                        _a.label = 4;
                    case 4: return [2 /*return*/, {
                            summary: summary,
                            sourceMemories: memories.map(function (m) { return m.memory.structuredKey; }),
                            confidenceScore: memories.reduce(function (acc, m) { return acc + m.relevanceScore; }, 0) / memories.length,
                            relevantTopics: this.extractTopics(memories)
                        }];
                    case 5:
                        error_7 = _a.sent();
                        console.error('Failed to generate memory summary:', error_7);
                        return [2 /*return*/, {
                                summary: "Found ".concat(memories.length, " relevant memories related to: ").concat(query),
                                sourceMemories: memories.map(function (m) { return m.memory.structuredKey; }),
                                confidenceScore: 0.5,
                                relevantTopics: []
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    CBDMemoryEngine.prototype.generateAISummary = function (query, content) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, error_8;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch('https://api.openai.com/v1/chat/completions', {
                                method: 'POST',
                                headers: {
                                    'Authorization': "Bearer ".concat(this.config.embedding.apiKey),
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    model: 'gpt-4o-mini',
                                    messages: [
                                        {
                                            role: 'system',
                                            content: 'You are a memory summarization assistant. Create concise, relevant summaries of conversation memories based on user queries.'
                                        },
                                        {
                                            role: 'user',
                                            content: "Query: \"".concat(query, "\"\n\nRelevant memories:\n").concat(content, "\n\nProvide a concise summary of the most relevant information from these memories that answers or relates to the query.")
                                        }
                                    ],
                                    max_tokens: 300,
                                    temperature: 0.3
                                })
                            })];
                    case 1:
                        response = _c.sent();
                        if (!response.ok) {
                            throw new Error("OpenAI API error: ".concat(response.status));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _c.sent();
                        return [2 /*return*/, ((_b = (_a = data.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || 'Summary generation failed.'];
                    case 3:
                        error_8 = _c.sent();
                        console.error('AI summary generation failed:', error_8);
                        return [2 /*return*/, "Summary of ".concat(query, ": Multiple relevant memories found covering related topics and discussions.")];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CBDMemoryEngine.prototype.generateSimpleSummary = function (memories) {
        var topics = this.extractTopics(memories);
        var projects = __spreadArray([], new Set(memories.map(function (m) { return m.memory.projectName; })), true);
        return "Found ".concat(memories.length, " relevant memories across ").concat(projects.length, " project(s). Key topics include: ").concat(topics.join(', '), ".");
    };
    CBDMemoryEngine.prototype.extractTopics = function (memories) {
        // Simple topic extraction - in a real implementation, this could use NLP
        var allText = memories.map(function (m) {
            return "".concat(m.memory.userRequest, " ").concat(m.memory.assistantResponse);
        }).join(' ').toLowerCase();
        var commonWords = ['function', 'class', 'method', 'variable', 'code', 'implementation',
            'database', 'api', 'service', 'component', 'system', 'error', 'bug'];
        return commonWords.filter(function (word) { return allText.includes(word); }).slice(0, 5);
    };
    /**
     * Cleanup and shutdown
     */
    CBDMemoryEngine.prototype.shutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.storageAdapter) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.storageAdapter.disconnect()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.initialized = false;
                        console.log('🛑 CBD Memory Engine shut down');
                        return [2 /*return*/];
                }
            });
        });
    };
    return CBDMemoryEngine;
}());
export const CBDMemoryEngine = CBDMemoryEngine;

