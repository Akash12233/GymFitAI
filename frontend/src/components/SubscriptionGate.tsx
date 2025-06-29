import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionGateProps {
  children: React.ReactNode;
  hasSubscription: boolean;
  featureName: string;
  description: string;
}

const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ 
  children, 
  hasSubscription, 
  featureName, 
  description 
}) => {
  const navigate = useNavigate();

  if (hasSubscription) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen">
      {/* Blurred Background Content */}
      <div className="filter blur-sm pointer-events-none select-none">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8 max-w-md w-full text-center"
        >
          {/* Premium Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Crown className="w-10 h-10 text-white" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-3">
              Upgrade to Pro
            </h2>
            <p className="text-gray-300 mb-2">
              <span className="font-semibold text-yellow-400">{featureName}</span> is a premium feature
            </p>
            <p className="text-gray-400 text-sm mb-6">
              {description}
            </p>

            {/* Features List */}
            <div className="space-y-2 mb-6 text-left">
              {[
                'Detailed workout analytics',
                'Advanced progress tracking',
                'AI-powered insights',
                'Export workout data',
                'Priority support'
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <Star className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/pricing')}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300"
              >
                <Crown className="w-5 h-5" />
                <span>Upgrade to Pro</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold text-white transition-colors duration-200"
              >
                Back to Dashboard
              </button>
            </div>

            {/* Pricing Hint */}
            <p className="text-xs text-gray-500 mt-4">
              Starting at $9.99/month • 7-day free trial
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SubscriptionGate;