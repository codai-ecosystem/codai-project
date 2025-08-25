// Module configuration\nexport interface ModuleConfig {\n  [key: string]: any;\n}\n\n"use strict";
/**
 * CBD Native Storage Adapter
 * Pure binary storage implementation - no SQL
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
export const CBDNativeStorageAdapter = void 0;
var fs_1 = require("fs");
var path_1 = require("path");
var CBDNativeStorageAdapter = /** @class */ (function () {
    function CBDNativeStorageAdapter(dataPath): any {
        if (dataPath === void 0) { dataPath = './cbd-data'; }
        this.header = null;
        this.indexCache = new Map(); // key -> file position
        this.connected = false;
        this.dataPath = dataPath;
    }
    CBDNativeStorageAdapter.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        // Create data directory structure
                        return [4 /*yield*/, fs_1.promises.mkdir(this.dataPath, { recursive: true })];
                    case 1:
                        // Create data directory structure
                        _a.sent();
                        return [4 /*yield*/, fs_1.promises.mkdir((0, path_1.join)(this.dataPath, 'records'), { recursive: true })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, fs_1.promises.mkdir((0, path_1.join)(this.dataPath, 'indexes'), { recursive: true })];
                    case 3:
                        _a.sent();
                        // Load or create header
                        return [4 /*yield*/, this.loadHeader()];
                    case 4:
                        // Load or create header
                        _a.sent();
                        // Build index cache
                        return [4 /*yield*/, this.buildIndexCache()];
                    case 5:
                        // Build index cache
                        _a.sent();
                        this.connected = true;
                        console.log("\uD83D\uDCC1 Connected to CBD native storage: ".concat(this.dataPath));
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        throw new Error("Failed to connect to CBD storage: ".concat(error_1));
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    CBDNativeStorageAdapter.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.connected) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.saveHeader()];
                    case 1:
                        _a.sent();
                        this.connected = false;
                        console.log('📁 CBD storage connection closed');
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    CBDNativeStorageAdapter.prototype.storeConversation = function (exchange) {
        return __awaiter(this, void 0, void 0, function () {
            var record, recordsFile, position, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.connected)
                            throw new Error('Storage not connected');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        record = this.serializeExchange(exchange);
                        recordsFile = (0, path_1.join)(this.dataPath, 'records', 'data.cbd');
                        return [4 /*yield*/, this.appendToFile(recordsFile, record)];
                    case 2:
                        position = _a.sent();
                        // Update index
                        this.indexCache.set(exchange.structuredKey, position);
                        return [4 /*yield*/, this.updateIndex(exchange.structuredKey, position)];
                    case 3:
                        _a.sent();
                        if (!this.header) return [3 /*break*/, 5];
                        this.header.recordCount++;
                        this.header.updated = Date.now();
                        return [4 /*yield*/, this.saveHeader()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/, exchange.structuredKey];
                    case 6:
                        error_2 = _a.sent();
                        throw new Error("Failed to store conversation: ".concat(error_2));
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    CBDNativeStorageAdapter.prototype.getConversation = function (structuredKey) {
        return __awaiter(this, void 0, void 0, function () {
            var position, recordsFile, record, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.connected)
                            throw new Error('Storage not connected');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        position = this.indexCache.get(structuredKey);
                        if (position === undefined)
                            return [2 /*return*/, null];
                        recordsFile = (0, path_1.join)(this.dataPath, 'records', 'data.cbd');
                        return [4 /*yield*/, this.readFromFile(recordsFile, position)];
                    case 2:
                        record = _a.sent();
                        return [2 /*return*/, this.deserializeExchange(record)];
                    case 3:
                        error_3 = _a.sent();
                        console.error("Failed to get conversation ".concat(structuredKey, ":"), error_3);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CBDNativeStorageAdapter.prototype.searchConversations = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, _a, _b, position, recordsFile, record, exchange, error_4;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.connected)
                            throw new Error('Storage not connected');
                        results = [];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 6, , 7]);
                        _i = 0, _a = this.indexCache;
                        _c.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        _b = _a[_i], position = _b[1];
                        if (results.length >= (query.limit || 50))
                            return [3 /*break*/, 5];
                        recordsFile = (0, path_1.join)(this.dataPath, 'records', 'data.cbd');
                        return [4 /*yield*/, this.readFromFile(recordsFile, position)];
                    case 3:
                        record = _c.sent();
                        exchange = this.deserializeExchange(record);
                        if (this.matchesQuery(exchange, query)) {
                            results.push(exchange);
                        }
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, results];
                    case 6:
                        error_4 = _c.sent();
                        throw new Error("Search failed: ".concat(error_4));
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    CBDNativeStorageAdapter.prototype.updateConversation = function (structuredKey, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, updated, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.connected)
                            throw new Error('Storage not connected');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.getConversation(structuredKey)];
                    case 2:
                        existing = _a.sent();
                        if (!existing)
                            return [2 /*return*/, false];
                        updated = __assign(__assign(__assign({}, existing), updates), { updatedAt: new Date() });
                        return [4 /*yield*/, this.storeConversation(updated)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 4:
                        error_5 = _a.sent();
                        console.error("Failed to update conversation ".concat(structuredKey, ":"), error_5);
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    CBDNativeStorageAdapter.prototype.deleteConversation = function (structuredKey) {
        return __awaiter(this, void 0, void 0, function () {
            var existed, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.connected)
                            throw new Error('Storage not connected');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        existed = this.indexCache.has(structuredKey);
                        if (!existed) return [3 /*break*/, 4];
                        this.indexCache.delete(structuredKey);
                        return [4 /*yield*/, this.updateIndex(structuredKey, -1)];
                    case 2:
                        _a.sent(); // Mark as deleted
                        if (!this.header) return [3 /*break*/, 4];
                        this.header.recordCount--;
                        this.header.updated = Date.now();
                        return [4 /*yield*/, this.saveHeader()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, existed];
                    case 5:
                        error_6 = _a.sent();
                        console.error("Failed to delete conversation ".concat(structuredKey, ":"), error_6);
                        return [2 /*return*/, false];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    CBDNativeStorageAdapter.prototype.getStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var projects, sessions, agents, totalConfidence, count, _i, _a, _b, position, recordsFile, record, exchange, error_7, error_8;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!this.connected)
                            throw new Error('Storage not connected');
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 8, , 9]);
                        projects = new Set();
                        sessions = new Set();
                        agents = new Set();
                        totalConfidence = 0;
                        count = 0;
                        _i = 0, _a = this.indexCache;
                        _e.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        _b = _a[_i], position = _b[1];
                        _e.label = 3;
                    case 3:
                        _e.trys.push([3, 5, , 6]);
                        recordsFile = (0, path_1.join)(this.dataPath, 'records', 'data.cbd');
                        return [4 /*yield*/, this.readFromFile(recordsFile, position)];
                    case 4:
                        record = _e.sent();
                        exchange = this.deserializeExchange(record);
                        projects.add(exchange.projectName);
                        sessions.add(exchange.sessionName);
                        agents.add(exchange.agentId);
                        totalConfidence += exchange.confidenceScore;
                        count++;
                        return [3 /*break*/, 6];
                    case 5:
                        error_7 = _e.sent();
                        // Skip corrupted records
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [2 /*return*/, {
                            totalMemories: ((_c = this.header) === null || _c === void 0 ? void 0 : _c.recordCount) || 0,
                            uniqueAgents: agents.size,
                            uniqueProjects: projects.size,
                            uniqueSessions: sessions.size,
                            averageConfidence: count > 0 ? totalConfidence / count : 0,
                            databaseSize: 0, // Would need to calculate file sizes
                            lastUpdated: new Date(((_d = this.header) === null || _d === void 0 ? void 0 : _d.updated) || Date.now())
                        }];
                    case 8:
                        error_8 = _e.sent();
                        throw new Error("Failed to get stats: ".concat(error_8));
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    CBDNativeStorageAdapter.prototype.getNextSequenceNumber = function (projectName, sessionName) {
        return __awaiter(this, void 0, void 0, function () {
            var maxSequence, _i, _a, key, keyParts, sequenceStr, sequence;
            return __generator(this, function (_b) {
                if (!this.connected)
                    throw new Error('Storage not connected');
                maxSequence = 0;
                // Scan existing records to find max sequence
                for (_i = 0, _a = this.indexCache; _i < _a.length; _i++) {
                    key = _a[_i][0];
                    keyParts = key.split('_');
                    if (keyParts.length >= 4 && keyParts[0] === projectName && keyParts[2] === sessionName) {
                        sequenceStr = keyParts[3];
                        if (sequenceStr) {
                            sequence = parseInt(sequenceStr);
                            if (!isNaN(sequence) && sequence > maxSequence) {
                                maxSequence = sequence;
                            }
                        }
                    }
                }
                return [2 /*return*/, maxSequence + 1];
            });
        });
    };
    // Private implementation methods
    CBDNativeStorageAdapter.prototype.loadHeader = function () {
        return __awaiter(this, void 0, void 0, function () {
            var headerFile, data, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        headerFile = (0, path_1.join)(this.dataPath, 'header.cbd');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 5]);
                        return [4 /*yield*/, fs_1.promises.readFile(headerFile)];
                    case 2:
                        data = _a.sent();
                        this.header = this.deserializeHeader(data);
                        return [3 /*break*/, 5];
                    case 3:
                        error_9 = _a.sent();
                        // Create new header if file doesn't exist
                        this.header = {
                            version: 1,
                            recordCount: 0,
                            lastSequence: 0,
                            created: Date.now(),
                            updated: Date.now()
                        };
                        return [4 /*yield*/, this.saveHeader()];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    CBDNativeStorageAdapter.prototype.saveHeader = function () {
        return __awaiter(this, void 0, void 0, function () {
            var headerFile, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.header)
                            return [2 /*return*/];
                        headerFile = (0, path_1.join)(this.dataPath, 'header.cbd');
                        data = this.serializeHeader(this.header);
                        return [4 /*yield*/, fs_1.promises.writeFile(headerFile, data)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CBDNativeStorageAdapter.prototype.buildIndexCache = function () {
        return __awaiter(this, void 0, void 0, function () {
            var indexFile, data, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        indexFile = (0, path_1.join)(this.dataPath, 'indexes', 'main.idx');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs_1.promises.readFile(indexFile)];
                    case 2:
                        data = _a.sent();
                        this.indexCache = this.deserializeIndex(data);
                        return [3 /*break*/, 4];
                    case 3:
                        error_10 = _a.sent();
                        // Index file doesn't exist, start fresh
                        this.indexCache = new Map();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CBDNativeStorageAdapter.prototype.updateIndex = function (key, position) {
        return __awaiter(this, void 0, void 0, function () {
            var indexFile, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        indexFile = (0, path_1.join)(this.dataPath, 'indexes', 'main.idx');
                        if (position === -1) {
                            this.indexCache.delete(key);
                        }
                        else {
                            this.indexCache.set(key, position);
                        }
                        data = this.serializeIndex(this.indexCache);
                        return [4 /*yield*/, fs_1.promises.writeFile(indexFile, data)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CBDNativeStorageAdapter.prototype.serializeExchange = function (exchange) {
        var data = {
            structuredKey: exchange.structuredKey,
            projectName: exchange.projectName,
            sessionName: exchange.sessionName,
            sequenceNumber: exchange.sequenceNumber,
            agentId: exchange.agentId,
            userRequest: exchange.userRequest,
            assistantResponse: exchange.assistantResponse,
            conversationContext: exchange.conversationContext,
            metadata: exchange.metadata,
            vectorEmbedding: exchange.vectorEmbedding ? Array.from(exchange.vectorEmbedding) : null,
            confidenceScore: exchange.confidenceScore,
            createdAt: exchange.createdAt.getTime(),
            updatedAt: exchange.updatedAt.getTime()
        };
        var json = JSON.stringify(data);
        var jsonBuffer = Buffer.from(json, 'utf8');
        var lengthBuffer = Buffer.allocUnsafe(4);
        lengthBuffer.writeUInt32BE(jsonBuffer.length, 0);
        return Buffer.concat([lengthBuffer, jsonBuffer]);
    };
    CBDNativeStorageAdapter.prototype.deserializeExchange = function (data) {
        var json = data.toString('utf8');
        var parsed = JSON.parse(json);
        return {
            id: parsed.id,
            structuredKey: parsed.structuredKey,
            projectName: parsed.projectName,
            sessionName: parsed.sessionName,
            sequenceNumber: parsed.sequenceNumber,
            agentId: parsed.agentId,
            userRequest: parsed.userRequest,
            assistantResponse: parsed.assistantResponse,
            conversationContext: parsed.conversationContext || undefined,
            metadata: parsed.metadata,
            vectorEmbedding: parsed.vectorEmbedding ? new Float32Array(parsed.vectorEmbedding) : undefined,
            confidenceScore: parsed.confidenceScore,
            createdAt: new Date(parsed.createdAt),
            updatedAt: new Date(parsed.updatedAt)
        };
    };
    CBDNativeStorageAdapter.prototype.serializeHeader = function (header) {
        var buffer = Buffer.allocUnsafe(24); // 5 * 4 + 4 bytes padding
        buffer.writeUInt32BE(header.version, 0);
        buffer.writeUInt32BE(header.recordCount, 4);
        buffer.writeUInt32BE(header.lastSequence, 8);
        buffer.writeBigUInt64BE(BigInt(header.created), 12);
        buffer.writeBigUInt64BE(BigInt(header.updated), 20);
        return buffer;
    };
    CBDNativeStorageAdapter.prototype.deserializeHeader = function (data) {
        return {
            version: data.readUInt32BE(0),
            recordCount: data.readUInt32BE(4),
            lastSequence: data.readUInt32BE(8),
            created: Number(data.readBigUInt64BE(12)),
            updated: Number(data.readBigUInt64BE(20))
        };
    };
    CBDNativeStorageAdapter.prototype.serializeIndex = function (index) {
        var entries = Array.from(index.entries());
        var data = JSON.stringify(entries);
        return Buffer.from(data, 'utf8');
    };
    CBDNativeStorageAdapter.prototype.deserializeIndex = function (data) {
        var json = data.toString('utf8');
        var entries = JSON.parse(json);
        return new Map(entries);
    };
    CBDNativeStorageAdapter.prototype.appendToFile = function (filePath, data) {
        return __awaiter(this, void 0, void 0, function () {
            var position, stat, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        position = 0;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs_1.promises.stat(filePath)];
                    case 2:
                        stat = _a.sent();
                        position = stat.size;
                        return [3 /*break*/, 4];
                    case 3:
                        error_11 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4: return [4 /*yield*/, fs_1.promises.appendFile(filePath, data)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, position];
                }
            });
        });
    };
    CBDNativeStorageAdapter.prototype.readFromFile = function (filePath, position) {
        return __awaiter(this, void 0, void 0, function () {
            var fd, lengthBuffer, length_1, dataBuffer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs_1.promises.open(filePath, 'r')];
                    case 1:
                        fd = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 5, 7]);
                        lengthBuffer = Buffer.allocUnsafe(4);
                        return [4 /*yield*/, fd.read(lengthBuffer, 0, 4, position)];
                    case 3:
                        _a.sent();
                        length_1 = lengthBuffer.readUInt32BE(0);
                        dataBuffer = Buffer.allocUnsafe(length_1);
                        return [4 /*yield*/, fd.read(dataBuffer, 0, length_1, position + 4)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, dataBuffer];
                    case 5: return [4 /*yield*/, fd.close()];
                    case 6:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    CBDNativeStorageAdapter.prototype.matchesQuery = function (exchange, query) {
        // Simple text matching - in production would use more sophisticated matching
        if (query.query) {
            var searchText = "".concat(exchange.userRequest, " ").concat(exchange.assistantResponse).toLowerCase();
            if (!searchText.includes(query.query.toLowerCase())) {
                return false;
            }
        }
        if (query.projectFilter && exchange.projectName !== query.projectFilter) {
            return false;
        }
        if (query.sessionFilter && exchange.sessionName !== query.sessionFilter) {
            return false;
        }
        if (query.agentFilter && exchange.agentId !== query.agentFilter) {
            return false;
        }
        if (query.confidenceThreshold && exchange.confidenceScore < query.confidenceThreshold) {
            return false;
        }
        if (query.timeRange) {
            if (exchange.createdAt < query.timeRange.start || exchange.createdAt > query.timeRange.end) {
                return false;
            }
        }
        return true;
    };
    return CBDNativeStorageAdapter;
}());
export const CBDNativeStorageAdapter = CBDNativeStorageAdapter;

