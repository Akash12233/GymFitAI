import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, User, Target, Activity, Brain, Dumbbell, Sparkles, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useUser } from '../contexts/UserContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useAutoFill } from '../contexts/AutoFillContext';
import { useRecommendations } from '../hooks/useRecommendations';
import { authService } from '../services/authService';
import { getTodayString } from '../utils/dateUtils';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';


interface WorkoutPlanCreatorProps {
  onClose: () => void;
}

interface PlanForm {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bodytype : string;
  height: number;
  weight: number;
  bodyFat?: number;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goal: string;
  daysPerWeek: number;
  sessionDuration: number;
  equipment: string;
  workoutStyle: string;
  limitations: string;
  availableTime: string;
}

const WorkoutPlanCreator: React.FC<WorkoutPlanCreatorProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showAutoFillNotification, setShowAutoFillNotification] = useState(false);

  
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<PlanForm>();
  const { userStats,updateUserStats, clearUserData, syncWithServer } = useUser();
  const { addNotification } = useNotifications();
  const { autoFillData, saveAutoFillData, clearAutoFillData, hasAutoFillData, getFieldValue, isFieldAutoFilled } = useAutoFill();
  const { loading: isGenerating, createPlan } = useRecommendations();

  const steps = [
    { title: 'Personal Info', icon: <User className="w-4 h-4 sm:w-5 sm:h-5" />, shortTitle: 'Personal' },
    { title: 'Body Metrics', icon: <Activity className="w-4 h-4 sm:w-5 sm:h-5" />, shortTitle: 'Metrics' },
    { title: 'Goals & Preferences', icon: <Target className="w-4 h-4 sm:w-5 sm:h-5" />, shortTitle: 'Goals' },
    { title: 'Equipment & Style', icon: <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />, shortTitle: 'Equipment' },
    { title: 'AI Generation', icon: <Brain className="w-4 h-4 sm:w-5 sm:h-5" />, shortTitle: 'Generate' }
  ];

  
  const goals = [
    'Weight Loss & Fat Burn',
    'Muscle Building & Strength',
    'Athletic Performance',
    'General Fitness & Health',
    'Flexibility & Mobility',
    'Endurance & Cardio',
    'Body Recomposition',
    'Functional Fitness'
  ];

  const equipmentOptions = [
    'Full Gym Access',
    'Home Gym (Weights & Machines)',
    'Minimal Equipment (Dumbbells, Resistance Bands)',
    'Bodyweight Only',
    'Outdoor/Park Equipment',
    'Hotel/Travel Setup'
  ];

  const workoutStyles = [
    'High-Intensity Interval Training (HIIT)',
    'Traditional Strength Training',
    'Circuit Training',
    'Powerlifting',
    'Bodybuilding',
    'Functional Training',
    'Yoga & Flexibility',
    'Mixed Training'
  ];

  const timeSlots = [
    'Early Morning (5-7 AM)',
    'Morning (7-9 AM)',
    'Mid-Morning (9-11 AM)',
    'Lunch Time (11 AM-1 PM)',
    'Afternoon (1-4 PM)',
    'Evening (4-7 PM)',
    'Night (7-9 PM)',
    'Flexible/Varies'
  ];

  // Auto-fill form fields on component mount
  useEffect(() => {
    if (hasAutoFillData && autoFillData) {
      const fieldsToFill: (keyof PlanForm)[] = [
        'name', 'age', 'gender', 'height', 'weight', 'bodyFat', 'fitnessLevel', 'bodytype',
        'goal', 'daysPerWeek', 'sessionDuration', 'equipment', 'workoutStyle',
        'limitations', 'availableTime'
      ];

      fieldsToFill.forEach(field => {
        const value = getFieldValue(field as keyof typeof autoFillData);
        if (value !== undefined) {
          setValue(field, value);
        }
      });

      setShowAutoFillNotification(true);
      setTimeout(() => setShowAutoFillNotification(false), 5000);
    }
  }, [hasAutoFillData, autoFillData, setValue, getFieldValue]);

  const generateComprehensiveWorkoutPlan = async (data: PlanForm) => {
    try {
      // Save current form data for future auto-fill
      saveAutoFillData({
        ...data,
        strengthInfo: userStats?.strengthInfo || {
          maxPushups: data.fitnessLevel === 'beginner' ? 10 : data.fitnessLevel === 'intermediate' ? 20 : 30,
          maxPullups: data.fitnessLevel === 'beginner' ? 2 : data.fitnessLevel === 'intermediate' ? 5 : 10,
          maxSquats: data.fitnessLevel === 'beginner' ? 15 : data.fitnessLevel === 'intermediate' ? 25 : 40,
          maxBenchKg: 10,
          maxSquatkg: 10,
          maxDeadliftkg: 10
        }
      });
      
      // Clear existing user data before creating new plan
      clearUserData();
      
      // Update user stats
      updateUserStats({
        age: data.age,
        gender: data.gender,
        height: data.height,
        weight: data.weight,
        bodyFat: data.bodyFat,
        goal: data.goal,
        fitnessLevel: data.fitnessLevel,
      });

      // Prepare plan input for API
      const planInput = {
        date: getTodayString(),
        profile: {
          name: data.name,
          gender: data.gender,
          age: data.age,
          bodytype: data.bodytype,
          weightKg: data.weight,
          heightCm: data.height,
          bodyfat: data.bodyFat,
          experienceLevel: data.fitnessLevel,
          daysPerWeek: data.daysPerWeek
        },
        strengthInfo : {
          maxPushups: userStats?.strengthInfo?.maxPushups || data.fitnessLevel === 'beginner' ? 10 : data.fitnessLevel === 'intermediate' ? 20 : 30,
          maxPullups: userStats?.strengthInfo?.maxPullups || data.fitnessLevel === 'beginner' ? 2 : data.fitnessLevel === 'intermediate' ? 5 : 10,
          maxSquats: userStats?.strengthInfo?.maxSquats || data.fitnessLevel === 'beginner' ? 15 : data.fitnessLevel === 'intermediate' ? 25 : 40,
          maxBenchKg: userStats?.strengthInfo?.maxBenchKg || 10,
          maxSquatkg: userStats?.strengthInfo?.maxSquatkg || 10,
          maxDeadliftkg: userStats?.strengthInfo?.maxDeadliftkg || 10
        },
        preferences: {
          goal: data.goal,
          daysPerWeek: data.daysPerWeek,
          planStyle: data.workoutStyle,
          sessionDuration: data.sessionDuration,
          equipment:data.equipment,
          limitations: data.limitations,
          availableTime: data.availableTime
        }
      };

      await authService.updateProfile(planInput);
    
      await createPlan(planInput);
     
     
      // Sync with server to get the latest data
      await syncWithServer();
     
      onClose();
    } catch (error) {
      console.error('Error generating workout plan:', error);
      // Error is already handled by the hook
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

  const handleClearAutoFill = () => {
    clearAutoFillData();
    reset();
    addNotification({
      type: 'info',
      title: 'Auto-fill Data Cleared',
      message: 'All previously saved form data has been cleared. You can now start fresh.'
    });
  };

  const AutoFillIndicator: React.FC<{ fieldName: keyof PlanForm }> = ({ fieldName }) => {
    if (!isFieldAutoFilled(fieldName as keyof typeof autoFillData)) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center space-x-1 ml-2 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
      >
        <Sparkles className="w-3 h-3" />
        <span>Auto-filled</span>
      </motion.div>
    );
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
          {/* Auto-fill Notification */}
          <AnimatePresence>
            {showAutoFillNotification && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-blue-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center space-x-2"
              >
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium">Form auto-filled with your previous data</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="workout-form-header">
            <div className="flex items-center justify-between mb-4">
              <h2 className="workout-form-title">
                AI Workout Plan Generator
              </h2>
              <div className="flex items-center space-x-2">
                {hasAutoFillData && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClearAutoFill}
                    className="hidden sm:flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 text-sm"
                    title="Clear auto-fill data"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Clear Auto-fill</span>
                  </motion.button>
                )}
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
            </div>
            
            {/* Auto-fill Status */}
            {hasAutoFillData && (
              <div className="workout-form-autofill-status">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-300 text-sm font-medium">
                      Smart Auto-fill Active
                    </span>
                  </div>
                  <span className="text-blue-400 text-xs">
                    Form fields populated from your previous plan
                    {autoFillData?.planCount && ` (Plan #${autoFillData.planCount})`}
                  </span>
                </div>
              </div>
            )}
            
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
                  {/* Step 1: Personal Info */}
                  {currentStep === 0 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="workout-form-step-content"
                    >
                      <div>
                        <h3 className="workout-form-section-title">Personal Information</h3>
                        
                        <div className="workout-form-grid-2">
                          <div className="workout-form-field-wrapper">
                            <label className="workout-form-label">
                              Full Name *
                              <AutoFillIndicator fieldName="name" />
                            </label>
                            <input
                              {...register('name', { required: 'Name is required' })}
                              className="workout-form-input"
                              placeholder="Enter your full name"
                            />
                            {errors.name && (
                              <p className="workout-form-error">{errors.name.message}</p>
                            )}
                          </div>

                          <div className="workout-form-field-wrapper">
                            <label className="workout-form-label">
                              Age *
                              <AutoFillIndicator fieldName="age" />
                            </label>
                            <input
                              {...register('age', { 
                                required: 'Age is required',
                                min: { value: 13, message: 'Must be at least 13 years old' },
                                max: { value: 100, message: 'Must be under 100 years old' }
                              })}
                              type="number"
                              className="workout-form-input"
                              placeholder="25"
                            />
                            {errors.age && (
                              <p className="workout-form-error">{errors.age.message}</p>
                            )}
                          </div>
                        </div>

                        <div className="workout-form-field-wrapper">
                          <label className="workout-form-label">
                            Gender *
                            <AutoFillIndicator fieldName="gender" />
                          </label>
                          <div className="workout-form-radio-grid">
                            {['male', 'female', 'other'].map((gender) => (
                              <label key={gender} className="workout-form-radio-wrapper">
                                <input
                                  {...register('gender', { required: 'Please select your gender' })}
                                  type="radio"
                                  value={gender}
                                  className="sr-only peer"
                                />
                                <div className="workout-form-radio-card">
                                  <span className="text-white capitalize">{gender}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                          {errors.gender && (
                            <p className="workout-form-error">{errors.gender.message}</p>
                          )}
                        </div>

                        <div className="workout-form-field-wrapper">
                          <label className="workout-form-label">
                            Body Type *
                            <AutoFillIndicator fieldName="gender" />
                          </label>
                          <div className="workout-form-radio-grid">
                            {['Mesomorph', 'Ectomorph', 'Endomorph'].map((type) => (
                              <label key={type} className="workout-form-radio-wrapper">
                                <input
                                  {...register('bodytype', { required: 'Please select your Body Type' })}
                                  type="radio"
                                  value={type}
                                  className="sr-only peer"
                                />
                                <div className="workout-form-radio-card">
                                  <span className="text-white capitalize">{type}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                          {errors.bodytype && (
                            <p className="workout-form-error">{errors.bodytype.message}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Body Metrics */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="workout-form-step-content"
                    >
                      <div>
                        <h3 className="workout-form-section-title">Body Metrics</h3>
                        
                        <div className="workout-form-grid-2">
                          <div className="workout-form-field-wrapper">
                            <label className="workout-form-label">
                              Height (cm) *
                              <AutoFillIndicator fieldName="height" />
                            </label>
                            <input
                              {...register('height', { 
                                required: 'Height is required',
                                min: { value: 100, message: 'Height must be at least 100cm' },
                                max: { value: 250, message: 'Height must be under 250cm' }
                              })}
                              type="number"
                              className="workout-form-input"
                              placeholder="175"
                            />
                            {errors.height && (
                              <p className="workout-form-error">{errors.height.message}</p>
                            )}
                          </div>

                          <div className="workout-form-field-wrapper">
                            <label className="workout-form-label">
                              Weight (kg) *
                              <AutoFillIndicator fieldName="weight" />
                            </label>
                            <input
                              {...register('weight', { 
                                required: 'Weight is required',
                                min: { value: 30, message: 'Weight must be at least 30kg' },
                                max: { value: 300, message: 'Weight must be under 300kg' }
                              })}
                              type="number"
                              className="workout-form-input"
                              placeholder="70"
                            />
                            {errors.weight && (
                              <p className="workout-form-error">{errors.weight.message}</p>
                            )}
                          </div>
                        </div>

                        <div className="workout-form-field-wrapper">
                          <label className="workout-form-label">
                            Body Fat % (Optional)
                            <AutoFillIndicator fieldName="bodyFat" />
                          </label>
                          <input
                            {...register('bodyFat', { 
                              min: { value: 3, message: 'Body fat must be at least 3%' },
                              max: { value: 50, message: 'Body fat must be under 50%' }
                            })}
                            type="number"
                            className="workout-form-input"
                            placeholder="15"
                          />
                          <p className="workout-form-helper-text">
                            If you don't know your body fat percentage, you can leave this blank
                          </p>
                          {errors.bodyFat && (
                            <p className="workout-form-error">{errors.bodyFat.message}</p>
                          )}
                        </div>

                        <div className="workout-form-field-wrapper">
                          <label className="workout-form-label">
                            Fitness Level *
                            <AutoFillIndicator fieldName="fitnessLevel" />
                          </label>
                          <div className="workout-form-radio-grid">
                            {[
                              { value: 'beginner', label: 'Beginner', desc: 'New to fitness' },
                              { value: 'intermediate', label: 'Intermediate', desc: '6+ months' },
                              { value: 'advanced', label: 'Advanced', desc: '2+ years' }
                            ].map((level) => (
                              <label key={level.value} className="workout-form-radio-wrapper">
                                <input
                                  {...register('fitnessLevel', { required: 'Please select your fitness level' })}
                                  type="radio"
                                  value={level.value}
                                  className="sr-only peer"
                                />
                                <div className="workout-form-radio-card">
                                  <div className="text-white font-medium text-sm">{level.label}</div>
                                  <div className="text-gray-400 text-xs mt-1 hidden sm:block">{level.desc}</div>
                                </div>
                              </label>
                            ))}
                          </div>
                          {errors.fitnessLevel && (
                            <p className="workout-form-error">{errors.fitnessLevel.message}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Goals & Preferences */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="workout-form-step-content"
                    >
                      <div>
                        <h3 className="workout-form-section-title">Goals & Preferences</h3>
                        
                        <div className="workout-form-field-wrapper">
                          <label className="workout-form-label">
                            Primary Fitness Goal *
                            <AutoFillIndicator fieldName="goal" />
                          </label>
                          <div className="workout-form-option-grid">
                            {goals.map((goal) => (
                              <label key={goal} className="workout-form-option-wrapper">
                                <input
                                  {...register('goal', { required: 'Please select your primary goal' })}
                                  type="radio"
                                  value={goal}
                                  className="sr-only peer"
                                />
                                <div className="workout-form-option-card">
                                  <span className="text-white text-sm">{goal}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                          {errors.goal && (
                            <p className="workout-form-error">{errors.goal.message}</p>
                          )}
                        </div>

                        <div className="workout-form-grid-2">
                          <div className="workout-form-field-wrapper">
                            <label className="workout-form-label">
                              Days per Week *
                              <AutoFillIndicator fieldName="daysPerWeek" />
                            </label>
                            <select
                              {...register('daysPerWeek', { required: 'Please select workout frequency' })}
                              className="workout-form-select"
                            >
                              <option value="">Select frequency</option>
                              <option value="1">1 day (Beginner friendly)</option>
                              <option value="3">3 days (Beginner friendly)</option>
                              <option value="4">4 days (Balanced approach)</option>
                              <option value="5">5 days (Intermediate/Advanced)</option>
                              <option value="6">6 days (Advanced athletes)</option>
                              <option value="7">7 days (Elite level)</option>
                            </select>
                            {errors.daysPerWeek && (
                              <p className="workout-form-error">{errors.daysPerWeek.message}</p>
                            )}
                          </div>

                          <div className="workout-form-field-wrapper">
                            <label className="workout-form-label">
                              Session Duration *
                              <AutoFillIndicator fieldName="sessionDuration" />
                            </label>
                            <select
                              {...register('sessionDuration', { required: 'Please select session duration' })}
                              className="workout-form-select"
                            >
                              <option value="">Select duration</option>
                              <option value="30">30 minutes (Quick sessions)</option>
                              <option value="45">45 minutes (Standard)</option>
                              <option value="60">60 minutes (Comprehensive)</option>
                              <option value="75">75 minutes (Intensive)</option>
                              <option value="90">90 minutes (Extended)</option>
                            </select>
                            {errors.sessionDuration && (
                              <p className="workout-form-error">{errors.sessionDuration.message}</p>
                            )}
                          </div>
                        </div>

                        <div className="workout-form-field-wrapper">
                          <label className="workout-form-label">
                            Available Time Slots
                            <AutoFillIndicator fieldName="availableTime" />
                          </label>
                          <select
                            {...register('availableTime')}
                            className="workout-form-select"
                          >
                            <option value="">Select preferred time</option>
                            {timeSlots.map((time) => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Equipment & Style */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="workout-form-step-content"
                    >
                      <div>
                        <h3 className="workout-form-section-title">Equipment & Workout Style</h3>
                        
                        <div className="workout-form-field-wrapper">
                          <label className="workout-form-label">
                            Available Equipment *
                            <AutoFillIndicator fieldName="equipment" />
                          </label>
                          <div className="workout-form-option-grid">
                            {equipmentOptions.map((equipment) => (
                              <label key={equipment} className="workout-form-option-wrapper">
                                <input
                                  {...register('equipment', { required: 'Please select available equipment' })}
                                  type="radio"
                                  value={equipment}
                                  className="sr-only peer"
                                />
                                <div className="workout-form-option-card">
                                  <span className="text-white text-sm font-medium">{equipment}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                          {errors.equipment && (
                            <p className="workout-form-error">{errors.equipment.message}</p>
                          )}
                        </div>

                        <div className="workout-form-field-wrapper">
                          <label className="workout-form-label">
                            Preferred Workout Style *
                            <AutoFillIndicator fieldName="workoutStyle" />
                          </label>
                          <div className="workout-form-option-grid">
                            {workoutStyles.map((style) => (
                              <label key={style} className="workout-form-option-wrapper">
                                <input
                                  {...register('workoutStyle', { required: 'Please select a workout style' })}
                                  type="radio"
                                  value={style}
                                  className="sr-only peer"
                                />
                                <div className="workout-form-option-card">
                                  <span className="text-white text-sm font-medium">{style}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                          {errors.workoutStyle && (
                            <p className="workout-form-error">{errors.workoutStyle.message}</p>
                          )}
                        </div>

                        <div className="workout-form-field-wrapper">
                          <label className="workout-form-label">
                            Physical Limitations or Injuries
                            <AutoFillIndicator fieldName="limitations" />
                          </label>
                          <textarea
                            {...register('limitations')}
                            className="workout-form-textarea"
                            rows={3}
                            placeholder="Describe any injuries, limitations, or exercises to avoid. This helps our AI create a safer, more personalized workout plan..."
                          />
                          <p className="workout-form-helper-text">
                            This information helps create a safer, more personalized workout plan
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 5: AI Generation */}
                  {currentStep === 4 && (
                    <motion.div
                      key="step5"
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
                              Our AI is analyzing your profile and generating a personalized workout plan...
                            </p>
                            <div className="workout-form-progress">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 4 }}
                                className="workout-form-progress-bar"
                              />
                              <p className="text-sm text-gray-500 mt-4">Analyzing your fitness profile...</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="workout-form-ready">
                          <Brain className="w-12 h-12 sm:w-16 sm:h-16 text-primary-400 mx-auto mb-6" />
                          <div className="text-center">
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Ready to Generate Your Plan</h3>
                            <p className="text-gray-400 text-sm sm:text-base">
                              Our AI will create a personalized workout plan based on your profile, goals, and preferences.
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

export default WorkoutPlanCreator;