// Data processing types\nexport interface DataConfig {\n  vectorSize?: number;\n  embeddingModel?: string;\n  [key: string]: any;\n}\n\n"use strict";
/**
 * CBD Vector Store Implementation
 * High-performance vector storage and similarity search
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
export const InMemoryVectorIndex = export const FaissVectorStore = void 0;
var FaissVectorStore = /** @class */ (function () {
    function FaissVectorStore(dimensions): any {
        if (dimensions === void 0) { dimensions = 1536; }
        this.metadata = new Map();
        this.initialized = false;
        this.dimensions = dimensions;
    }
    FaissVectorStore.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // For now, use the in-memory vector store until FAISS integration is properly set up
                    this.index = new InMemoryVectorIndex(this.dimensions);
                    console.log("\uD83D\uDD0D Initialized in-memory vector store with ".concat(this.dimensions, " dimensions"));
                    this.initialized = true;
                }
                catch (error) {
                    console.error('Failed to initialize vector store:', error);
                    this.index = new InMemoryVectorIndex(this.dimensions);
                    this.initialized = true;
                }
                return [2 /*return*/];
            });
        });
    };
    FaissVectorStore.prototype.addVector = function (id, vector, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.initialized) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (vector.length !== this.dimensions) {
                            throw new Error("Vector dimension mismatch: expected ".concat(this.dimensions, ", got ").concat(vector.length));
                        }
                        try {
                            if (this.index.add) {
                                // FAISS implementation
                                this.index.add(vector);
                            }
                            else {
                                // Fallback implementation
                                this.index.addVector(id, vector);
                            }
                            if (metadata) {
                                this.metadata.set(id, metadata);
                            }
                        }
                        catch (error) {
                            throw new Error("Failed to add vector ".concat(id, ": ").concat(error));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    FaissVectorStore.prototype.searchSimilar = function (queryVector_1) {
        return __awaiter(this, arguments, void 0, function (queryVector, options) {
            var _a, topK, _b, minScore, _c, includeMetadata, results, searchResults_1;
            var _this = this;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!!this.initialized) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initialize()];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2:
                        _a = options.topK, topK = _a === void 0 ? 10 : _a, _b = options.minScore, minScore = _b === void 0 ? 0.0 : _b, _c = options.includeMetadata, includeMetadata = _c === void 0 ? true : _c;
                        if (queryVector.length !== this.dimensions) {
                            throw new Error("Query vector dimension mismatch: expected ".concat(this.dimensions, ", got ").concat(queryVector.length));
                        }
                        try {
                            results = [];
                            if (this.index.search) {
                                searchResults_1 = this.index.search(queryVector, topK);
                                results = searchResults_1.labels.map(function (label, index) { return ({
                                    id: label.toString(),
                                    score: searchResults_1.distances[index],
                                    metadata: includeMetadata ? _this.metadata.get(label.toString()) : undefined
                                }); });
                            }
                            else {
                                // Fallback implementation
                                results = this.index.search(queryVector, topK, minScore);
                                if (includeMetadata) {
                                    results = results.map(function (result) { return (__assign(__assign({}, result), { metadata: _this.metadata.get(result.id) || undefined })); });
                                }
                            }
                            return [2 /*return*/, results.filter(function (r) { return r.score >= minScore; })];
                        }
                        catch (error) {
                            throw new Error("Vector search failed: ".concat(error));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    FaissVectorStore.prototype.removeVector = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.initialized) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        try {
                            this.metadata.delete(id);
                            // Note: FAISS doesn't support easy removal, would need index rebuilding
                            // For now, just remove metadata
                            return [2 /*return*/, true];
                        }
                        catch (error) {
                            console.error("Failed to remove vector ".concat(id, ":"), error);
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    FaissVectorStore.prototype.getVector = function (_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.initialized) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: 
                    // This would require storing vectors separately for retrieval
                    // FAISS doesn't provide easy vector retrieval by ID
                    return [2 /*return*/, null];
                }
            });
        });
    };
    return FaissVectorStore;
}());
export const FaissVectorStore = FaissVectorStore;
/**
 * Fallback in-memory vector store for when FAISS is not available
 */
var InMemoryVectorIndex = /** @class */ (function () {
    function InMemoryVectorIndex(dimensions): any {
        this.vectors = new Map();
        this.dimensions = dimensions;
        console.log("\uD83D\uDCCB Initialized in-memory vector index with ".concat(dimensions, " dimensions"));
    }
    InMemoryVectorIndex.prototype.addVector = function (id, vector) {
        this.vectors.set(id, vector);
    };
    InMemoryVectorIndex.prototype.search = function (queryVector, topK, minScore) {
        if (minScore === void 0) { minScore = 0.0; }
        var results = [];
        for (var _i = 0, _a = this.vectors.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], id = _b[0], vector = _b[1];
            var score = this.cosineSimilarity(queryVector, vector);
            if (score >= minScore) {
                results.push({ id: id, score: score, metadata: undefined });
            }
        }
        return results
            .sort(function (a, b) { return b.score - a.score; })
            .slice(0, topK);
    };
    InMemoryVectorIndex.prototype.cosineSimilarity = function (a, b) {
        if (a.length !== b.length || a.length !== this.dimensions)
            return 0;
        var dotProduct = 0;
        var normA = 0;
        var normB = 0;
        for (var i = 0; i < a.length; i++) {
            var aVal = a[i];
            var bVal = b[i];
            if (aVal !== undefined && bVal !== undefined) {
                dotProduct += aVal * bVal;
                normA += aVal * aVal;
                normB += bVal * bVal;
            }
        }
        if (normA === 0 || normB === 0)
            return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    };
    return InMemoryVectorIndex;
}());
export const InMemoryVectorIndex = InMemoryVectorIndex;

