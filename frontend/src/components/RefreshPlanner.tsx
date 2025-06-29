import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, User, Brain } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useUser } from '../contexts/UserContext';
import { useNotifications } from '../contexts/NotificationContext';
import { recommendationService } from '../services/recommendationService';
import { getTodayString } from '../utils/dateUtils';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';

interface WorkoutPlanCreatorProps {
  onClose: () => void;
}

interface PlanForm {
  exercises: string;
  preWorkoutTaken: string;
  energyToday: 'low' | 'medium' | 'high';
  soreBodyParts: string;
}

const RefreshPlaner: React.FC<WorkoutPlanCreatorProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<PlanForm>();
  const { syncWithServer } = useUser();
  const { addNotification } = useNotifications();

  const steps = [
    { title: 'Workout Info', icon: <User className="w-4 h-4 sm:w-5 sm:h-5" />, shortTitle: 'Info' },
    { title: 'AI Generation', icon: <Brain className="w-4 h-4 sm:w-5 sm:h-5" />, shortTitle: 'Generate' }
  ];

  const generateComprehensiveWorkoutPlan = async (data: PlanForm) => {
    setIsGenerating(true);
    try {
      // Prepare plan input for API
      const planInput = {
        date: getTodayString(),
        preWorkoutTaken: data.preWorkoutTaken === 'Yes',
        energyToday: data.energyToday,
        soreBodyParts: data.soreBodyParts
        
      };

      // Update workout data
      await recommendationService.updateExercises(planInput);

      // Sync with server
      await syncWithServer();

      addNotification({
        type: 'success',
        title: 'Exercies Refresh',
        message: 'Workout plan generated successfully!'
      });

      onClose();
    } catch (error) {
      console.error('Error generating workout plan:', error);
      addNotification({
        type: 'error',
        title : 'Exercies Refresh',
        message: 'Failed to generate workout plan. Please try again.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: PlanForm) => {
    if (currentStep === steps.length - 1) {
      generateComprehensiveWorkoutPlan(data);
    } else {
      nextStep();
    }
  };

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center workout-form-modal"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="workout-form-container bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden"
        >
          {/* Header */}
          <div className="workout-form-header">
            <div className="flex items-center justify-between mb-4">
              <h2 className="workout-form-title">
                AI Refresh Today's Planner Generator
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="workout-form-close-btn"
                disabled={isGenerating}
              >
                <X className="w-5 h-5 text-gray-400" />
              </motion.button>
            </div>

            {/* Progress Steps */}
            <div className="workout-form-steps">
              {steps.map((step, index) => (
                <React.Fragment key={step.title}>
                  <div
                    className={`workout-form-step ${
                      index === currentStep ? 'workout-form-step-active' : 
                      index < currentStep ? 'workout-form-step-completed' : 'workout-form-step-inactive'
                    }`}
                  >
                    <div className="workout-form-step-icon">
                      {step.icon}
                    </div>
                    <span className="workout-form-step-text">{step.title}</span>
                    <span className="workout-form-step-text-mobile">{step.shortTitle}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 ml-1 sm:ml-2 hidden sm:block" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="workout-form-content">
            <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
              <div className="workout-form-scroll-area flex-1">
                <div className="workout-form-main">
                  <AnimatePresence mode="wait">
                    {/* Step 1: Workout Info */}
                    {currentStep === 0 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="workout-form-step-content"
                      >
                        <div>
                          <h3 className="workout-form-section-title">Workout Information</h3>

                          <div className="workout-form-field-wrapper">
                            <label className="workout-form-label">
                              Today's Exercises (comma-separated) *
                            </label>
                            <input
                              {...register('exercises', { 
                                required: 'Please enter at least one exercise'
                              })}
                              type="text"
                              className="workout-form-input"
                              placeholder="Bench Press, Squats, Deadlifts"
                            />
                            {errors.exercises && (
                              <p className="workout-form-error">{errors.exercises.message}</p>
                            )}
                          </div>

                          <div className="workout-form-field-wrapper">
                            <label className="workout-form-label">
                              Pre-Workout Taken *
                            </label>
                            <div className="workout-form-radio-grid">
                              {['Yes', 'No'].map((option) => (
                                <label key={option} className="workout-form-radio-wrapper">
                                  <input
                                    {...register('preWorkoutTaken', { required: 'Please select an option' })}
                                    type="radio"
                                    value={option}
                                    className="sr-only peer"
                                  />
                                  <div className="workout-form-radio-card">
                                    <div className="text-white font-medium text-sm">{option}</div>
                                  </div>
                                </label>
                              ))}
                            </div>
                            {errors.preWorkoutTaken && (
                              <p className="workout-form-error">{errors.preWorkoutTaken.message}</p>
                            )}
                          </div>

                          <div className="workout-form-field-wrapper">
                            <label className="workout-form-label">
                              Energy Level Today *
                            </label>
                            <div className="workout-form-radio-grid">
                              {['low', 'medium', 'high'].map((level) => (
                                <label key={level} className="workout-form-radio-wrapper">
                                  <input
                                    {...register('energyToday', { required: 'Please select your energy level' })}
                                    type="radio"
                                    value={level}
                                    className="sr-only peer"
                                  />
                                  <div className="workout-form-radio-card">
                                    <div className="text-white font-medium text-sm">{level}</div>
                                  </div>
                                </label>
                              ))}
                            </div>
                            {errors.energyToday && (
                              <p className="workout-form-error">{errors.energyToday.message}</p>
                            )}
                          </div>

                          <div className="workout-form-field-wrapper">
                            <label className="workout-form-label">
                              Sore Body Parts (comma-separated) *
                            </label>
                            <input
                              {...register('soreBodyParts', { 
                                required: 'Please enter sore body parts or "None"'
                              })}
                              type="text"
                              className="workout-form-input"
                              placeholder="Legs, Chest, None"
                            />
                            {errors.soreBodyParts && (
                              <p className="workout-form-error">{errors.soreBodyParts.message}</p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: AI Generation */}
                    {currentStep === 1 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="workout-form-generation-content"
                      >
                        {isGenerating ? (
                          <div className="workout-form-generating">
                            <LoadingSpinner size="lg" text="Creating your personalized plan..." />
                            <div className="workout-form-generating-text">
                              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">AI is Creating Your Plan</h3>
                              <p className="text-gray-400 text-sm sm:text-base mb-6">
                                Our AI is analyzing your workout information and generating a personalized plan...
                              </p>
                              <div className="workout-form-progress">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: "100%" }}
                                  transition={{ duration: 4 }}
                                  className="workout-form-progress-bar"
                                />
                                <p className="text-sm text-gray-500 mt-4">Analyzing your workout profile...</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="workout-form-ready">
                            <Brain className="w-12 h-12 sm:w-16 sm:h-16 text-primary-400 mx-auto mb-6" />
                            <div className="text-center">
                              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Ready to Generate Your Plan</h3>
                              <p className="text-gray-400 text-sm sm:text-base">
                                Our AI will create a personalized workout plan based on your exercises, energy level, and condition.
                              </p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Footer Navigation */}
              <div className="workout-form-footer">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 0 || isGenerating}
                  className="workout-form-nav-btn workout-form-nav-btn-secondary"
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </button>

                <motion.button
                  type="submit"
                  disabled={isGenerating}
                  className="workout-form-nav-btn workout-form-nav-btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {currentStep === steps.length - 1 ? (
                    isGenerating ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Generate Plan</span>
                      </>
                    )
                  ) : (
                    <>
                      <span>Next</span>
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </ErrorBoundary>
  );
};

export default RefreshPlaner;