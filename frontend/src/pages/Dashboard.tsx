import React, { useState, useEffect, useMemo } from 'react';
import { motion, sync } from 'framer-motion';
import { 
  Plus, 
  Play, 
  Pause, 
  CheckCircle, 
  Calendar,
  Target,
  Zap,
  Trophy,
  Clock,
  Flame,
  Activity,
    Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { getTodayString, formatDisplayDate, isPastDate } from '../utils/dateUtils';
import WorkoutPlanCreator from '../components/WorkoutPlanCreator';
import WorkoutTracker from '../components/WorkoutTracker';
import ProgressCalendar from '../components/ProgressCalendar';
import StatsCard from '../components/StatsCard';
import RefreshPlaner from '../components/RefreshPlanner';
import { PlannerReport } from '../services/plannerService';
import { usePlanner } from '../hooks/useplanner';
import ExerciseSearchModal from '../components/ExerciseSearchModal';



const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { userStats, workouts, getTodaysWorkout , refreshData} = useUser();
  const [showPlanCreator, setShowPlanCreator] = useState(false);
  const [showRefreshPlan,setShowRefreshPlan] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  
 

  // console.log("user", user);
  

  const getGreeting = useMemo(() => {
   const hour = new Date().getHours();
    const name = user?.profile?.name?.split(' ')[0] || 'there';
    
    if (hour < 12) return `Good morning, ${name}!`;
    if (hour < 17) return `Good afternoon, ${name}!`;
    return `Good evening, ${name}!`;
  }, [user]);

  const todaysWorkout = getTodaysWorkout();
  const upcomingWorkouts = workouts.filter(w => 
    !w.completed && !isPastDate(w.date) && w.date !== getTodayString()
  ).slice(0, 3);

  const completedWorkouts = workouts.filter(w => w.completed).length;
  const missedWorkouts = workouts.filter(w => !w.completed && isPastDate(w.date)).length;
  const currentStreak = (() => {
    const today = new Date().toISOString().split('T')[0];

    const sorted = workouts
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let streak = 0;
    let days = 14;
    for (const workout of sorted) {
      const workoutDate = workout.date.split('T')[0];

      // Skip future workouts
      if (new Date(workoutDate) > new Date(today)) continue;

      // Stop the streak if a workout was not completed
      if (!workout.completed || days <= 0) break;
      days--;
      streak++;
    }

    return streak;
  })();
  const totalWorkouts = userStats?.totalWorkouts || workouts.length;

  const handleWorkoutComplete = () => {
    setActiveWorkout(null);
    setError(null);
  };

  const handleWorkoutError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const quickStats = [
    {
      title: 'Current Streak',
      value: `${currentStreak} days`,
      icon: <Flame className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      change: '+4 from last week'
    },
    {
      title: 'Completed Workouts',
      value: completedWorkouts.toString(),
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      change: '+3 this week'
    },
    {
      title: 'Missed Workouts',
      value: missedWorkouts.toString(),
      icon: <Target className="w-6 h-6" />,
      color: 'from-red-500 to-pink-500',
      change: missedWorkouts > 0 ? 'Catch up needed' : 'Perfect!'
    },
    {
      title: 'Weekly Goal',
      value: `${completedWorkouts}/${Math.max(workouts.length, 1)} days`,
      icon: <Target className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      change: `${Math.round((completedWorkouts / Math.max(workouts.length, 1)) * 100)}% complete`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {getGreeting}
              </h1>
              <p className="text-gray-400 text-lg">
                Ready to crush your fitness goals today? Let's get started!
              </p>
            </div>
  {/* Exercise Search Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowExerciseSearch(true)}
              className="mt-4 md:mt-0 flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-electric-400 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300 transform hover:scale-105"
            >
              <Search className="w-5 h-5" />
              <span>Search Exercises</span>
            </motion.button>
          </div>
        </motion.div>


        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
          >
            <p className="text-red-300 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <StatsCard {...stat} />
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Workout Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Workout */}
            {todaysWorkout ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-primary-900/50 to-neon-pink/20 rounded-xl p-6 border border-primary-500/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Today's Workout</h3>
                    <p className="text-primary-300">{todaysWorkout.name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="px-3 py-1 bg-primary-500/20 rounded-full text-xs font-medium text-primary-300">
                      {todaysWorkout.exercises.length} exercises
                    </div>
                    <div className="px-3 py-1 bg-neon-pink/20 rounded-full text-xs font-medium text-neon-pink">
                      Est. {todaysWorkout.exercises.length * 8-12} min
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setActiveWorkout(activeWorkout ? null : todaysWorkout.id)}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-neon-pink rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300 transform hover:scale-105"
                  >
                    {activeWorkout ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    <span>{activeWorkout ? 'Pause Workout' : 'Start Workout'}</span>
                  </button>
                  
                  <div className="flex items-center text-gray-400 text-sm">
                    <Activity className="w-4 h-4 mr-2" />
                    <span>
                      {todaysWorkout.exercises.filter(e => e.status.completedByUser).length} / {todaysWorkout.exercises.length} completed
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : ( 
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800/60 rounded-xl p-6 border border-gray-700 text-center"
              >
                <Trophy className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Workout Scheduled</h3>
                <p className="text-gray-400 mb-4">
                  Create a personalized workout plan to get started on your fitness journey.
                </p>
                {upcomingWorkouts.length === 0 &&
                <button
                  onClick={() => setShowPlanCreator(true)}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-neon-pink rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  Create Workout Plan
                </button>}
              </motion.div>
            )}

            {/* Active Workout Tracker */}
            {activeWorkout && todaysWorkout && (
              <WorkoutTracker
                workout={todaysWorkout}
                onComplete={handleWorkoutComplete}
                onError={handleWorkoutError}
              />
            )}

            { user?.tier == 'premium' && (
              <div className="grid md:grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowRefreshPlan(true)}
                className="p-6 bg-gray-800/60 rounded-xl border border-gray-700 hover:border-primary-500/50 transition-all duration-300 text-left group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-primary-500/20 rounded-lg group-hover:bg-primary-500/30 transition-colors duration-300">
                    <Plus className="w-6 h-6 text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Refresh Exercise</h3>
                </div>
                <p className="text-gray-400 text-sm">
                  Refresh a personalized Exercise with AI assistance
                </p>
              </motion.button>

            </div>
            )
            }
            
            

            {/* Upcoming Workouts */}
            {upcomingWorkouts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-800/60 rounded-xl p-6 border border-gray-700"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Upcoming Workouts</h3>
                <div className="space-y-3">
                  {upcomingWorkouts.map((workout, index) => (
                    <div
                      key={workout.id}
                      className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-white">{workout.name}</h4>
                        <p className="text-sm text-gray-400">{formatDisplayDate(workout.date)}</p>
                      </div>
                      <div className="text-sm text-blue-400">
                        {workout.exercises.length} exercises
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Calendar & Progress */}
          <div className="space-y-6">
            <ProgressCalendar />
            
            {/* AI Insights */}
            {user?.tier == 'premium' && (
                          <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-gray-800/60 to-gray-800/40 rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-lg font-semibold text-white mb-4">AI Coach Insights</h3>
              <div className="space-y-4">
                {/* Performance Tip */}
                <div className="p-4 bg-primary-500/10 rounded-lg border-l-4 border-primary-500">
                  <p className="text-sm text-primary-300 font-medium mb-1">Performance Tip</p>
                  <p className="text-gray-300 text-sm">
                    {completedWorkouts > 0 
                      ? "Great consistency! Consider progressive overload for continued gains."
                      : "Start with bodyweight exercises to build a foundation."
                    }
                  </p>
                </div>

                {/* Recovery Status */}
                <div className="p-4 bg-green-500/10 rounded-lg border-l-4 border-green-500">
                  <p className="text-sm text-green-300 font-medium mb-1">Recovery Status</p>
                  <p className="text-gray-300 text-sm">
                    {todaysWorkout 
                      ? "Ready for today's workout! Stay hydrated and warm up properly."
                      : "Perfect time to rest and recover. Consider light stretching."
                    }
                  </p>
                </div>

                {/* Weekly Progress */}
                <div className="p-4 bg-blue-500/10 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm text-blue-300 font-medium mb-1">Weekly Progress</p>
                  <p className="text-gray-300 text-sm">
                    You've completed {completedWorkouts} out of {workouts.length} scheduled workouts.
                    {missedWorkouts > 0 && ` ${missedWorkouts} workouts were missed.`}
                  </p>
                </div>
              </div>
            </motion.div>

            )

            }
          </div>
        </div>
      </div>

      { showRefreshPlan && user?.tier == 'premium' && (
        <RefreshPlaner onClose={()=>setShowRefreshPlan(false)}/>
      )

      }

      {/* Workout Plan Creator Modal */}
      {showPlanCreator && (
        <WorkoutPlanCreator onClose={() => setShowPlanCreator(false)} />
      )}
       {/* Exercise Search Modal */}
      <ExerciseSearchModal 
        isOpen={showExerciseSearch}
        onClose={() => setShowExerciseSearch(false)}
      />
    </div>
  );
};

export default Dashboard;