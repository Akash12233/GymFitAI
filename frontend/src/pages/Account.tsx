import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Settings, 
  CreditCard, 
  BarChart3, 
  Camera,
  Bell,
  Shield,
  Globe,
  Moon,
  Sun,
  Download,
  Trash2,
  Edit3,
  Save,
  X,
  Upload,
  Eye,
  Plus,
  Check,
  AlertCircle,
  Star,
  Activity,
  Target,
  Utensils,
  Clock,
  CheckCircle,
  Calculator,
  TrendingUp,
  Info,
  Brain,
  Crown,
  Sparkles
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useForm } from 'react-hook-form';
import { authService } from '../services/authService';
import { recommendationService } from '../services/recommendationService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

interface ProfileForm {
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  bodyFat?: number;
  bodyType: string;
  bodyTypeNotes: string;
}

interface BodyFatCalculation {
  waist: number;
  neck: number;
  hip?: number;
  bodyFatPercentage: number;
  classification: string;
  recommendedRange: string;
  date: string;
}

interface ProgressPhoto {
  id: string;
  url: string;
  date: string;
  file?: File;
}

const Account: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [selectedBodyType, setSelectedBodyType] = useState('average');
  const [darkMode, setDarkMode] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bodyFatMeasurements, setBodyFatMeasurements] = useState({
    waist: '',
    neck: '',
    hip: ''
  });
  console.log(user);
  const hasSubscription = user?.tier === 'premium';

  const [bodyFatResult, setBodyFatResult] = useState<BodyFatCalculation | null>(null);
  const [bodyFatHistory, setBodyFatHistory] = useState<BodyFatCalculation[]>([
    { 
      waist: 85, 
      neck: 38, 
      hip: 95, 
      bodyFatPercentage: 15.2, 
      classification: 'Fitness', 
      recommendedRange: '14-17%',
      date: '2024-01-01' 
    },
    { 
      waist: 83, 
      neck: 38, 
      hip: 94, 
      bodyFatPercentage: 14.8, 
      classification: 'Fitness', 
      recommendedRange: '14-17%',
      date: '2024-01-15' 
    }
  ]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([
  ]);
  const [showAnalytics, setshowAnalytics] = useState(false);
  const navigate = useNavigate();

  const currentWeigth  = user?.profile.weightKg || 0;
  const currentBodyfat = user?.profile.bodyfat || 0;
  const Height = user?.profile.heightCm || 100;
  const currentBMI= (currentWeigth / ((Height/100) * (Height/100)));
  const category = ((bmi: number): string => {
  if (bmi < 18.5) {
    return "Underweight";
  } else if (bmi >= 18.5 && bmi <= 24.9) {
    return "Healthy Weight";
  } else if (bmi >= 25 && bmi <= 29.9) {
    return "Overweight";
  } else if (bmi >= 30) {
    return "Obesity";
  } else {
    return "Invalid BMI";
  }
})(currentBMI); 

  useEffect(() => {
      const fetchimages = async () => {
        try {
          const response = await authService.getWorkoutPhotos();
          setProgressPhotos(response);
        } catch (error) {
          console.error('Error fetching images:', error);
        }
      }
      fetchimages();
  }, []);

  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    progressUpdates: true,
    socialUpdates: false,
    marketingEmails: false
  });

  const { register, handleSubmit, reset, watch, formState: { errors }, setValue } = useForm<ProfileForm>();
    useEffect(() => {
    if (user?.profile) {
      reset({
        name: user.profile.name || '',
        email: user.email || '',
        age: user.profile.age || 0,
        gender: user.profile.gender || 'male',
        height: user.profile.heightCm || 0,
        weight: user.profile.weightKg || 0,
        bodyFat: user.profile.bodyfat || 15,
        bodyType: user.profile.bodytype || '',
        bodyTypeNotes: ''
      });
    }
  }, [user]);
  const watchedBodyType = watch('bodyType');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: <User className="w-5 h-5" /> },
    { id: 'analytics', name: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'settings', name: 'Settings', icon: <Settings className="w-5 h-5" /> },
    { id: 'billing', name: 'Billing', icon: <CreditCard className="w-5 h-5" /> }
  ];

  const bodyTypes = [
    {
      value: 'ectomorph',
      label: 'Ectomorph',
      description: 'Naturally lean, fast metabolism, difficulty gaining weight',
      image: 'https://images.pexels.com/photos/1552108/pexels-photo-1552108.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&fit=crop'
    },
    {
      value: 'mesomorph',
      label: 'Mesomorph',
      description: 'Athletic build, gains muscle easily, moderate metabolism',
      image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&fit=crop'
    },
    {
      value: 'endomorph',
      label: 'Endomorph',
      description: 'Larger frame, gains weight easily, slower metabolism',
      image: 'https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&fit=crop'
    }
  ];

  
  const stats = [
    {
      label: 'Current Streak',
      value: `${user?.profile.currentStreak} days`,
      icon: <Activity className="w-5 h-5 text-orange-400" />,
      color: 'from-orange-500 to-red-500'
    },
    {
      label: 'Workouts Completed',
      value: user?.profile.workoutsCompleted,
      icon: <Target className="w-5 h-5 text-green-400" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Success Rate',
      value: `${Math.round(((user?.profile.workoutsCompleted ?? 0) / (user?.profile.totalWorkouts ?? 1)) * 100)}%`,
      icon: <Crown className="w-5 h-5 text-yellow-400" />,
      color: 'from-yellow-500 to-orange-500'
    }
  ];


  // Mock analytics data
  const [progressData, setprogressData] = useState<{
      date: string;
      weight: number;
      BodyFat: number;
    }[]>([]);

  // Body type data
  const bodyTypesData = {
    Lean: {
      name: 'Lean',
      image: 'https://images.pexels.com/photos/1229356/pexels-photo-1229356.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop',
      description: 'Naturally slim build with low body fat and visible muscle definition. Fast metabolism makes weight gain challenging but muscle definition comes easier.',
      characteristics: ['Low body fat (8-15%)', 'Narrow shoulders', 'Fast metabolism', 'Visible muscle definition'],
      exercises: [
        'Compound movements (squats, deadlifts)',
        'Progressive overload training',
        'Pull-ups and chin-ups',
        'Bench press and overhead press',
        'Minimal cardio, focus on strength'
      ],
      mealPlan: {
        breakfast: 'Oatmeal with banana, nuts, and protein powder',
        snack1: 'Greek yogurt with berries and granola',
        lunch: 'Grilled chicken, quinoa, and roasted vegetables',
        snack2: 'Protein shake with almond butter',
        dinner: 'Salmon, sweet potato, and steamed broccoli',
        tips: 'Eat frequently (every 2-3 hours), focus on calorie-dense foods, aim for 2500-3000+ calories daily'
      }
    },
    Average: {
      name: 'Average',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop',
      description: 'Balanced proportions with moderate muscle mass and body fat. Responds well to consistent training and adapts to various fitness goals effectively.',
      characteristics: ['Balanced build (12-20% body fat)', 'Proportional frame', 'Good training response', 'Versatile metabolism'],
      exercises: [
        'Mixed training approach',
        'Strength training 3-4x per week',
        'Moderate cardio sessions',
        'Functional movements',
        'Sport-specific activities'
      ],
      mealPlan: {
        breakfast: 'Scrambled eggs with whole grain toast and avocado',
        snack1: 'Apple with almond butter',
        lunch: 'Turkey and vegetable wrap with hummus',
        snack2: 'Mixed nuts and dried fruit',
        dinner: 'Lean beef, brown rice, and green beans',
        tips: 'Balanced macronutrients, moderate portions, adjust calories based on goals (2000-2500 daily)'
      }
    },
    Fit: {
      name: 'Fit',
      image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop',
      description: 'Athletic build with good muscle development and low body fat. Regular training has resulted in visible fitness and strength gains.',
      characteristics: ['Athletic build (10-18% body fat)', 'Good muscle definition', 'Strong cardiovascular health', 'Efficient recovery'],
      exercises: [
        'Advanced compound movements',
        'High-intensity interval training',
        'Plyometric exercises',
        'Olympic lifts and variations',
        'Sport-specific performance training'
      ],
      mealPlan: {
        breakfast: 'Protein pancakes with berries and honey',
        snack1: 'Pre-workout banana and coffee',
        lunch: 'Grilled chicken salad with quinoa',
        snack2: 'Post-workout protein shake with chocolate milk',
        dinner: 'Grilled fish, wild rice, and asparagus',
        tips: 'Performance-focused nutrition, timing around workouts, 2200-2800 calories based on training intensity'
      }
    },
    Muscular: {
      name: 'Muscular',
      image: 'https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop',
      description: 'Well-developed muscle mass with broad shoulders and defined physique. Responds excellently to strength training and builds muscle efficiently.',
      characteristics: ['High muscle mass (12-20% body fat)', 'Broad shoulders', 'Strong frame', 'Excellent strength gains'],
      exercises: [
        'Heavy compound lifts',
        'Progressive overload focus',
        'Power movements',
        'Isolation exercises for definition',
        'Periodized training programs'
      ],
      mealPlan: {
        breakfast: 'Protein smoothie with oats, banana, and peanut butter',
        snack1: 'Cottage cheese with berries',
        lunch: 'Grilled steak, sweet potato, and vegetables',
        snack2: 'Protein bar and chocolate milk',
        dinner: 'Grilled chicken breast, quinoa, and steamed vegetables',
        tips: 'High protein intake (1.6-2.2g per kg), calorie cycling, focus on post-workout nutrition (2800-3500+ calories)'
      }
    },
    Larger: {
      name: 'Larger Body',
      image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop',
      description: 'Robust frame with higher body fat percentage but often substantial muscle underneath. Strong foundation for building both strength and endurance.',
      characteristics: ['Solid frame (20-35%+ body fat)', 'Natural strength', 'Strong bone structure', 'Good muscle potential'],
      exercises: [
        'Low-impact cardio (walking, swimming)',
        'Resistance training with proper form',
        'Functional movement patterns',
        'Gradual progression',
        'Focus on consistency over intensity'
      ],
      mealPlan: {
        breakfast: 'Steel-cut oats with berries and nuts',
        snack1: 'Apple with small portion of nuts',
        lunch: 'Large salad with grilled chicken and olive oil dressing',
        snack2: 'Vegetable sticks with hummus',
        dinner: 'Baked fish, steamed vegetables, and small portion of rice',
        tips: 'Focus on whole foods, portion control, create calorie deficit (1800-2200 calories), stay hydrated'
      }
    }
  };

  const selectedBodyTypeData = bodyTypesData[selectedBodyType as keyof typeof bodyTypesData];
  const currentGender = watch('gender');
  const currentHeight = watch('height');

  // Body fat calculation functions
  const calculateBodyFat = () => {
    const waist = parseFloat(bodyFatMeasurements.waist);
    const neck = parseFloat(bodyFatMeasurements.neck);
    const hip = parseFloat(bodyFatMeasurements.hip);
    const height = currentHeight || 175;
    const gender = currentGender || 'male';

    // Validation
    const errors: Record<string, string> = {};
    
    if (!waist || waist < 50 || waist > 200) {
      errors.waist = 'Waist measurement must be between 50-200 cm';
    }
    if (!neck || neck < 25 || neck > 60) {
      errors.neck = 'Neck measurement must be between 25-60 cm';
    }
    if (gender === 'female' && (!hip || hip < 60 || hip > 200)) {
      errors.hip = 'Hip measurement must be between 60-200 cm';
    }
    if (!height || height < 100 || height > 250) {
      errors.height = 'Height must be between 100-250 cm';
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    let bodyFatPercentage: number;

    try {
      if (gender === 'male') {
        // Male formula: 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
        const denominator = 1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height);
        bodyFatPercentage = (495 / denominator) - 450;
      } else {
        // Female formula: 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
        const denominator = 1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height);
        bodyFatPercentage = (495 / denominator) - 450;
      }

      // Clamp result to reasonable range
      bodyFatPercentage = Math.max(3, Math.min(50, bodyFatPercentage));

      const classification = getBodyFatClassification(bodyFatPercentage, gender);
      const recommendedRange = getRecommendedRange(gender);

      const result: BodyFatCalculation = {
        waist,
        neck,
        hip: gender === 'female' ? hip : undefined,
        bodyFatPercentage: Math.round(bodyFatPercentage * 10) / 10,
        classification,
        recommendedRange,
        date: new Date().toISOString().split('T')[0]
      };

      setBodyFatResult(result);
    } catch (error) {
      setValidationErrors({ calculation: 'Error in calculation. Please check your measurements.' });
    }
  };

  const getBodyFatClassification = (bodyFat: number, gender: string) => {
    if (gender === 'male') {
      if (bodyFat < 6) return 'Essential Fat';
      if (bodyFat < 14) return 'Athletes';
      if (bodyFat < 18) return 'Fitness';
      if (bodyFat < 25) return 'Average';
      return 'Obese';
    } else {
      if (bodyFat < 12) return 'Essential Fat';
      if (bodyFat < 17) return 'Athletes';
      if (bodyFat < 21) return 'Fitness';
      if (bodyFat < 25) return 'Average';
      return 'Obese';
    }
  };

  const getRecommendedRange = (gender: string) => {
    return gender === 'male' ? '10-18%' : '16-24%';
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'Essential Fat': return 'text-red-400';
      case 'Athletes': return 'text-green-400';
      case 'Fitness': return 'text-blue-400';
      case 'Average': return 'text-yellow-400';
      case 'Obese': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const saveBodyFatResult = () => {
    if (bodyFatResult) {
      setBodyFatHistory(prev => [bodyFatResult, ...prev]);
      setBodyFatResult(null);
      setBodyFatMeasurements({ waist: '', neck: '', hip: '' });
      setValidationErrors({});
      addNotification({
        type: 'success',
        title: 'Body Fat Result Saved!',
        message: 'Your measurement has been added to your progress history.'
      });
    }
  };

  const handleSave = async (data: ProfileForm) => {
    setSaving(true);
    try {
      
          await authService.updateAccountDetails(data);
          addNotification({type: 'info',
          title: 'Profile updated',
          message: 'All previously saved form data has been saved. You can now start fresh.'
    });
          setIsEditing(false);
        } catch (error) {
          addNotification({type: 'info',
          title: 'Error',
          message: 'You can now start fresh.'
    });
        } finally {
          setSaving(false);
        }
  };

  const handlePhotoUpload = async(files: FileList | null) => {
    if (!files) return;
    try {
      console.log(files);
      
      await authService.uploadWorkoutPhotos(files);
      addNotification({type: 'info',
      title: 'Photos uploaded',
      message: 'You can now start fresh.'});
    } catch (error) {
      addNotification({type: 'info',
          title: 'Error',
          message: 'You can now start fresh.'
    });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handlePhotoUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const generateAnalyticsData = async()=>{
    try {
        setIsGenerating(true);
        const response = await recommendationService.getHistoryPrediction();
        setprogressData(response.progressData);
        setSelectedBodyType(response.BodyType);
        setshowAnalytics(true);
        setIsGenerating(false);
    } catch (error) {
      setIsGenerating(false);
    }
  }

  const handleChangePassword = async () => {
    try {
      const response = await authService.changePassword(oldPassword, newPassword);
      if(response){
        alert('Password updated successfully!');
      }
      else{
        alert('Password update failed!');
      }
      setShowModal(false);
    } catch (error) {
      alert('Error: ' + (error as Error).message);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Profile Information</h2>
        <button
          onClick={() => isEditing ? handleSubmit(handleSave)() : setIsEditing(true)}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : isEditing ? (
            <Save className="w-4 h-4" />
          ) : (
            <Edit3 className="w-4 h-4" />
          )}
          {isSaving ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
        </button>
      </div>
     {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800/60 rounded-xl p-6 border border-gray-700 mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-neon-pink rounded-full flex items-center justify-center text-2xl font-bold text-white">
                {user?.profile.name?.charAt(0) || 'U'}
               
              </div>
              <button className="absolute hidden -bottom-1 -right-1 p-2 bg-primary-600 rounded-full hover:bg-primary-700 transition-colors duration-200">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user?.profile.name}</h2>
              <p className="text-gray-400">{user?.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-400 capitalize">{user?.tier} Member</span>
              </div>
            </div>
          </div>
        </motion.div>
      <form onSubmit={handleSubmit(handleSave)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
            <input
              {...register('name', { required: 'Name is required' })}
              disabled={!isEditing}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-50"
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              disabled={!isEditing}
              type="email"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-50"
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
              <input
                {...register('age', { 
                  required: 'Age is required',
                  min: { value: 13, message: 'Must be at least 13' },
                  max: { value: 120, message: 'Must be under 120' }
                })}
                disabled={!isEditing}
                type="number"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-50"
              />
              {errors.age && <p className="text-red-400 text-sm mt-1">{errors.age.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
              <select
                {...register('gender')}
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-50"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Height (cm)</label>
              <input
                {...register('height', { 
                  required: 'Height is required',
                  min: { value: 100, message: 'Must be at least 100cm' },
                  max: { value: 250, message: 'Must be under 250cm' }
                })}
                disabled={!isEditing}
                type="number"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-50"
              />
              {errors.height && <p className="text-red-400 text-sm mt-1">{errors.height.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Weight (kg)</label>
              <input
                {...register('weight', { 
                  required: 'Weight is required',
                  min: { value: 30, message: 'Must be at least 30kg' },
                  max: { value: 300, message: 'Must be under 300kg' }
                })}
                disabled={!isEditing}
                type="number"
                step="0.1"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-50"
              />
              {errors.weight && <p className="text-red-400 text-sm mt-1">{errors.weight.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Body Fat % (optional)</label>
            <input
              {...register('bodyFat', { 
                min: { value: 3, message: 'Must be at least 3%' },
                max: { value: 50, message: 'Must be under 50%' }
              })}
              disabled={!isEditing}
              type="number"
              step="0.1"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-50"
            />
            {errors.bodyFat && <p className="text-red-400 text-sm mt-1">{errors.bodyFat.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Body Type</label>
            <select
              {...register('bodyType')}
              disabled={!isEditing}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white disabled:opacity-50"
              onChange={(e) => {
                setValue('bodyType', e.target.value);
                setSelectedBodyType(e.target.value);
              }}
            >
              {bodyTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
      </form>

      

      {/* Progress Photos */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Progress Photos
        </h3>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver ? 'border-blue-400 bg-blue-400/10' : 'border-gray-600 hover:border-gray-500'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300 mb-2">Drag and drop photos here, or click to select</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Select Photos
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handlePhotoUpload(e.target.files)}
            className="hidden"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {progressPhotos.map(photo => (
            <div key={photo.id} className="relative group">
              <img
                src={photo.url}
                alt={`Progress ${photo.date}`}
                className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setSelectedPhoto(photo)}
              />
              <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {new Date(photo.date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
const renderAnalyticsTab = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Current Weight</h3>
              <p className="text-gray-400 text-sm">Latest measurement</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-white"> {currentWeigth} kg</p>
          <p className="text-green-400 text-sm mt-1">-2.0 kg this month</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Target className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Body Fat</h3>
              <p className="text-gray-400 text-sm">Current percentage</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-white"> {currentBodyfat}%</p>
          <p className="text-green-400 text-sm mt-1">-1.0% this month</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Activity className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">BMI</h3>
              <p className="text-gray-400 text-sm">Body Mass Index</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{currentBMI.toFixed(2)}</p>
          <p className="text-green-400 text-sm mt-1">{category}</p>
        </div>
        </div>
        <motion.button
        onClick={generateAnalyticsData}
        disabled={isGenerating}
        className="w-full text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isGenerating ? (
          <>
            <LoadingSpinner size="sm" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Brain className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Generate Future Analytics</span>
          </>
        )}
      </motion.button>
            {showAnalytics && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Progress Over Time</h3>
          <div className="h-80 min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F3F4F6',
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  name="Weight (kg)"
                />
                <Line
                  type="monotone"
                  dataKey="bodyFat"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  name="Body Fat (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {showAnalytics &&selectedBodyTypeData && (
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            {selectedBodyTypeData.image && (
              <img
                src={selectedBodyTypeData.image}
                alt={`Image of ${selectedBodyTypeData.name} body type`}
                className="w-16 h-20 object-cover rounded-lg"
              />
            )}
            <div>
              <h3 className="text-xl font-bold text-white">{selectedBodyTypeData.name}</h3>
              <p className="text-gray-300 text-sm">{selectedBodyTypeData.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Characteristics
              </h4>
              <ul className="space-y-2">
                {selectedBodyTypeData.characteristics.map((char, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {char}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Recommended Exercises
              </h4>
              <ul className="space-y-2">
                {selectedBodyTypeData.exercises.map((exercise, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    {exercise}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-orange-400" />
              Sample Meal Plan
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedBodyTypeData.mealPlan &&
                Object.entries(selectedBodyTypeData.mealPlan)
                  .filter(([key]) => key !== 'tips')
                  .map(([meal, food]) => (
                    <div key={meal} className="bg-gray-700 rounded-lg p-3">
                      <h5 className="font-medium text-orange-400 capitalize mb-1">
                        {meal.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                      </h5>
                      <p className="text-gray-300 text-sm">{food}</p>
                    </div>
                  ))}
            </div>
            {selectedBodyTypeData.mealPlan?.tips && (
              <div className="mt-4 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
                <h5 className="font-medium text-blue-400 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Nutrition Tips
                </h5>
                <p className="text-gray-300 text-sm">{selectedBodyTypeData.mealPlan.tips}</p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Body Fat Calculator */}
      <div>
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Body Fat Percentage Calculator
        </h3>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calculator Input */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Measurements
            </h4>
            
            <div className="space-y-4">
              {/* Auto-filled data display */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-700/30 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Gender</label>
                  <p className="text-white capitalize">{currentGender || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Height</label>
                  <p className="text-white">{currentHeight || 'Not set'} cm</p>
                </div>
              </div>

              {/* Manual measurements */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Waist Circumference (cm) *
                </label>
                <input
                  type="number"
                  value={bodyFatMeasurements.waist}
                  onChange={(e) => setBodyFatMeasurements(prev => ({ ...prev, waist: e.target.value }))}
                  placeholder="Measure at navel level"
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.waist ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                {validationErrors.waist && (
                  <p className="text-red-400 text-sm mt-1">{validationErrors.waist}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Neck Circumference (cm) *
                </label>
                <input
                  type="number"
                  value={bodyFatMeasurements.neck}
                  onChange={(e) => setBodyFatMeasurements(prev => ({ ...prev, neck: e.target.value }))}
                  placeholder="Measure at Adam's apple level"
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    validationErrors.neck ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                {validationErrors.neck && (
                  <p className="text-red-400 text-sm mt-1">{validationErrors.neck}</p>
                )}
              </div>

              {currentGender === 'female' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hip Circumference (cm) *
                  </label>
                  <input
                    type="number"
                    value={bodyFatMeasurements.hip}
                    onChange={(e) => setBodyFatMeasurements(prev => ({ ...prev, hip: e.target.value }))}
                    placeholder="Measure at widest point"
                    className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors.hip ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                  {validationErrors.hip && (
                    <p className="text-red-400 text-sm mt-1">{validationErrors.hip}</p>
                  )}
                </div>
              )}

              {validationErrors.calculation && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-300 text-sm">{validationErrors.calculation}</p>
                </div>
              )}

              <button
                onClick={calculateBodyFat}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105"
              >
                Calculate Body Fat %
              </button>

              {/* Measurement Tips */}
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h5 className="font-medium text-blue-300 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Measurement Tips
                </h5>
                <ul className="text-sm text-blue-200 space-y-1">
                  <li>• Measure on bare skin or tight clothing</li>
                  <li>• Take measurements in the morning</li>
                  <li>• Breathe normally, don't suck in</li>
                  <li>• Use a flexible measuring tape</li>
                  <li>• Take 2-3 measurements and use the average</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="space-y-6">
            {/* Current Result */}
            {bodyFatResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-xl p-6"
              >
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-400" />
                  Your Result
                </h4>
                
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-white mb-2">
                    {bodyFatResult.bodyFatPercentage}%
                  </div>
                  <div className={`text-lg font-medium ${getClassificationColor(bodyFatResult.classification)}`}>
                    {bodyFatResult.classification}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    Recommended: {bodyFatResult.recommendedRange}
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>Essential</span>
                    <span>Athletes</span>
                    <span>Fitness</span>
                    <span>Average</span>
                    <span>Obese</span>
                  </div>
                  <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-red-500"></div>
                    <div
                      className="absolute top-0 w-1 h-full bg-white shadow-lg"
                      style={{
                        left: `${Math.min(95, Math.max(5, (bodyFatResult.bodyFatPercentage / 40) * 100))}%`,
                      }}
                    />
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-xs text-gray-400">Your Result: {bodyFatResult.bodyFatPercentage}%</span>
                  </div>
                </div>

                {/* Classification Guide */}
                <div className="grid grid-cols-2 gap-3 text-xs mb-6">
                  {[
                    { name: 'Essential Fat', range: currentGender === 'male' ? '2-5%' : '10-13%', color: 'text-red-400' },
                    { name: 'Athletes', range: currentGender === 'male' ? '6-13%' : '14-20%', color: 'text-green-400' },
                    { name: 'Fitness', range: currentGender === 'male' ? '14-17%' : '21-24%', color: 'text-blue-400' },
                    { name: 'Average', range: currentGender === 'male' ? '18-24%' : '25-31%', color: 'text-yellow-400' },
                    { name: 'Obese', range: currentGender === 'male' ? '25%+' : '32%+', color: 'text-red-400' }
                  ].map((category) => (
                    <div key={category.name} className="flex justify-between">
                      <span className={category.color}>{category.name}</span>
                      <span className="text-gray-400">{category.range}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={saveBodyFatResult}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105"
                >
                  Save Result
                </button>
              </motion.div>
            )}

            {/* Information Panel */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">About This Calculator</h4>
              <div className="space-y-3 text-sm text-gray-300">
                <p>
                  This calculator uses the U.S. Navy Body Fat Formula, which is one of the most accurate 
                  methods for estimating body fat percentage using basic measurements.
                </p>
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-300 font-medium mb-1">Important Note:</p>
                  <p className="text-yellow-200 text-xs">
                    This is an estimation tool. For the most accurate results, consider professional 
                    body composition analysis (DEXA scan, BodPod, etc.).
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  <strong>Formula Used:</strong><br/>
                  {currentGender === 'male' 
                    ? 'Male: 495 ÷ (1.0324 - 0.19077 × log₁₀(waist - neck) + 0.15456 × log₁₀(height)) - 450'
                    : 'Female: 495 ÷ (1.29579 - 0.35004 × log₁₀(waist + hip - neck) + 0.22100 × log₁₀(height)) - 450'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  );
  const renderAnalyticsContent = () => {
    if (!hasSubscription) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 rounded-xl p-8 border border-yellow-500/30 text-center"
        >
          {/* Premium Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Crown className="w-8 h-8 text-white" />
          </motion.div>

          {/* Content */}
          <h3 className="text-2xl font-bold text-white mb-3">
            Upgrade to Pro
          </h3>
          <p className="text-gray-300 mb-2">
            <span className="font-semibold text-yellow-400">Analytics</span> is a premium feature
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Get detailed insights into your workout performance, progress tracking, and advanced analytics.
          </p>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/pricing')}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300"
          >
            Upgrade to Pro
          </motion.button>

          {/* Pricing Hint */}
          <p className="text-xs text-gray-500 mt-4">
            Starting at $4/month 
          </p>
        </motion.div>
      );
    }

    return renderAnalyticsTab();
  };

  const renderSettingsTab = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Settings</h2>
      
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </h3>
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {key === 'workoutReminders' && 'Get reminded about your workout schedule'}
                    {key === 'progressUpdates' && 'Weekly progress summaries and achievements'}
                    {key === 'socialUpdates' && 'Updates from friends and community'}
                    {key === 'marketingEmails' && 'Product updates and promotional content'}
                  </p>
                </div>
                <button
                  onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Appearance
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Dark Mode</p>
              <p className="text-gray-400 text-sm">Toggle between light and dark themes</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {darkMode ? 'Dark' : 'Light'}
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy & Security
          </h3>
          <div className="space-y-4">
      <button
        className="w-full text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        onClick={() => setShowModal(true)}
      >
        <p className="text-white font-medium">Change Password</p>
        <p className="text-gray-400 text-sm">Update your account password</p>
      </button>

            {showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
    <div className="bg-black rounded-xl p-6 w-full max-w-md space-y-4 shadow-lg z-50">
      <h2 className="text-lg font-semibold text-gray-800">Change Password</h2>

      <input
        type="password"
        placeholder="Old Password"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        className="bg-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="bg-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={handleChangePassword}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}
    </div>

        </div>
      </div>
    </div>
  );

  const renderBillingTab = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white">Billing & Subscription</h2>
      
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Current Plan</h3>
            <p className="text-gray-400">Premium Monthly Subscription</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">$29.99</p>
            <p className="text-gray-400 text-sm">per month</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-gray-300">Unlimited workout plans</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-gray-300">Advanced analytics</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-gray-300">Priority support</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-gray-300">Custom meal plans</span>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Upgrade Plan
          </button>
          <button className="flex-1 px-4 py-2 border border-gray-600 hover:border-gray-500 text-gray-300 rounded-lg transition-colors">
            Cancel Subscription
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
        <div className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg">
          <CreditCard className="w-8 h-8 text-gray-400" />
          <div className="flex-1">
            <p className="text-white font-medium">•••• •••• •••• 4242</p>
            <p className="text-gray-400 text-sm">Expires 12/26</p>
          </div>
          <button className="px-4 py-2 border border-gray-600 hover:border-gray-500 text-gray-300 rounded-lg transition-colors">
            Update
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Billing History</h3>
        <div className="space-y-3">
          {[
            { date: '2024-01-01', amount: '$29.99', status: 'Paid' },
            { date: '2023-12-01', amount: '$29.99', status: 'Paid' },
            { date: '2023-11-01', amount: '$29.99', status: 'Paid' },
          ].map((invoice, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div>
                <p className="text-white font-medium">{invoice.date}</p>
                <p className="text-gray-400 text-sm">Premium Subscription</p>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">{invoice.amount}</p>
                <span className="text-green-400 text-sm">{invoice.status}</span>
              </div>
              <button className="ml-4 p-2 hover:bg-gray-600 rounded-lg transition-colors">
                <Download className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
          <p className="text-gray-400">Manage your profile, preferences, and subscription</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {tab.icon}
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'profile' && renderProfileTab()}
                {activeTab === 'analytics' && renderAnalyticsContent()}
                {activeTab === 'settings' && renderSettingsTab()}
                {activeTab === 'billing' && renderBillingTab()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.url}
                alt={`Progress ${selectedPhoto.date}`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg">
                {new Date(selectedPhoto.date).toLocaleDateString()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Account;