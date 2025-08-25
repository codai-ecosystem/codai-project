// Module configuration\nexport interface ModuleConfig {\n  [key: string]: any;\n}\n\n"use strict";
/*!
 * CBD MCP Server Main Export
 * Entry point for the CBD Model Context Protocol server
 */
Object.defineProperty(exports, "__esModule", { value: true });
export const getConfig = export const CBDMCPServer = void 0;
var server_js_1 = require("./server.js");
Object.defineProperty(exports, "CBDMCPServer", { enumerable: true, get: function () { return server_js_1.CBDMCPServer; } });
var config_js_1 = require("./config.js");
Object.defineProperty(exports, "getConfig", { enumerable: true, get: function () { return config_js_1.getConfig; } });

