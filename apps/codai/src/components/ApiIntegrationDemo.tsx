/**
 * API Integration Demo Component
 * Comprehensive demonstration of all API integration features
 */

import React, { useState } from 'react';
import { 
  useRomAIMath, 
  useRomAILogic, 
  useRomanianAnalysis,
  useAuth,
  useWebSocket,
  useRomAIHealth,
  useNotifications
} from '../lib/hooks/useApi';

export default function ApiIntegrationDemo() {
  const [mathProblem, setMathProblem] = useState('√144 + 2 × 3');
  const [logicPremise, setLogicPremise] = useState('All roses are flowers. This is a rose.');
  const [romanianText, setRomanianText] = useState('Să analizăm această expresie culturală românească.');
  const [loginEmail, setLoginEmail] = useState('test@codai.ro');
  const [loginPassword, setLoginPassword] = useState('password123');

  // API hooks
  const mathApi = useRomAIMath();
  const logicApi = useRomAILogic();
  const romanianApi = useRomanianAnalysis();
  const auth = useAuth();
  const websocket = useWebSocket();
  const health = useRomAIHealth();
  const notifications = useNotifications();

  const handleMathSolve = async () => {
    try {
      await mathApi.solveProblem({
        problem: mathProblem,
        steps_needed: true,
        romanian_context: true,
      });
      notifications.notifyApiSuccess('Math problem solved successfully!');
    } catch (error) {
      notifications.notifyApiError(error as Error, 'Math Error');
    }
  };

  const handleLogicReasoning = async () => {
    try {
      await logicApi.performReasoning({
        premise: logicPremise,
        reasoning_type: 'deductive',
        romanian_context: true,
      });
      notifications.notifyApiSuccess('Logic reasoning completed successfully!');
    } catch (error) {
      notifications.notifyApiError(error as Error, 'Logic Error');
    }
  };

  const handleRomanianAnalysis = async () => {
    try {
      await romanianApi.analyzeContext({
        text: romanianText,
        analysis_type: 'comprehensive',
      });
      notifications.notifyApiSuccess('Romanian analysis completed successfully!');
    } catch (error) {
      notifications.notifyApiError(error as Error, 'Analysis Error');
    }
  };

  const handleLogin = async () => {
    try {
      await auth.login(loginEmail, loginPassword, true);
      notifications.notifyApiSuccess(`Welcome back, ${auth.user?.name}!`);
    } catch (error) {
      notifications.notifyApiError(error as Error, 'Login Failed');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
      notifications.notifyApiSuccess('Logged out successfully');
    } catch (error) {
      notifications.notifyApiError(error as Error, 'Logout Error');
    }
  };

  const sendWebSocketMessage = () => {
    const success = websocket.send('test-message', {
      message: 'Hello from CODAI frontend!',
      timestamp: new Date().toISOString(),
    });
    
    if (success) {
      notifications.notifyApiSuccess('WebSocket message sent!');
    } else {
      notifications.notify('warning', 'WebSocket', 'Message queued (not connected)');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">🚀 API Integration Demo</h1>
        <p className="text-lg opacity-90">
          Comprehensive testing of CODAI API integration layer with RomAI AGI backend
        </p>
      </div>

      {/* Notifications Display */}
      {notifications.notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg flex justify-between items-center ${
                notification.type === 'success' ? 'bg-green-100 text-green-800 border-green-200' :
                notification.type === 'error' ? 'bg-red-100 text-red-800 border-red-200' :
                notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                'bg-blue-100 text-blue-800 border-blue-200'
              } border`}
            >
              <div>
                <h4 className="font-semibold">{notification.title}</h4>
                <p className="text-sm">{notification.message}</p>
                <span className="text-xs opacity-75">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <button
                onClick={() => notifications.removeNotification(notification.id)}
                className="text-lg font-bold opacity-50 hover:opacity-100"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={notifications.clearNotifications}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Clear all notifications
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* RomAI Health Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">🏥 RomAI Health</h2>
            <button
              onClick={health.checkHealth}
              disabled={health.loading}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {health.loading ? 'Checking...' : 'Refresh'}
            </button>
          </div>
          
          {health.error ? (
            <div className="text-red-600 bg-red-50 p-3 rounded">
              <strong>Error:</strong> {health.error}
            </div>
          ) : health.health ? (
            <div className="space-y-2 text-sm">
              <div className={`flex items-center gap-2 ${health.isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                <span className="w-3 h-3 rounded-full bg-current"></span>
                <strong>Status: {health.health.status}</strong>
              </div>
              <p>Uptime: {Math.floor(health.health.uptime_seconds / 60)} minutes</p>
              <p>Models Loaded: {health.health.models_loaded}</p>
              <p>Total Inferences: {health.health.total_inferences}</p>
              <p>Version: {health.health.server_version}</p>
              <p>MoE System: {health.health.moe_system_status}</p>
              {health.lastChecked && (
                <p className="text-gray-500 text-xs">
                  Last checked: {health.lastChecked.toLocaleTimeString()}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No health data available</p>
          )}
        </div>

        {/* Authentication Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 border">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🔐 Authentication</h2>
          
          {auth.isAuthenticated && auth.user ? (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 p-3 rounded">
                <p className="font-semibold text-green-800">Logged in as:</p>
                <p className="text-green-700">{auth.user.name}</p>
                <p className="text-green-600 text-sm">{auth.user.email}</p>
                <p className="text-green-600 text-sm">Role: {auth.user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleLogin}
                disabled={auth.loginState.loading}
                className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {auth.loginState.loading ? 'Logging in...' : 'Login'}
              </button>
              {auth.loginState.error && (
                <p className="text-red-600 text-sm">{auth.loginState.error}</p>
              )}
            </div>
          )}
        </div>

        {/* WebSocket Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 border">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🔌 WebSocket</h2>
          
          <div className="space-y-3">
            <div className={`flex items-center gap-2 ${websocket.connected ? 'text-green-600' : 'text-red-600'}`}>
              <span className="w-3 h-3 rounded-full bg-current animate-pulse"></span>
              <strong>{websocket.connected ? 'Connected' : 'Disconnected'}</strong>
            </div>
            
            {websocket.error && (
              <div className="text-red-600 bg-red-50 p-2 rounded text-sm">
                {websocket.error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={sendWebSocketMessage}
                className="flex-1 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Send Test Message
              </button>
              <button
                onClick={websocket.reconnect}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Reconnect
              </button>
            </div>
          </div>
        </div>

        {/* Math Problem Solver */}
        <div className="bg-white rounded-lg shadow-lg p-6 border">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🧮 Math Solver</h2>
          
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Enter math problem..."
              value={mathProblem}
              onChange={(e) => setMathProblem(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <button
              onClick={handleMathSolve}
              disabled={mathApi.loading}
              className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {mathApi.loading ? 'Solving...' : 'Solve Problem'}
            </button>
            
            {mathApi.error && (
              <div className="text-red-600 bg-red-50 p-3 rounded text-sm">
                <strong>Error:</strong> {mathApi.error}
              </div>
            )}
            
            {mathApi.data && (
              <div className="bg-green-50 border border-green-200 p-3 rounded">
                <p className="font-semibold text-green-800">Result: {mathApi.data.result}</p>
                <p className="text-green-700 text-sm">Engine: {mathApi.data.engine_used}</p>
                <p className="text-green-700 text-sm">Confidence: {(mathApi.data.confidence * 100).toFixed(1)}%</p>
                <p className="text-green-700 text-sm">Processing Time: {mathApi.data.processing_time}ms</p>
                
                {mathApi.data.steps && mathApi.data.steps.length > 0 && (
                  <div className="mt-2">
                    <p className="text-green-800 text-sm font-semibold">Solution Steps:</p>
                    <ul className="text-green-700 text-sm list-disc list-inside">
                      {mathApi.data.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {mathApi.data.romanian_interpretation && (
                  <div className="mt-2 pt-2 border-t border-green-300">
                    <p className="text-green-800 text-sm font-semibold">Romanian Context:</p>
                    <p className="text-green-700 text-sm">{mathApi.data.romanian_interpretation}</p>
                  </div>
                )}
                
                <button
                  onClick={mathApi.reset}
                  className="mt-2 text-xs text-green-600 hover:text-green-800 underline"
                >
                  Clear Result
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Logic Reasoning */}
        <div className="bg-white rounded-lg shadow-lg p-6 border">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🧠 Logic Reasoning</h2>
          
          <div className="space-y-3">
            <textarea
              placeholder="Enter logical premise..."
              value={logicPremise}
              onChange={(e) => setLogicPremise(e.target.value)}
              rows={3}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            
            <button
              onClick={handleLogicReasoning}
              disabled={logicApi.loading}
              className="w-full py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
            >
              {logicApi.loading ? 'Reasoning...' : 'Perform Reasoning'}
            </button>
            
            {logicApi.error && (
              <div className="text-red-600 bg-red-50 p-3 rounded text-sm">
                <strong>Error:</strong> {logicApi.error}
              </div>
            )}
            
            {logicApi.data && (
              <div className="bg-purple-50 border border-purple-200 p-3 rounded">
                <p className="font-semibold text-purple-800">Conclusion: {logicApi.data.conclusion}</p>
                <p className="text-purple-700 text-sm">Validity: {logicApi.data.validity ? 'Valid' : 'Invalid'}</p>
                <p className="text-purple-700 text-sm">Confidence: {(logicApi.data.confidence * 100).toFixed(1)}%</p>
                
                {logicApi.data.reasoning_chain && logicApi.data.reasoning_chain.length > 0 && (
                  <div className="mt-2">
                    <p className="text-purple-800 text-sm font-semibold">Reasoning Chain:</p>
                    <ol className="text-purple-700 text-sm list-decimal list-inside">
                      {logicApi.data.reasoning_chain.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
                
                {logicApi.data.romanian_cultural_context && (
                  <div className="mt-2 pt-2 border-t border-purple-300">
                    <p className="text-purple-800 text-sm font-semibold">Romanian Cultural Context:</p>
                    <p className="text-purple-700 text-sm">{logicApi.data.romanian_cultural_context}</p>
                  </div>
                )}
                
                <button
                  onClick={logicApi.reset}
                  className="mt-2 text-xs text-purple-600 hover:text-purple-800 underline"
                >
                  Clear Result
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Romanian Analysis */}
        <div className="bg-white rounded-lg shadow-lg p-6 border col-span-full">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🇷🇴 Romanian Cultural Analysis</h2>
          
          <div className="space-y-3">
            <textarea
              placeholder="Enter Romanian text for cultural analysis..."
              value={romanianText}
              onChange={(e) => setRomanianText(e.target.value)}
              rows={3}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            
            <button
              onClick={handleRomanianAnalysis}
              disabled={romanianApi.loading}
              className="py-2 px-6 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {romanianApi.loading ? 'Analyzing...' : 'Analyze Romanian Context'}
            </button>
            
            {romanianApi.error && (
              <div className="text-red-600 bg-red-50 p-3 rounded text-sm">
                <strong>Error:</strong> {romanianApi.error}
              </div>
            )}
            
            {romanianApi.data && (
              <div className="bg-red-50 border border-red-200 p-4 rounded">
                <p className="font-semibold text-red-800 mb-2">Cultural Analysis:</p>
                <p className="text-red-700 mb-3">{romanianApi.data.analysis}</p>
                <p className="text-red-700 text-sm mb-3">Confidence: {(romanianApi.data.confidence * 100).toFixed(1)}%</p>
                
                {romanianApi.data.cultural_insights && romanianApi.data.cultural_insights.length > 0 && (
                  <div className="mb-3">
                    <p className="text-red-800 text-sm font-semibold">Cultural Insights:</p>
                    <ul className="text-red-700 text-sm list-disc list-inside">
                      {romanianApi.data.cultural_insights.map((insight, index) => (
                        <li key={index}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {romanianApi.data.linguistic_features && romanianApi.data.linguistic_features.length > 0 && (
                  <div className="mb-3">
                    <p className="text-red-800 text-sm font-semibold">Linguistic Features:</p>
                    <ul className="text-red-700 text-sm list-disc list-inside">
                      {romanianApi.data.linguistic_features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {romanianApi.data.historical_context && romanianApi.data.historical_context.length > 0 && (
                  <div className="mb-3">
                    <p className="text-red-800 text-sm font-semibold">Historical Context:</p>
                    <ul className="text-red-700 text-sm list-disc list-inside">
                      {romanianApi.data.historical_context.map((context, index) => (
                        <li key={index}>{context}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <button
                  onClick={romanianApi.reset}
                  className="text-xs text-red-600 hover:text-red-800 underline"
                >
                  Clear Analysis
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}