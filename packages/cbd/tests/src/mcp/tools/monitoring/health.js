"use strict";
/*!
 * CBD MCP Health Check Tool
 * Provides system health status and dependency checks
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
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
exports.healthCheck = healthCheck;
exports.quickHealthCheck = quickHealthCheck;
/**
 * Perform comprehensive health check of CBD MCP server
 */
function healthCheck(engine, config) {
    return __awaiter(this, void 0, void 0, function () {
        var startTime, checks, error_1, memUsage, memoryUsagePercentage, perfStart, responseTime, error_2, configErrors, allChecks, failedChecks, warnChecks, overallStatus, dbStats, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    startTime = Date.now();
                    checks = {};
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    // Try a simple search to test the engine
                    return [4 /*yield*/, engine.search_memory('health_check_test', 1)];
                case 2:
                    // Try a simple search to test the engine
                    _b.sent();
                    checks.database = {
                        status: 'pass',
                        message: "CBD Memory Engine is responsive",
                        timestamp: Date.now(),
                    };
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    checks.database = {
                        status: 'fail',
                        message: "Database connection failed: ".concat((error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || 'Unknown error'),
                        timestamp: Date.now(),
                    };
                    return [3 /*break*/, 4];
                case 4:
                    memUsage = process.memoryUsage();
                    memoryUsagePercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;
                    checks.memory = {
                        status: memoryUsagePercentage < 80 ? 'pass' : memoryUsagePercentage < 95 ? 'warn' : 'fail',
                        message: "Heap usage: ".concat(Math.round(memoryUsagePercentage), "% (").concat(Math.round(memUsage.heapUsed / 1024 / 1024), "MB)"),
                        timestamp: Date.now(),
                    };
                    perfStart = Date.now();
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, engine.search_memory('performance_test', 1)];
                case 6:
                    _b.sent();
                    responseTime = Date.now() - perfStart;
                    checks.performance = {
                        status: responseTime < 100 ? 'pass' : responseTime < 500 ? 'warn' : 'fail',
                        message: "Response time: ".concat(responseTime, "ms"),
                        timestamp: Date.now(),
                    };
                    return [3 /*break*/, 8];
                case 7:
                    error_2 = _b.sent();
                    checks.performance = {
                        status: 'fail',
                        message: "Performance check failed: ".concat((error_2 === null || error_2 === void 0 ? void 0 : error_2.message) || 'Unknown error'),
                        timestamp: Date.now(),
                    };
                    return [3 /*break*/, 8];
                case 8:
                    // Configuration validation check
                    try {
                        configErrors = validateHealthConfig(config);
                        checks.configuration = {
                            status: configErrors.length === 0 ? 'pass' : 'warn',
                            message: configErrors.length === 0 ? 'Configuration valid' : "Configuration issues: ".concat(configErrors.join(', ')),
                            timestamp: Date.now(),
                        };
                    }
                    catch (error) {
                        checks.configuration = {
                            status: 'fail',
                            message: "Configuration check failed: ".concat((error === null || error === void 0 ? void 0 : error.message) || 'Unknown error'),
                            timestamp: Date.now(),
                        };
                    }
                    allChecks = Object.values(checks);
                    failedChecks = allChecks.filter(function (check) { return check.status === 'fail'; });
                    warnChecks = allChecks.filter(function (check) { return check.status === 'warn'; });
                    if (failedChecks.length > 0) {
                        overallStatus = 'unhealthy';
                    }
                    else if (warnChecks.length > 0) {
                        overallStatus = 'degraded';
                    }
                    else {
                        overallStatus = 'healthy';
                    }
                    dbStats = { totalExchanges: 0 };
                    _b.label = 9;
                case 9:
                    _b.trys.push([9, 11, , 12]);
                    // Try a simple operation to test connectivity
                    return [4 /*yield*/, engine.search_memory('stats_test', 1)];
                case 10:
                    // Try a simple operation to test connectivity
                    _b.sent();
                    return [3 /*break*/, 12];
                case 11:
                    _a = _b.sent();
                    dbStats = { totalExchanges: 0 };
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/, {
                        status: overallStatus,
                        version: config.server.version,
                        uptime: Date.now() - startTime,
                        database: {
                            connected: checks.database.status !== 'fail',
                            collections: 1, // CBD uses single collection model
                            vectors: dbStats.totalExchanges || 0,
                        },
                        memory: {
                            usage: memUsage.heapUsed,
                            limit: memUsage.heapTotal,
                            available: memUsage.heapTotal - memUsage.heapUsed > 50 * 1024 * 1024, // 50MB threshold
                        },
                        checks: checks,
                    }];
            }
        });
    });
}
/**
 * Validate health-related configuration
 */
function validateHealthConfig(config) {
    var errors = [];
    if (!config.server.name) {
        errors.push('Server name not configured');
    }
    if (!config.server.version) {
        errors.push('Server version not configured');
    }
    if (config.server.timeout < 5000) {
        errors.push('Server timeout too low (recommended: >5000ms)');
    }
    if (config.performance.batchSize > 10000) {
        errors.push('Batch size too large (recommended: <10000)');
    }
    if (config.database.maxVectors && config.database.maxVectors < 1000) {
        errors.push('Max vectors too low (recommended: >1000)');
    }
    return errors;
}
/**
 * Get simple health check result for quick status
 */
function quickHealthCheck(engine) {
    return __awaiter(this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    // Try a simple search to test the engine
                    return [4 /*yield*/, engine.search_memory('health_check_test', 1)];
                case 1:
                    // Try a simple search to test the engine
                    _a.sent();
                    return [2 /*return*/, {
                            status: 'healthy',
                            message: 'CBD MCP server is operational',
                        }];
                case 2:
                    error_3 = _a.sent();
                    return [2 /*return*/, {
                            status: 'unhealthy',
                            message: "Health check failed: ".concat((error_3 === null || error_3 === void 0 ? void 0 : error_3.message) || 'Unknown error'),
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
