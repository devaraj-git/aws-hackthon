import React, { useState } from 'react';
import { Send, ChevronRight, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('logs');
  const [workflow, setWorkflow] = useState([]);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [estimatedCost, setEstimatedCost] = useState(null);

  const agentSteps = [
    { id: 1, name: 'User Request', icon: '📝' },
    { id: 2, name: 'Request Analysis', icon: '🔍' },
    { id: 3, name: 'Price Analysis', icon: '💰' },
    { id: 4, name: 'User Decision', icon: '✅' },
    { id: 5, name: 'Template Generation', icon: '📄' },
    { id: 6, name: 'Validation', icon: '🔒' },
    { id: 7, name: 'Feedback Response', icon: '💬' }
  ];

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setIsProcessing(true);
    setWorkflow([]);
    setEstimatedCost(null);

    const newSession = {
      id: Date.now(),
      prompt: prompt,
      timestamp: new Date().toLocaleString(),
      status: 'processing'
    };

    setSessionHistory(prev => [newSession, ...prev]);

    try {
      // Step 1: User Request
      await new Promise(resolve => setTimeout(resolve, 500));
      setWorkflow(prev => [...prev, {
        agent: 'User Request',
        status: 'complete',
        message: `User asks for infra: "${prompt}"`,
        time: '0.5s'
      }]);

      // Step 2: Request Analysis
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWorkflow(prev => [...prev, {
        agent: 'Request Analysis',
        status: 'complete',
        message: 'Agent extracts parameters, resource specifications if needed, or proceeds to pricing',
        time: '1.2s'
      }]);

      // Call your API endpoint
      const res = await fetch("https://your-api-gateway-endpoint/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();

      // Step 3: Price Analysis
      await new Promise(resolve => setTimeout(resolve, 800));
      setWorkflow(prev => [...prev, {
        agent: 'Price Analysis',
        status: 'complete',
        message: `Agent estimates cloud cost based on resources and region`,
        time: '1.8s'
      }]);

      // Set estimated cost (you can get this from your API response)
      setEstimatedCost(data.estimatedCost || 151.07);

      // Step 4: User Decision
      await new Promise(resolve => setTimeout(resolve, 500));
      setWorkflow(prev => [...prev, {
        agent: 'User Decision',
        status: 'processing',
        message: 'User approves or rejects or declines/alter changes',
        time: '...'
      }]);

      // Update session status
      setSessionHistory(prev => prev.map(s =>
        s.id === newSession.id ? { ...s, status: 'complete', response: data.message } : s
      ));

    } catch (error) {
      setWorkflow(prev => [...prev, {
        agent: 'Error',
        status: 'error',
        message: `Failed to process request: ${error.message}`,
        time: 'N/A'
      }]);

      setSessionHistory(prev => prev.map(s =>
        s.id === newSession.id ? { ...s, status: 'error' } : s
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async () => {
    setWorkflow(prev => [...prev, {
      agent: 'Template Generation',
      status: 'processing',
      message: 'IAM Customizer CloudFormation template; MAS, or generation resources',
      time: '...'
    }]);

    await new Promise(resolve => setTimeout(resolve, 1500));

    setWorkflow(prev => [...prev.slice(0, -1), {
      agent: 'Template Generation',
      status: 'complete',
      message: 'Template generated successfully',
      time: '2.1s'
    }, {
      agent: 'Validation',
      status: 'processing',
      message: 'Validate Agent verifies generated template/resources and surfaces results',
      time: '...'
    }]);

    await new Promise(resolve => setTimeout(resolve, 1000));

    setWorkflow(prev => [...prev.slice(0, -1), {
      agent: 'Validation',
      status: 'complete',
      message: 'Validation successful - Ready for deployment',
      time: '1.3s'
    }, {
      agent: 'Final Response',
      status: 'complete',
      message: 'System can deploy/take test run or is confirmed with top-n-click.',
      time: '0.5s'
    }]);
  };

  const handleRetry = () => {
    setWorkflow([]);
    setEstimatedCost(null);
    setIsProcessing(false);
  };

  const handleImprove = () => {
    setWorkflow(prev => [...prev, {
      agent: 'Feedback Loop',
      status: 'processing',
      message: 'Re-validating with user feedback and adjusting parameters...',
      time: '...'
    }]);

    setTimeout(() => {
      setWorkflow(prev => [...prev.slice(0, -1), {
        agent: 'Feedback Loop',
        status: 'complete',
        message: 'Adjustments applied. Please review the updated configuration.',
        time: '1.5s'
      }]);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isProcessing && prompt.trim()) {
      handleSubmit();
    }
  };

  const loadSession = (session) => {
    setPrompt(session.prompt);
    // You can load the full workflow history here if stored
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Hackathon Agent Workflow</h1>
            <div className="flex gap-4">
              <button className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Login</button>
              <button className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">API</button>
              <button className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Docs</button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Interactive Agent Workflow</h2>

          {/* Prompt Input */}
          <div className="mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your infrastructure request..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isProcessing}
              />
              <button
                onClick={handleSubmit}
                disabled={isProcessing || !prompt.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
              >
                <Send size={18} />
                {isProcessing ? 'Processing...' : 'Submit Request'}
              </button>
            </div>
          </div>

          {/* Agent Workflow Steps */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">WORKFLOW STAGES</h3>
            <div className="flex items-center justify-between">
              {agentSteps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                      workflow.length > index
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step.icon}
                    </div>
                    <span className="text-xs text-gray-600 mt-2 text-center max-w-[80px]">
                      {step.name}
                    </span>
                  </div>
                  {index < agentSteps.length - 1 && (
                    <ChevronRight className="text-gray-400 mb-6" size={20} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="border-b border-gray-200 px-6">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`py-3 px-1 border-b-2 font-medium transition-colors ${
                    activeTab === 'logs'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Logs
                </button>
                <button
                  onClick={() => setActiveTab('graphs')}
                  className={`py-3 px-1 border-b-2 font-medium transition-colors ${
                    activeTab === 'graphs'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Graphs
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6">
              {activeTab === 'logs' && (
                <div className="space-y-4">
                  {workflow.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Clock size={48} className="mx-auto mb-4 text-gray-400" />
                      <p>Submit a request to see the agent workflow in action</p>
                    </div>
                  ) : (
                    <>
                      {workflow.map((step, index) => (
                        <div key={index} className="border-l-4 border-blue-500 bg-gray-50 rounded-r-lg p-4 transition-all hover:shadow-md">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              {step.status === 'complete' && (
                                <CheckCircle className="text-green-500" size={20} />
                              )}
                              {step.status === 'processing' && (
                                <Clock className="text-blue-500 animate-pulse" size={20} />
                              )}
                              {step.status === 'error' && (
                                <AlertCircle className="text-red-500" size={20} />
                              )}
                              <h4 className="font-semibold text-gray-800">{step.agent}</h4>
                            </div>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {step.time}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm ml-8">{step.message}</p>
                          {index === workflow.length - 1 && step.status === 'processing' && step.agent === 'User Decision' && (
                            <div className="mt-3 ml-8 flex gap-3">
                              <button
                                onClick={handleRetry}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 text-sm transition-colors"
                              >
                                <RefreshCw size={16} />
                                Retry
                              </button>
                              <button
                                onClick={handleImprove}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 text-sm transition-colors"
                              >
                                Improve
                              </button>
                            </div>
                          )}
                        </div>
                      ))}

                      {estimatedCost && workflow.some(w => w.agent === 'User Decision') && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">💵</span>
                            <span className="text-xl font-bold text-gray-800">${estimatedCost.toFixed(2)}</span>
                            <span className="text-gray-600">/month</span>
                          </div>
                          <div className="flex gap-3 mt-3">
                            <button
                              onClick={handleRetry}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm transition-colors"
                            >
                              Stop
                            </button>
                            <button
                              onClick={handleImprove}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={handleApprove}
                              disabled={isProcessing}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors disabled:bg-gray-400"
                            >
                              ✓ Approve
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === 'graphs' && (
                <div className="text-center py-12 text-gray-500">
                  <p>Performance graphs and analytics will appear here</p>
                  <p className="text-sm mt-2">Cost trends, deployment history, and resource utilization</p>
                </div>
              )}
            </div>
          </div>

          {/* Session History */}
          {sessionHistory.length > 0 && (
            <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-4">SESSION HISTORY</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sessionHistory.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => loadSession(session)}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">{session.prompt}</p>
                      <p className="text-xs text-gray-500">{session.timestamp}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      session.status === 'complete'
                        ? 'bg-green-100 text-green-700'
                        : session.status === 'error'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;