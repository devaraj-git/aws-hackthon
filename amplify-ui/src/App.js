import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, RefreshCw, Edit2, CheckCircle, Clock, AlertCircle, Menu, MessageSquare, Plus, Trash2 } from 'lucide-react';

export default function AgentDeploymentChat() {
  const [conversations, setConversations] = useState([]);
  const [currentConvId, setCurrentConvId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const currentConv = conversations.find(c => c.id === currentConvId);

  const deploymentStages = [
    { name: 'Request Analysis', icon: '🔍', color: 'blue' },
    { name: 'Price Estimation', icon: '💰', color: 'green' },
    { name: 'User Approval', icon: '✅', color: 'purple' },
    { name: 'Template Generation', icon: '📄', color: 'orange' },
    { name: 'Validation', icon: '🔒', color: 'red' },
    { name: 'Deployment', icon: '🚀', color: 'indigo' },
    { name: 'Completion', icon: '✨', color: 'emerald' }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConv?.messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputText]);

  const createNewConversation = () => {
    const newConv = {
      id: Date.now(),
      title: 'New Chat',
      timestamp: new Date().toLocaleString(),
      messages: []
    };
    setConversations(prev => [newConv, ...prev]);
    setCurrentConvId(newConv.id);
    return newConv.id;
  };

  const updateConversationTitle = (convId, firstMessage) => {
    setConversations(prev => prev.map(c =>
      c.id === convId && c.title === 'New Chat'
        ? { ...c, title: firstMessage.slice(0, 40) + (firstMessage.length > 40 ? '...' : '') }
        : c
    ));
  };

  const deleteConversation = (convId, e) => {
    e.stopPropagation();
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (currentConvId === convId) {
      setCurrentConvId(null);
    }
  };

  const handleSubmit = async () => {
    if (!inputText.trim() || isProcessing) return;

    let convId = currentConvId;
    if (!convId) {
      convId = createNewConversation();
    }

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: inputText,
      timestamp: new Date().toLocaleString()
    };

    setConversations(prev => prev.map(c =>
      c.id === convId ? { ...c, messages: [...c.messages, userMsg] } : c
    ));

    updateConversationTitle(convId, inputText);
    const promptText = inputText;
    setInputText('');
    setIsProcessing(true);

    await simulateAgentWorkflow(convId, promptText);
    setIsProcessing(false);
  };

  const simulateAgentWorkflow = async (convId, prompt) => {
    const deploymentMsg = {
      id: Date.now(),
      role: 'assistant',
      content: `I'll help you deploy: "${prompt}"`,
      timestamp: new Date().toLocaleString(),
      deployment: {
        currentStage: 0,
        totalStages: deploymentStages.length,
        stages: deploymentStages,
        logs: [],
        status: 'in-progress',
        cost: null
      }
    };

    setConversations(prev => prev.map(c =>
      c.id === convId ? { ...c, messages: [...c.messages, deploymentMsg] } : c
    ));

    // Progress through stages
    for (let i = 0; i < deploymentStages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const log = {
        stage: deploymentStages[i].name,
        message: getStageMessage(deploymentStages[i].name),
        status: 'complete',
        time: `${(Math.random() * 2 + 0.5).toFixed(1)}s`
      };

      setConversations(prev => prev.map(c => {
        if (c.id !== convId) return c;
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id === deploymentMsg.id && m.deployment) {
              return {
                ...m,
                deployment: {
                  ...m.deployment,
                  currentStage: i + 1,
                  logs: [...m.deployment.logs, log],
                  cost: i === 1 ? (Math.random() * 200 + 50).toFixed(2) : m.deployment.cost
                }
              };
            }
            return m;
          })
        };
      }));

      // Pause at approval stage
      if (i === 2) {
        setConversations(prev => prev.map(c => {
          if (c.id !== convId) return c;
          return {
            ...c,
            messages: c.messages.map(m => {
              if (m.id === deploymentMsg.id && m.deployment) {
                return {
                  ...m,
                  deployment: { ...m.deployment, status: 'awaiting-approval' }
                };
              }
              return m;
            })
          };
        }));
        break;
      }
    }
  };

  const getStageMessage = (stage) => {
    const messages = {
      'Request Analysis': 'Analyzed deployment requirements and extracted parameters',
      'Price Estimation': 'Calculated infrastructure costs based on resource requirements',
      'User Approval': 'Waiting for approval to proceed with deployment',
      'Template Generation': 'Generated CloudFormation templates and configurations',
      'Validation': 'Validated templates for security and compliance standards',
      'Deployment': 'Deploying infrastructure to AWS cloud',
      'Completion': 'Deployment completed successfully'
    };
    return messages[stage];
  };

  const handleApprove = async (msgId) => {
    setIsProcessing(true);
    const convId = currentConvId;

    setConversations(prev => prev.map(c => {
      if (c.id !== convId) return c;
      return {
        ...c,
        messages: c.messages.map(m => {
          if (m.id === msgId && m.deployment) {
            return { ...m, deployment: { ...m.deployment, status: 'in-progress' } };
          }
          return m;
        })
      };
    }));

    const msg = currentConv?.messages.find(m => m.id === msgId);
    const startStage = msg?.deployment?.currentStage || 3;

    for (let i = startStage; i < deploymentStages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const log = {
        stage: deploymentStages[i].name,
        message: getStageMessage(deploymentStages[i].name),
        status: 'complete',
        time: `${(Math.random() * 2 + 0.5).toFixed(1)}s`
      };

      setConversations(prev => prev.map(c => {
        if (c.id !== convId) return c;
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id === msgId && m.deployment) {
              return {
                ...m,
                deployment: {
                  ...m.deployment,
                  currentStage: i + 1,
                  logs: [...m.deployment.logs, log],
                  status: i === deploymentStages.length - 1 ? 'complete' : 'in-progress'
                }
              };
            }
            return m;
          })
        };
      }));
    }

    setIsProcessing(false);
  };

  const handleRetry = async (msgId) => {
    setIsProcessing(true);

    setConversations(prev => prev.map(c => {
      if (c.id !== currentConvId) return c;
      return {
        ...c,
        messages: c.messages.map(m => {
          if (m.id === msgId && m.deployment) {
            return {
              ...m,
              deployment: {
                ...m.deployment,
                currentStage: 0,
                logs: [],
                status: 'in-progress'
              }
            };
          }
          return m;
        })
      };
    }));

    const userMsg = currentConv?.messages.find(m => m.role === 'user');
    await simulateAgentWorkflow(currentConvId, userMsg?.content || '');
    setIsProcessing(false);
  };

  const handleImprove = (msgId) => {
    const feedbackMsg = {
      id: Date.now(),
      role: 'assistant',
      content: 'What changes would you like to make? Please describe your modifications below.',
      timestamp: new Date().toLocaleString(),
      isFeedbackRequest: true,
      linkedTo: msgId
    };

    setConversations(prev => prev.map(c =>
      c.id === currentConvId
        ? { ...c, messages: [...c.messages, feedbackMsg] }
        : c
    ));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="h-screen flex bg-white">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-64' : 'w-0'} bg-gray-900 transition-all duration-300 overflow-hidden flex flex-col`}>
        <div className="p-3 border-b border-gray-800">
          <button
            onClick={createNewConversation}
            className="w-full px-4 py-2.5 bg-transparent border border-gray-700 hover:bg-gray-800 text-white rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
          >
            <Plus size={18} />
            New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => setCurrentConvId(conv.id)}
              className={`px-3 py-2.5 mb-1 rounded-lg cursor-pointer group hover:bg-gray-800 flex items-center justify-between transition-colors ${
                currentConvId === conv.id ? 'bg-gray-800' : ''
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <MessageSquare size={16} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-200 truncate">{conv.title}</span>
              </div>
              <button
                onClick={(e) => deleteConversation(conv.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition-opacity"
              >
                <Trash2 size={14} className="text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Deployment Agent</h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {!currentConv || currentConv.messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-2xl px-4">
                <div className="text-7xl mb-8">🤖</div>
                <h2 className="text-4xl font-semibold text-gray-800 mb-4">
                  How can I help you today?
                </h2>
                <p className="text-gray-500 text-lg">
                  Describe your infrastructure needs and I'll guide you through the deployment process
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-8">
              {currentConv.messages.map((msg) => (
                <div key={msg.id} className="mb-8">
                  {msg.role === 'user' ? (
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        U
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-gray-800 whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-lg flex-shrink-0">
                        🤖
                      </div>
                      <div className="flex-1">
                        {msg.deployment ? (
                          <div className="space-y-4">
                            <p className="text-gray-800 font-medium mb-4">{msg.content}</p>

                            {/* Progress Bar */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-700">Progress</span>
                                <span className="text-sm text-gray-500">
                                  {msg.deployment.currentStage}/{msg.deployment.totalStages} stages
                                </span>
                              </div>

                              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                                <div
                                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                                  style={{ width: `${(msg.deployment.currentStage / msg.deployment.totalStages) * 100}%` }}
                                />
                              </div>

                              {/* Stage Icons */}
                              <div className="flex justify-between mb-4">
                                {deploymentStages.map((stage, idx) => (
                                  <div key={idx} className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                                      idx < msg.deployment.currentStage
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : idx === msg.deployment.currentStage
                                        ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-600 ring-offset-2'
                                        : 'bg-gray-200 text-gray-400'
                                    }`}>
                                      {stage.icon}
                                    </div>
                                    <span className={`text-xs mt-2 text-center max-w-[70px] ${
                                      idx <= msg.deployment.currentStage ? 'text-gray-700 font-medium' : 'text-gray-400'
                                    }`}>
                                      {stage.name}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {/* Logs */}
                              {msg.deployment.logs.length > 0 && (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {msg.deployment.logs.map((log, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-sm bg-white rounded-lg p-2">
                                      <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                                      <div className="flex-1">
                                        <span className="font-medium text-gray-800">{log.stage}:</span>
                                        <span className="text-gray-600 ml-1">{log.message}</span>
                                      </div>
                                      <span className="text-gray-400 text-xs">{log.time}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Cost Display */}
                            {msg.deployment.cost && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">💵</span>
                                  <div>
                                    <div className="flex items-baseline gap-1">
                                      <span className="text-2xl font-bold text-gray-900">${msg.deployment.cost}</span>
                                      <span className="text-gray-600">/month</span>
                                    </div>
                                    <p className="text-sm text-gray-600">Estimated infrastructure cost</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            {msg.deployment.status === 'awaiting-approval' && (
                              <div className="flex gap-3 pt-2">
                                <button
                                  onClick={() => handleRetry(msg.id)}
                                  disabled={isProcessing}
                                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg disabled:opacity-50 flex items-center gap-2 text-sm font-medium transition-colors"
                                >
                                  <RefreshCw size={16} />
                                  Retry
                                </button>
                                <button
                                  onClick={() => handleImprove(msg.id)}
                                  disabled={isProcessing}
                                  className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg disabled:opacity-50 flex items-center gap-2 text-sm font-medium transition-colors"
                                >
                                  <Edit2 size={16} />
                                  Improve
                                </button>
                                <button
                                  onClick={() => handleApprove(msg.id)}
                                  disabled={isProcessing}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2 text-sm font-medium transition-colors"
                                >
                                  <CheckCircle size={16} />
                                  Approve & Deploy
                                </button>
                              </div>
                            )}

                            {msg.deployment.status === 'complete' && (
                              <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-green-800">
                                  <CheckCircle size={20} />
                                  <span className="font-semibold">Deployment completed successfully!</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : msg.isFeedbackRequest ? (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-gray-800">{msg.content}</p>
                          </div>
                        ) : (
                          <p className="text-gray-800">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 bg-white border border-gray-300 rounded-2xl shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Deployment Agent..."
                rows="1"
                className="flex-1 px-4 py-3 bg-transparent border-none outline-none resize-none max-h-48"
                disabled={isProcessing}
              />
              <button
                onClick={handleSubmit}
                disabled={isProcessing || !inputText.trim()}
                className="m-1.5 p-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowUp size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}