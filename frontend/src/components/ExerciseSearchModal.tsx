import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Info, Dumbbell, Target, Star } from 'lucide-react';

interface Exercise {
  _id: string;
  Title: string;
  Desc: string;
  Type: string;
  BodyPart: string;
  Equipment: string;
  Level: string;
  Rating: number;
  RatingDesc: string;
}

interface ExerciseSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExerciseSearchModal: React.FC<ExerciseSearchModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Mock exercises data (since we're not connecting to backend)
  const mockExercises: Exercise[] = [
    {
      _id: '1',
      Title: 'Push-ups',
      Desc: 'A classic bodyweight exercise that targets the chest, shoulders, and triceps. Start in a plank position with hands slightly wider than shoulder-width apart.',
      Type: 'Strength',
      BodyPart: 'Chest',
      Equipment: 'Bodyweight',
      Level: 'Beginner',
      Rating: 4.5,
      RatingDesc: 'Excellent foundational exercise'
    },
    {
      _id: '2',
      Title: 'Bench Press',
      Desc: 'A compound exercise that primarily targets the chest muscles, along with the shoulders and triceps. Performed lying on a bench with a barbell.',
      Type: 'Strength',
      BodyPart: 'Chest',
      Equipment: 'Barbell',
      Level: 'Intermediate',
      Rating: 4.8,
      RatingDesc: 'King of chest exercises'
    },
    {
      _id: '3',
      Title: 'Squats',
      Desc: 'A fundamental lower body exercise that targets the quadriceps, hamstrings, and glutes. Can be performed with bodyweight or added resistance.',
      Type: 'Strength',
      BodyPart: 'Legs',
      Equipment: 'Bodyweight',
      Level: 'Beginner',
      Rating: 4.7,
      RatingDesc: 'Essential leg exercise'
    },
    {
      _id: '4',
      Title: 'Deadlift',
      Desc: 'A compound movement that works multiple muscle groups including the back, glutes, hamstrings, and core. One of the most effective full-body exercises.',
      Type: 'Strength',
      BodyPart: 'Back',
      Equipment: 'Barbell',
      Level: 'Advanced',
      Rating: 4.9,
      RatingDesc: 'Ultimate strength builder'
    },
    {
      _id: '5',
      Title: 'Pull-ups',
      Desc: 'An upper body exercise that primarily targets the latissimus dorsi, rhomboids, and biceps. Performed by hanging from a bar and pulling the body up.',
      Type: 'Strength',
      BodyPart: 'Back',
      Equipment: 'Pull-up Bar',
      Level: 'Intermediate',
      Rating: 4.6,
      RatingDesc: 'Great for back development'
    },
    {
      _id: '6',
      Title: 'Running',
      Desc: 'A cardiovascular exercise that improves heart health, endurance, and burns calories. Can be performed outdoors or on a treadmill.',
      Type: 'Cardio',
      BodyPart: 'Full Body',
      Equipment: 'None',
      Level: 'Beginner',
      Rating: 4.3,
      RatingDesc: 'Excellent cardio workout'
    },
    {
      _id: '7',
      Title: 'Plank',
      Desc: 'An isometric core exercise that strengthens the abdominals, back, and shoulders. Hold a push-up position with forearms on the ground.',
      Type: 'Strength',
      BodyPart: 'Core',
      Equipment: 'Bodyweight',
      Level: 'Beginner',
      Rating: 4.4,
      RatingDesc: 'Core stability essential'
    },
    {
      _id: '8',
      Title: 'Burpees',
      Desc: 'A full-body exercise that combines a squat, push-up, and jump. Great for cardiovascular fitness and strength training.',
      Type: 'Cardio',
      BodyPart: 'Full Body',
      Equipment: 'Bodyweight',
      Level: 'Intermediate',
      Rating: 4.2,
      RatingDesc: 'Intense full-body workout'
    }
  ];

  useEffect(() => {
    if (searchTerm.length > 0) {
      setLoading(true);
      // Simulate API call delay
      const timer = setTimeout(() => {
        const filtered = mockExercises.filter(exercise =>
          exercise.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exercise.BodyPart.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exercise.Type.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setExercises(filtered);
        setLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setExercises([]);
    }
  }, [searchTerm]);

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowDetails(true);
  };

  const handleClose = () => {
    setSearchTerm('');
    setExercises([]);
    setSelectedExercise(null);
    setShowDetails(false);
    onClose();
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'text-green-400 bg-green-400/20';
      case 'intermediate': return 'text-yellow-400 bg-yellow-400/20';
      case 'advanced': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'strength': return <Dumbbell className="w-4 h-4" />;
      case 'cardio': return <Target className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-gray-700"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Exercise Library</h2>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-700 rounded-full transition-colors duration-200"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search exercises by name, body part, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400"
                  autoFocus
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto max-h-96">
              {!showDetails ? (
                <div className="p-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400"></div>
                    </div>
                  ) : exercises.length > 0 ? (
                    <div className="space-y-3">
                      {exercises.map((exercise, index) => (
                        <motion.div
                          key={exercise._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handleExerciseClick(exercise)}
                          className="p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-all duration-200 cursor-pointer border border-gray-600 hover:border-primary-500"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="p-1 bg-primary-500/20 rounded">
                                  {getTypeIcon(exercise.Type)}
                                </div>
                                <h3 className="font-semibold text-white">{exercise.Title}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(exercise.Level)}`}>
                                  {exercise.Level}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <span>• {exercise.BodyPart}</span>
                                <span>• {exercise.Equipment}</span>
                                <div className="flex items-center space-x-1">
                                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                  <span>{exercise.Rating}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-primary-400">
                              <Info className="w-5 h-5" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : searchTerm.length > 0 ? (
                    <div className="text-center py-8">
                      <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-400 mb-2">No exercises found</h3>
                      <p className="text-gray-500">Try searching with different keywords</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-400 mb-2">Search for exercises</h3>
                      <p className="text-gray-500">Start typing to find exercises by name, body part, or type</p>
                    </div>
                  )}
                </div>
              ) : (
                selectedExercise && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-6"
                  >
                    {/* Back Button */}
                    <button
                      onClick={() => setShowDetails(false)}
                      className="flex items-center space-x-2 text-primary-400 hover:text-primary-300 mb-4 transition-colors duration-200"
                    >
                      <span>← Back to search</span>
                    </button>

                    {/* Exercise Details */}
                    <div className="space-y-6">
                      {/* Header */}
                      <div>
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-primary-500/20 rounded-lg">
                            {getTypeIcon(selectedExercise.Type)}
                          </div>
                          <h3 className="text-2xl font-bold text-white">{selectedExercise.Title}</h3>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(selectedExercise.Level)}`}>
                            {selectedExercise.Level}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-white font-medium">{selectedExercise.Rating}</span>
                            <span className="text-gray-400">({selectedExercise.RatingDesc})</span>
                          </div>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-700/50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-400 mb-1">Body Part</h4>
                          <p className="text-white font-semibold">{selectedExercise.BodyPart}</p>
                        </div>
                        <div className="bg-gray-700/50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-400 mb-1">Equipment</h4>
                          <p className="text-white font-semibold">{selectedExercise.Equipment}</p>
                        </div>
                        <div className="bg-gray-700/50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-400 mb-1">Type</h4>
                          <p className="text-white font-semibold">{selectedExercise.Type}</p>
                        </div>
                        <div className="bg-gray-700/50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-400 mb-1">Difficulty</h4>
                          <p className="text-white font-semibold">{selectedExercise.Level}</p>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-white mb-3">Description</h4>
                        <p className="text-gray-300 leading-relaxed">{selectedExercise.Desc}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExerciseSearchModal;