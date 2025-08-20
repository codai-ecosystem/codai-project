"use strict";
/**
 * CBD (Codai Better Database) Main Export
 * Revolutionary vector-native database system for AI memory storage
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CBD_DESCRIPTION = exports.CBD_VERSION = exports.CBDNativeStorageAdapter = exports.LocalEmbeddingModel = exports.OpenAIEmbeddingModel = exports.InMemoryVectorIndex = exports.FaissVectorStore = exports.CBDMemoryEngine = void 0;
exports.createCBDEngine = createCBDEngine;
exports.validateCBDConfig = validateCBDConfig;
var MemoryEngine_js_1 = require("./memory/MemoryEngine.js");
Object.defineProperty(exports, "CBDMemoryEngine", { enumerable: true, get: function () { return MemoryEngine_js_1.CBDMemoryEngine; } });
var VectorStore_js_1 = require("./vector/VectorStore.js");
Object.defineProperty(exports, "FaissVectorStore", { enumerable: true, get: function () { return VectorStore_js_1.FaissVectorStore; } });
Object.defineProperty(exports, "InMemoryVectorIndex", { enumerable: true, get: function () { return VectorStore_js_1.InMemoryVectorIndex; } });
var EmbeddingService_js_1 = require("./embedding/EmbeddingService.js");
Object.defineProperty(exports, "OpenAIEmbeddingModel", { enumerable: true, get: function () { return EmbeddingService_js_1.OpenAIEmbeddingModel; } });
Object.defineProperty(exports, "LocalEmbeddingModel", { enumerable: true, get: function () { return EmbeddingService_js_1.LocalEmbeddingModel; } });
var CBDNativeStorageAdapter_js_1 = require("./storage/CBDNativeStorageAdapter.js");
Object.defineProperty(exports, "CBDNativeStorageAdapter", { enumerable: true, get: function () { return CBDNativeStorageAdapter_js_1.CBDNativeStorageAdapter; } });
/**
 * Factory function to create a CBD Memory Engine with sensible defaults
 */
function createCBDEngine(config) {
    if (config === void 0) { config = {}; }
    var defaultConfig = {
        storage: {
            type: 'cbd-native',
            dataPath: './cbd-data'
        },
        embedding: {
            model: 'openai',
            apiKey: process.env.OPENAI_API_KEY || undefined,
            modelName: 'text-embedding-ada-002',
            dimensions: 1536
        },
        vector: {
            indexType: 'faiss',
            dimensions: 1536,
            similarityMetric: 'cosine'
        },
        cache: {
            enabled: true,
            maxSize: 1000,
            ttl: 3600000 // 1 hour
        }
    };
    var mergedConfig = __assign(__assign(__assign({}, defaultConfig), config), { storage: __assign(__assign({}, defaultConfig.storage), config.storage), embedding: __assign(__assign({}, defaultConfig.embedding), config.embedding), vector: __assign(__assign({}, defaultConfig.vector), config.vector), cache: __assign(__assign({}, defaultConfig.cache), config.cache) });
    return new (require('./memory/MemoryEngine.js').CBDMemoryEngine)(mergedConfig);
}
/**
 * CBD version and metadata
 */
exports.CBD_VERSION = '1.0.0';
exports.CBD_DESCRIPTION = 'Codai Better Database - Revolutionary vector-native AI memory system';
/**
 * Utility function to validate CBD configuration
 */
function validateCBDConfig(config) {
    var _a, _b, _c, _d, _e;
    var errors = [];
    if (!((_a = config.storage) === null || _a === void 0 ? void 0 : _a.type)) {
        errors.push('Storage type is required');
    }
    if (((_b = config.embedding) === null || _b === void 0 ? void 0 : _b.model) === 'openai' && !config.embedding.apiKey) {
        errors.push('OpenAI API key is required when using OpenAI embedding model');
    }
    if (!((_c = config.vector) === null || _c === void 0 ? void 0 : _c.dimensions) || config.vector.dimensions < 1) {
        errors.push('Vector dimensions must be a positive integer');
    }
    if (((_d = config.embedding) === null || _d === void 0 ? void 0 : _d.dimensions) && ((_e = config.vector) === null || _e === void 0 ? void 0 : _e.dimensions) &&
        config.embedding.dimensions !== config.vector.dimensions) {
        errors.push('Embedding dimensions must match vector dimensions');
    }
    return {
        valid: errors.length === 0,
        errors: errors
    };
}
