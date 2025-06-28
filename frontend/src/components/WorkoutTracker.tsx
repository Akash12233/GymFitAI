import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, CheckCircle, Plus, Minus, Timer, Trophy, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useUser } from '../contexts/UserContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useWorkouts } from '../hooks/useWorkouts';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';

interface WorkoutExercise {
  id: string;
  name: string;
  avgSets: number;
  avgReps: number;
  weight?: number;
  duration?: number;
  restPeriod?: number;
  instructions?: string;
  type: string;
  completed?: boolean;
  status :{
    completedByUser:  boolean;
    completePercent : number;
    totalSets: number;
    completedSets: number;
    totalReps: number;
    completedReps: number
  }
}

interface Workout {
  id: string;
  name: string;
  date: string;
  exercises: WorkoutExercise[];
  completed: boolean;
  duration?: number;
}

interface WorkoutTrackerProps {
  workout: Workout;
  onComplete: () => void;
  onError?: (error: string) => void;
}

const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({ workout, onComplete, onError }) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(() => {
    const firstUnfinishedIndex = workout.exercises.findIndex(ex => !ex.status.completedByUser);
    return firstUnfinishedIndex !== -1 ? firstUnfinishedIndex : 0;
  });
  const [currentSet, setCurrentSet] = useState(1); // Start at 1 (first set)
  const [currentSetReps, setCurrentSetReps] = useState(0); // Reps completed in current set
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [workoutStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<WorkoutExercise | null>(null);
  const [localExercises, setLocalExercises] = useState<WorkoutExercise[]>(workout.exercises);
  const [pendingUpdates, setPendingUpdates] = useState<{[key: string]: any}>({});

  const { updateWorkout, completeExercise } = useUser();
  const { addNotification } = useNotifications();
  const { updateExerciseStatus, loading } = useWorkouts();

  const currentExercise = localExercises[currentExerciseIndex];
  const completedExercises = localExercises.filter(e => e.completed).length;
  const progressPercentage = (completedExercises / localExercises.length) * 100;

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - workoutStartTime);
      
      if (isResting && restTimer > 0) {
        setRestTimer(prev => prev - 1);
      } else if (isResting && restTimer === 0) {
        setIsResting(false);
        addNotification({
          type: 'info',
          title: 'Rest Complete!',
          message: 'Time to start your next set.'
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [workoutStartTime, isResting, restTimer, addNotification]);

  // Debounced backend sync
  useEffect(() => {
    const syncTimer = setTimeout(() => {
      if (Object.keys(pendingUpdates).length > 0) {
        syncToBackend();
      }
    }, 2000); // Sync after 2 seconds of inactivity

    return () => clearTimeout(syncTimer);
  }, [pendingUpdates]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startRest = (duration: number = 60) => {
    setRestTimer(duration);
    setIsResting(true);
  };

  const syncToBackend = async () => {
    try {
      const updates = Object.entries(pendingUpdates).map(([exerciseId, data]) => ({
        _id: exerciseId,
        ...data
      }));
      
      await updateExerciseStatus(updates);
      setPendingUpdates({});
      setHasError(false);
    } catch (error) {
      setHasError(true);
      addNotification({
        type: 'error',
        title: 'Sync Error',
        message: 'Failed to sync with server. Changes saved locally.'
      });
    }
  };

  const updateExerciseLocally = (exerciseId: string, updates: Partial<WorkoutExercise>) => {
    // Update local state immediately
    setLocalExercises(prev => prev.map(ex => 
      ex.id === exerciseId ? { ...ex, ...updates } : ex
    ));

    // Queue for backend sync
    setPendingUpdates(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        ...updates
      }
    }));
  };

  const addRep = () => {
    if (currentSetReps < currentExercise.avgReps) {
      const newCurrentSetReps = currentSetReps + 1;
      setCurrentSetReps(newCurrentSetReps);
      console.log(currentSetReps)
      const newTotalCompletedReps = currentExercise.status.completedReps + 1;
      updateExerciseLocally(currentExercise.id, {
        status: {
          ...currentExercise.status,
          completedReps: newTotalCompletedReps
        }
      });
    }
  };

  const removeRep = () => {
    console.log("removerep");
    
    if (currentSetReps > 0) {
      const newCurrentSetReps = currentSetReps - 1;
      setCurrentSetReps(newCurrentSetReps);
      
      const newTotalCompletedReps = Math.max(0, currentExercise.status.completedReps - 1);
      updateExerciseLocally(currentExercise.id, {
        status: {
          ...currentExercise.status,
          completedReps: newTotalCompletedReps
        }
      });
    }
  };

  const completeSet = async () => {
    try {
      const newCompletedSets = currentExercise.status.completedSets + 1;
      
      updateExerciseLocally(currentExercise.id, {
        status: {
          ...currentExercise.status,
          completedSets: newCompletedSets,
          completePercent: (newCompletedSets / currentExercise.status.totalSets) * 100
        }
      });

      // Move to next set or next exercise
      if (currentSet < currentExercise.status.totalSets) {
        setCurrentSet(prev => prev + 1);
        setCurrentSetReps(0);
        startRest();
      } else {
        // All sets completed - auto complete exercise
        await completeCurrentExercise();
      }
    } catch (error) {
      console.error('Error completing set:', error);
      setHasError(true);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to complete set. Please try again.'
      });
    }
  };

  const completeCurrentExercise = async () => {
    try {
      // Sync any pending updates first
      await syncToBackend();
 updateExerciseLocally(currentExercise.id, {
      completed: true,
      status: {
        ...currentExercise.status,
        completedByUser: true,
        completePercent: 100
      }
    });
      // Mark exercise as completed
      const success = completeExercise(workout.id, currentExercise.id);
      
      if (!success) {
        throw new Error('Failed to complete exercise');
      }
           

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      addNotification({
        type: 'success',
        title: 'Exercise Complete!',
        message: `Great job completing ${currentExercise.name}!`
      });
      // Move to next exercise or complete workout
      if (currentExerciseIndex < localExercises.length - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSet(1);
        setCurrentSetReps(0);
        startRest();
      } else {
        // Complete workout
        const duration = Math.floor((Date.now() - workoutStartTime) / 1000 / 60);
        await updateWorkout(workout.id, { completed: true, duration });
        
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 }
        });

        addNotification({
          type: 'success',
          title: 'Workout Complete! 🎉',
          message: `Amazing job! You completed ${workout.name} in ${formatTime(Date.now() - workoutStartTime)}.`
        });

        onComplete();
      }
    } catch (error) {
      console.error('Error completing exercise:', error);
      setHasError(true);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to complete exercise. Please try again.'
      });
    }
  };

  const skipRest = () => {
    setIsResting(false);
    setRestTimer(0);
  };

  const handleTotalSetsChange = (increment: boolean) => {
    const newTotalSets = increment 
      ? currentExercise.status.totalSets + 1 
      : Math.max(1, currentExercise.status.totalSets - 1);
    
    const newTotalReps = newTotalSets * currentExercise.avgReps;
    
    updateExerciseLocally(currentExercise.id, {
      status: {
        ...currentExercise.status,
        totalSets: newTotalSets,
        totalReps: newTotalReps,
        completePercent: (currentExercise.status.completedSets / newTotalSets) * 100
      }
    });
  };



  const handleWeightChange = (increment: boolean) => {
    const currentWeight = currentExercise.weight || 0;
    const newWeight = increment ? currentWeight + 2.5 : Math.max(0, currentWeight - 2.5);
    updateExerciseLocally(currentExercise.id, { weight: newWeight });
  };

  const getCurrentSetProgress = () => {
    return `${currentSetReps}/${currentExercise.avgReps}`;
  };

  useEffect(() => {
    setHasError(false);
    setCurrentSet(1);
    setCurrentSetReps(0);
  }, [currentExerciseIndex]);

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/60 rounded-xl p-6 border border-gray-700"
      >
        {/* Workout Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">{workout.name}</h3>
            <p className="text-gray-400">Exercise {currentExerciseIndex + 1} of {localExercises.length}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-400">{formatTime(elapsedTime)}</div>
            <p className="text-sm text-gray-400">Duration</p>
            {Object.keys(pendingUpdates).length > 0 && (
              <p className="text-xs text-yellow-400">Syncing...</p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Progress</span>
            <span className="text-sm text-primary-400">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              className="h-2 bg-gradient-to-r from-primary-600 to-neon-pink rounded-full"
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Current Exercise */}
        {currentExercise && (
          <div className="bg-gray-700/50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">{currentExercise.name}</h4>
              <div className="flex items-center space-x-2">
                <div className="px-3 py-1 bg-primary-500/20 rounded-full text-sm text-primary-300">
                  {currentExercise.type}
                </div>
                <button
                  onClick={() => setSelectedExercise(currentExercise)}
                  className="p-2 hover:bg-gray-600 rounded-full"
                >
                  <Info className="w-5 h-5 text-gray-300" />
                </button>
              </div>
            </div>

            {/* Current Set Info */}
            <div className="mb-4 p-3 bg-gray-600/30 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold text-white mb-1">
                  Set {currentSet} of {currentExercise.status.totalSets}
                </div>
                <div className="text-sm text-gray-400">
                  Reps: {getCurrentSetProgress()}
                </div>
              </div>
            </div>

            {/* Rep Counter for Current Set */}
            <div className="mb-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{currentSetReps}</div>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={removeRep}
                  disabled={currentSetReps === 0}
                  className="p-3 bg-red-500/20 text-red-300 rounded-full hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-gray-400">Reps this set</span>
                <button
                  onClick={addRep}
                  disabled={currentSetReps >= currentExercise.avgReps}
                  className="p-3 bg-green-500/20 text-green-300 rounded-full hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Exercise Configuration */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-xl font-bold text-white flex items-center justify-center">
                  <button onClick={() => handleTotalSetsChange(false)} className="p-1 hover:bg-gray-600 rounded">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="mx-2">{currentExercise.status.totalSets}</span>
                  <button onClick={() => handleTotalSetsChange(true)} className="p-1 hover:bg-gray-600 rounded">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-gray-400">Total Sets ({currentExercise.status.completedSets} done)</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">
                  {currentExercise.avgReps}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white flex items-center justify-center">
                  <button onClick={() => handleWeightChange(false)} className="p-1 hover:bg-gray-600 rounded">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="mx-2">{currentExercise.weight || 0}</span>
                  <button onClick={() => handleWeightChange(true)} className="p-1 hover:bg-gray-600 rounded">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-gray-400">Weight (kg)</div>
              </div>
            </div>

            {/* Rest Timer */}
            {isResting && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 bg-orange-500/10 rounded-lg border border-orange-500/30 mb-4"
              >
                <Timer className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-orange-400 mb-2">{restTimer}s</div>
                <p className="text-orange-300 text-sm mb-4">Rest time remaining</p>
                <button
                  onClick={skipRest}
                  className="px-4 py-2 bg-orange-500/20 text-orange-300 rounded-lg hover:bg-orange-500/30 transition-colors duration-200"
                >
                  Skip Rest
                </button>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={completeSet}
                disabled={isResting || hasError || loading}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg font-semibold text-white hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                  hasError 
                    ? 'bg-gradient-to-r from-red-600 to-red-700' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-blue-500/25'
                }`}
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                <span>
                  {loading ? 'Saving...' : hasError ? 'Error - Retry' : 'Complete Set'}
                </span>
              </button>
              
              <button
                onClick={completeCurrentExercise}
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-green-500/25 hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Trophy className="w-5 h-5" />
                <span>Complete Exercise</span>
              </button>
            </div>
          </div>
        )}

        {/* Exercise Details Modal */}
        <AnimatePresence>
          {selectedExercise && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setSelectedExercise(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4"
                onClick={e => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-white mb-4">{selectedExercise.name}</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400">Type</h4>
                    <p className="text-white">{selectedExercise.type}</p>
                  </div>
                  {selectedExercise.instructions && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400">Instructions</h4>
                      <p className="text-white">{selectedExercise.instructions}</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="mt-6 w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors duration-200"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exercise List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-400 mb-3">All Exercises</h4>
          {localExercises.map((exercise, index) => (
            <div
              key={exercise.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                index === currentExerciseIndex 
                  ? 'bg-primary-500/20 border border-primary-500/30' 
                  : exercise.completed
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-gray-700/30 border border-gray-600/30'
              }`}
              onClick={() => setSelectedExercise(exercise)}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  exercise.completed 
                    ? 'bg-green-500 text-white' 
                    : index === currentExerciseIndex
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-600 text-gray-400'
                }`}>
                  {exercise.completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : index === currentExerciseIndex ? (
                    <Play className="w-3 h-3" />
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </div>
                <span className={`font-medium ${
                  exercise.completed ? 'text-green-400' : 'text-white'
                }`}>
                  {exercise.name}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                {exercise.status.completedSets}/{exercise.status.totalSets} sets × {exercise.status.completedReps}/{exercise.status.totalReps} reps
                {exercise.weight ? ` @ ${exercise.weight}kg` : ''}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </ErrorBoundary>
  );
};

export default WorkoutTracker;