import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  MessageCircle, 
  Apple, 
  Pill, 
  Crown, 
  Send,
  Sparkles
} from 'lucide-react';
import { useRecommendations } from '../hooks/useRecommendations';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';
import ReactMarkdown from 'react-markdown';
import { type PlannerReport } from '../services/plannerService';
import { usePlanner } from '../hooks/useplanner';
import { useUser } from '../contexts/UserContext';


const Recommendations: React.FC = () => {
  const [chatMessage, setChatMessage] = useState('');
  const {refreshData} = useUser();
  const [chatHistory, setChatHistory] = useState([
    {
      type: 'ai',
      message: "Hello! I'm your AI fitness coach. How can I help you optimize your training today?",
      timestamp: new Date()
    }
  ]);
    const { getPlannerReport} = usePlanner();
    const [planner, setplanner]  = useState<PlannerReport>();

   useEffect(() => {
    const fetchPlannerReport = async () => {
      try {
        refreshData();
        console.log(user?.tier);
        if(user?.tier === 'premium'){
          const plannerReport = await getPlannerReport();
          setplanner(plannerReport);
        }
        
      } catch (err) {
        console.error("Failed to fetch planner report:", err);
      }
    };
  
    fetchPlannerReport();
  }, []);

  const { user } = useAuth();
  const { loading, chatWithAI } = useRecommendations();

 

  const sendMessage = async () => {
    if (!chatMessage.trim() || loading) return;

    const newMessage = {
      type: 'user',
      message: chatMessage,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, newMessage]);
    const currentMessage = chatMessage;
    setChatMessage('');

    try {
      const aiResponse = await chatWithAI(currentMessage);
      
      const aiMessage = {
        type: 'ai',
        message: aiResponse,
        timestamp: new Date()
      };
      
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      // Error is handled by the hook
      const errorMessage = {
        type: 'ai',
        message: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date()
      };
      
      setChatHistory(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      case 'low': return 'border-green-500 bg-green-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              AI Coach Recommendations
            </h1>
            <p className="text-gray-400 text-lg">
              Personalized insights and guidance powered by artificial intelligence
            </p>
          </motion.div>

          {/* Three Column Layout */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* AI Suggestions Panel */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-800/60 rounded-xl p-6 border border-gray-700"
              >
                <div className="flex items-center space-x-2 mb-6">
                  <Brain className="w-6 h-6 text-primary-400" />
                  <h2 className="text-xl font-bold text-white">AI Insights</h2>
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </div>

                <div className="space-y-4">
                  {planner?.recommendations?.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-l-4 ${getPriorityColor('medium')}`} // Default priority if not available
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-primary-400 mt-1">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">{`Insight ${index + 1}`}</h3>
                          <p className="text-sm text-gray-300 mb-2">{rec}</p>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-300">
                              medium priority
                            </span>
                            <span className="px-2 py-1 text-xs bg-gray-600 text-gray-300 rounded-full">
                              general
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                </div>

                {/* Pro Plan Upgrade */}
                {user?.tier === 'free' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 p-4 bg-gradient-to-r from-primary-900/50 to-neon-pink/20 rounded-lg border border-primary-500/30"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <Crown className="w-5 h-5 text-yellow-400" />
                      <h3 className="font-semibold text-white">Unlock More Insights</h3>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">
                      Get unlimited AI recommendations, detailed analytics, and personalized meal plans.
                    </p>
                    <button className="w-full py-2 bg-gradient-to-r from-primary-600 to-neon-pink rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300 transform hover:scale-105">
                      Upgrade to Pro
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* AI Chat Interface */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800/60 rounded-xl border border-gray-700 h-[600px] flex flex-col"
              >
                <div className="p-6 border-b border-gray-700">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-6 h-6 text-electric-400" />
                    <h2 className="text-xl font-bold text-white">AI Coach Chat</h2>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {chatHistory.map((chat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        chat.type === 'user' 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-gray-700 text-gray-100'
                      }`}>
                        <p className="text-sm"><ReactMarkdown>{chat.message}</ReactMarkdown></p>
                        <p className="text-xs opacity-70 mt-1">
                          {chat.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-700 p-3 rounded-lg">
                        <LoadingSpinner size="sm" text="AI is thinking..." />
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-6 border-t border-gray-700">
                  <div className="flex space-x-2">
                    
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask your AI coach anything..."
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400 disabled:opacity-50"
                    />
                    
                    <button
                      onClick={sendMessage}
                      disabled={loading || !chatMessage.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-primary-600 to-electric-400 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loading ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Nutrition & Supplements */}
            <div className="space-y-6">
              {/* Nutrition Recommendations */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800/60 rounded-xl p-6 border border-gray-700"
              >
                <div className="flex items-center space-x-2 mb-6">
                  <Apple className="w-6 h-6 text-green-400" />
                  <h2 className="text-xl font-bold text-white">Nutrition Plan</h2>
                </div>

                <div className="space-y-4">
                  {planner?.nutrition?.map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="p-4 bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white">{`Tip ${index + 1}`}</h3>
                        <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded-full">
                          Nutrition
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{tip}</p>
                    </motion.div>
                  ))}

                </div>
              </motion.div>

              {/* Supplement Schedule */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-800/60 rounded-xl p-6 border border-gray-700"
              >
                <div className="flex items-center space-x-2 mb-6">
                  <Pill className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-bold text-white">Recommendations</h2>
                </div>

                <div className="space-y-3">
                  {planner?.prediction?.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-white">{`Prediction ${index + 1}`}</h4>
                        <p className="text-sm text-gray-400">{item}</p>
                      </div>
                      <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full">
                        Auto
                      </span>
                    </motion.div>
                  ))}

                </div>

                <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <p className="text-sm text-blue-300">
                    💡 <strong>Tip:</strong> Always consult with a healthcare provider before starting new supplements.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Recommendations;