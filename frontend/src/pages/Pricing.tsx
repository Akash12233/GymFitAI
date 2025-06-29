import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Crown, 
  Zap, 
  Star,
  Users,
  Brain,
  BarChart3,
  Heart,
  Shield,
  Headphones
} from 'lucide-react';

const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started with your fitness journey',
      icon: <Users className="w-8 h-8" />,
      color: 'from-gray-600 to-gray-700',
      features: [
        'Basic workout tracking',
        'Limited AI suggestions (5/month)',
        'Community access',
        'Basic progress calendar',
        'Mobile app access',
        'Email support'
      ],
      limitations: [
        'No detailed analytics',
        'No nutrition planning',
        'No custom workout creation'
      ]
    },
    {
      name: 'Pro',
      price: { monthly: 19, yearly: 190 },
      description: 'Unlock the full power of AI coaching and advanced features',
      icon: <Brain className="w-8 h-8" />,
      color: 'from-primary-600 to-neon-pink',
      popular: true,
      features: [
        'Unlimited AI coaching',
        'Detailed progress analytics',
        'Custom workout creation',
        'Nutrition planning & tracking',
        'Advanced goal setting',
        'Wearable device integration',
        'Priority support',
        'Export workout data',
        'Meal planning assistant',
        'Recovery recommendations'
      ]
    },
    {
      name: 'Platinum',
      price: { monthly: 299, yearly: 299 },
      description: 'Lifetime access with exclusive features and personal coaching',
      icon: <Crown className="w-8 h-8" />,
      color: 'from-yellow-500 to-orange-500',
      lifetime: true,
      features: [
        'Everything in Pro',
        'Lifetime access (one-time payment)',
        '1-on-1 coaching sessions (4/month)',
        'Exclusive workout programs',
        'Priority feature requests',
        'Beta access to new features',
        'Personal nutrition consultant',
        'Advanced biometric tracking',
        'Custom supplement protocols',
        'VIP community access'
      ]
    }
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      plan: 'Pro',
      text: 'The AI coaching is incredible! It\'s like having a personal trainer 24/7.',
      rating: 5
    },
    {
      name: 'Mike R.',
      plan: 'Platinum',
      text: 'Best investment I\'ve made for my health. The personal coaching sessions are game-changers.',
      rating: 5
    },
    {
      name: 'Emma L.',
      plan: 'Pro',
      text: 'Finally reached my fitness goals thanks to the personalized nutrition plans.',
      rating: 5
    }
  ];

  const faqs = [
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! All paid plans come with a 7-day free trial. No credit card required to start.'
    },
    {
      question: 'What\'s included in the personal coaching sessions?',
      answer: 'Platinum members get 4 one-on-one video sessions per month with certified fitness coaches for personalized guidance and form correction.'
    },
    {
      question: 'Do you offer student discounts?',
      answer: 'Yes, we offer a 50% discount for students with valid student ID. Contact support for details.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your <span className="text-primary-400">Fitness Journey</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Unlock your potential with AI-powered coaching, personalized workouts, and comprehensive fitness tracking
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center mb-12"
        >
          <div className="bg-gray-800 rounded-lg p-1 flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                billingCycle === 'monthly'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 relative ${
                billingCycle === 'yearly'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`relative bg-gray-800/60 rounded-2xl p-8 border border-gray-700 hover:border-gray-600 transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-primary-500 transform scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-primary-600 to-neon-pink px-4 py-1 rounded-full text-sm font-semibold text-white">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${plan.color} bg-opacity-20 mb-4`}>
                  <div className="text-primary-400">
                    {plan.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>

              {/* Pricing */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-white">
                    ${plan.lifetime ? plan.price.monthly : plan.price[billingCycle]}
                  </span>
                  {!plan.lifetime && (
                    <span className="text-gray-400 ml-2">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  )}
                </div>
                {plan.lifetime && (
                  <p className="text-sm text-yellow-400 mt-2">One-time payment</p>
                )}
                {billingCycle === 'yearly' && !plan.lifetime && plan.price.monthly > 0 && (
                  <p className="text-sm text-green-400 mt-2">
                    Save ${(plan.price.monthly * 12 - plan.price.yearly)} per year
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
                {plan.limitations && plan.limitations.map((limitation, limitIndex) => (
                  <div key={limitIndex} className="flex items-center space-x-3 opacity-50">
                    <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                      <div className="w-3 h-0.5 bg-gray-500" />
                    </div>
                    <span className="text-gray-500 text-sm">{limitation}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                  plan.name === 'Free'
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : `bg-gradient-to-r ${plan.color} text-white hover:shadow-lg hover:shadow-primary-500/25`
                }`}
              >
                {plan.name === 'Free' ? 'Get Started' : `Start ${plan.name} Plan`}
              </button>

              {plan.name !== 'Free' && (
                <p className="text-center text-xs text-gray-500 mt-3">
                  7-day free trial • No credit card required
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-800/60 rounded-2xl p-8 border border-gray-700 mb-16"
        >
          <h2 className="text-2xl font-bold text-white text-center mb-8">Feature Comparison</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 text-gray-400">Features</th>
                  <th className="text-center py-4 text-gray-400">Free</th>
                  <th className="text-center py-4 text-primary-400">Pro</th>
                  <th className="text-center py-4 text-yellow-400">Platinum</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ['Workout Tracking', true, true, true],
                  ['AI Suggestions', '5/month', 'Unlimited', 'Unlimited'],
                  ['Progress Analytics', false, true, true],
                  ['Nutrition Planning', false, true, true],
                  ['Personal Coaching', false, false, '4 sessions/month'],
                  ['Priority Support', false, true, true],
                  ['Lifetime Access', false, false, true]
                ].map(([feature, free, pro, platinum], index) => (
                  <tr key={index} className="border-b border-gray-800">
                    <td className="py-4 text-white">{feature}</td>
                    <td className="py-4 text-center">
                      {typeof free === 'boolean' ? (
                        free ? <Check className="w-5 h-5 text-green-400 mx-auto" /> : 
                        <div className="w-5 h-5 mx-auto flex items-center justify-center">
                          <div className="w-3 h-0.5 bg-gray-500" />
                        </div>
                      ) : (
                        <span className="text-gray-300">{free}</span>
                      )}
                    </td>
                    <td className="py-4 text-center">
                      {typeof pro === 'boolean' ? (
                        pro ? <Check className="w-5 h-5 text-green-400 mx-auto" /> : 
                        <div className="w-5 h-5 mx-auto flex items-center justify-center">
                          <div className="w-3 h-0.5 bg-gray-500" />
                        </div>
                      ) : (
                        <span className="text-gray-300">{pro}</span>
                      )}
                    </td>
                    <td className="py-4 text-center">
                      {typeof platinum === 'boolean' ? (
                        platinum ? <Check className="w-5 h-5 text-green-400 mx-auto" /> : 
                        <div className="w-5 h-5 mx-auto flex items-center justify-center">
                          <div className="w-3 h-0.5 bg-gray-500" />
                        </div>
                      ) : (
                        <span className="text-gray-300">{platinum}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-white text-center mb-8">What Our Users Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-800/60 rounded-xl p-6 border border-gray-700"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{testimonial.name}</span>
                  <span className="px-2 py-1 bg-primary-500/20 text-primary-300 text-xs rounded-full">
                    {testimonial.plan}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-800/60 rounded-xl p-6 border border-gray-700"
              >
                <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                <p className="text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center bg-gradient-to-r from-primary-900/50 to-neon-pink/20 rounded-2xl p-12 border border-primary-500/30"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Fitness?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already achieved their fitness goals with our AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-primary-600 to-neon-pink rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300 transform hover:scale-105">
              Start Free Trial
            </button>
            <button className="px-8 py-4 border border-gray-600 rounded-lg font-semibold text-white hover:bg-gray-800 transition-all duration-300">
              Contact Sales
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;