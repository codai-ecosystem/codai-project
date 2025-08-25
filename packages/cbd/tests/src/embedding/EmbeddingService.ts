// Data processing types\nexport interface DataConfig {\n  vectorSize?: number;\n  embeddingModel?: string;\n  [key: string]: any;\n}\n\n"use strict";
/**
 * CBD Embedding Service
 * Supports multiple embedding models (OpenAI, local, custom)
 */
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
export const EmbeddingService = export const LocalEmbeddingModel = export const OpenAIEmbeddingModel = void 0;
var OpenAIEmbeddingModel = /** @class */ (function () {
    function OpenAIEmbeddingModel(apiKey, modelName): any {
        if (modelName === void 0) { modelName = 'text-embedding-ada-002'; }
        this.name = 'openai';
        this.dimensions = 1536;
        this.apiKey = apiKey;
        this.modelName = modelName;
    }
    OpenAIEmbeddingModel.prototype.generateEmbedding = function (text) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch('https://api.openai.com/v1/embeddings', {
                                method: 'POST',
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey),
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    input: text,
                                    model: this.modelName
                                })
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("OpenAI API error: ".concat(response.status, " ").concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, new Float32Array(data.data[0].embedding)];
                    case 3:
                        error_1 = _a.sent();
                        throw new Error("Failed to generate OpenAI embedding: ".concat(error_1));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    OpenAIEmbeddingModel.prototype.generateBatchEmbeddings = function (texts) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (texts.length === 0)
                            return [2 /*return*/, []];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch('https://api.openai.com/v1/embeddings', {
                                method: 'POST',
                                headers: {
                                    'Authorization': "Bearer ".concat(this.apiKey),
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    input: texts,
                                    model: this.modelName
                                })
                            })];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("OpenAI API error: ".concat(response.status, " ").concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _a.sent();
                        return [2 /*return*/, data.data.map(function (item) { return new Float32Array(item.embedding); })];
                    case 4:
                        error_2 = _a.sent();
                        throw new Error("Failed to generate batch OpenAI embeddings: ".concat(error_2));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return OpenAIEmbeddingModel;
}());
export const OpenAIEmbeddingModel = OpenAIEmbeddingModel;
var LocalEmbeddingModel = /** @class */ (function () {
    function LocalEmbeddingModel(modelName): any {
        if (modelName === void 0) { modelName = 'Xenova/all-MiniLM-L6-v2'; }
        this.name = 'local';
        this.dimensions = 384; // Default for sentence-transformers/all-MiniLM-L6-v2
        this.initialized = false;
        this.modelName = modelName;
    }
    LocalEmbeddingModel.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pipeline, _a, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.initialized)
                            return [2 /*return*/];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('@xenova/transformers')); })];
                    case 2:
                        pipeline = (_b.sent()).pipeline;
                        _a = this;
                        return [4 /*yield*/, pipeline('feature-extraction', this.modelName)];
                    case 3:
                        _a.pipeline = _b.sent();
                        this.initialized = true;
                        console.log("\uD83E\uDD16 Initialized local embedding model: ".concat(this.modelName));
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _b.sent();
                        throw new Error("Failed to initialize local embedding model: ".concat(error_3));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    LocalEmbeddingModel.prototype.generateEmbedding = function (text) {
        return __awaiter(this, void 0, void 0, function () {
            var output, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.initialized) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.pipeline(text, { pooling: 'mean', normalize: true })];
                    case 3:
                        output = _a.sent();
                        return [2 /*return*/, new Float32Array(output.data)];
                    case 4:
                        error_4 = _a.sent();
                        throw new Error("Failed to generate local embedding: ".concat(error_4));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    LocalEmbeddingModel.prototype.generateBatchEmbeddings = function (texts) {
        return __awaiter(this, void 0, void 0, function () {
            var results, error_5;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.initialized) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (texts.length === 0)
                            return [2 /*return*/, []];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, Promise.all(texts.map(function (text) { return _this.generateEmbedding(text); }))];
                    case 4:
                        results = _a.sent();
                        return [2 /*return*/, results];
                    case 5:
                        error_5 = _a.sent();
                        throw new Error("Failed to generate batch local embeddings: ".concat(error_5));
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return LocalEmbeddingModel;
}());
export const LocalEmbeddingModel = LocalEmbeddingModel;
var EmbeddingService = /** @class */ (function () {
    function EmbeddingService(model): any {
        this.model = model;
    }
    EmbeddingService.prototype.generateEmbedding = function (text) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.model.generateEmbedding(text)];
            });
        });
    };
    EmbeddingService.prototype.generateBatchEmbeddings = function (texts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.model.generateBatchEmbeddings(texts)];
            });
        });
    };
    EmbeddingService.prototype.generateConversationEmbedding = function (userRequest, assistantResponse) {
        return __awaiter(this, void 0, void 0, function () {
            var conversationText;
            return __generator(this, function (_a) {
                conversationText = "User: ".concat(userRequest, "\nAssistant: ").concat(assistantResponse);
                return [2 /*return*/, this.generateEmbedding(conversationText)];
            });
        });
    };
    EmbeddingService.prototype.getDimensions = function () {
        return this.model.dimensions;
    };
    EmbeddingService.prototype.getModelName = function () {
        return this.model.name;
    };
    EmbeddingService.createFromConfig = function (config) {
        switch (config.type) {
            case 'openai':
                if (!config.apiKey) {
                    throw new Error('OpenAI API key required for OpenAI embedding model');
                }
                return new EmbeddingService(new OpenAIEmbeddingModel(config.apiKey, config.modelName));
            case 'local':
                return new EmbeddingService(new LocalEmbeddingModel(config.modelName));
            default:
                throw new Error("Unsupported embedding model type: ".concat(config.type));
        }
    };
    return EmbeddingService;
}());
export const EmbeddingService = EmbeddingService;

