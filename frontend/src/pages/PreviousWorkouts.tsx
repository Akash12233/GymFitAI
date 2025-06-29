import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Filter, 
  Search, 
  TrendingUp, 
  Download,
  Clock,
  CheckCircle,
  BarChart3,
  Target
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';
import SubscriptionGate from '../components/SubscriptionGate';

const PreviousWorkouts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const { workouts, calorieData } = useUser();
  const {user} = useAuth();

  const strengthInfo = user?.strengthInfo;
    const hasSubscription = user?.tier === 'premium';
  console.log(calorieData);
  // Mock data for charts
  const strengthBarData = [
  { name: 'Pushups', value: strengthInfo?.maxPushups },
  { name: 'Pullups', value: strengthInfo?.maxPullups },
  { name: 'Squats', value: strengthInfo?.maxSquats },
  { name: 'Bench Press (kg)', value: strengthInfo?.maxBenchKg },
  { name: 'Squat (kg)', value: strengthInfo?.maxSquatkg },
  { name: 'Deadlift (kg)', value: strengthInfo?.maxDeadliftkg },
];



  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || workout.exercises.some(e => e.type === filterType);
    return matchesSearch && matchesType;
  });

  const completedWorkouts = workouts.filter(w => w.completed);
  const totalVolume = completedWorkouts.reduce((sum, workout) => {
    return sum + workout.exercises.reduce((exerciseSum, exercise) => {
      return exerciseSum + (exercise.avgSets * exercise.avgReps * (exercise.weight || 0));
    }, 0);
  }, 0);

  const averageDuration = completedWorkouts.length > 0 
    ? Math.round(completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0) / completedWorkouts.length)
    : 0;

  const exportData = () => {
    const csvContent = [
      ['Date', 'Workout', 'Duration', 'Exercises', 'Status'],
      ...workouts.map(w => [
        w.date,
        w.name,
        w.duration || 0,
        w.exercises.length,
        w.completed ? 'Completed' : 'Incomplete'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workout-history.csv';
    a.click();
  };
const WorkoutContent = () => (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Workout History
              </h1>
              <p className="text-gray-400 text-lg">
                Track your progress and analyze your fitness journey
              </p>
            </div>
            <button
              onClick={exportData}
              className="mt-4 md:mt-0 flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 transition-colors duration-200"
            >
              <Download className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">Export Data</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/60 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{completedWorkouts.length}</div>
                <div className="text-sm text-gray-400">Completed Workouts</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/60 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{averageDuration}m</div>
                <div className="text-sm text-gray-400">Avg Duration</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/60 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{totalVolume.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Total Volume (kg)</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/60 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Target className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {Math.round((completedWorkouts.length / Math.max(workouts.length, 1)) * 100)}%
                </div>
                <div className="text-sm text-gray-400">Success Rate</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Strength Progress Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800/60 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="w-6 h-6 text-primary-400" />
              <h3 className="text-xl font-bold text-white">Strength Progression</h3>
            </div>
            <div className="h-64 bg-gray-800 p-4 rounded-xl border border-gray-700">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={strengthBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Volume Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-800/60 rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center space-x-2 mb-6">
              <BarChart3 className="w-6 h-6 text-orange-400" />
              <h3 className="text-xl font-bold text-white">Calories Burned</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={calorieData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value.toFixed(2)} cal`, 'Calories']}
                  />
                  <Bar dataKey="totalCaloriesBurnt" fill="#F97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-800/60 rounded-xl p-6 border border-gray-700 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search workouts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
              >
                <option value="all">All Types</option>
                <option value="strength">Strength</option>
                <option value="cardio">Cardio</option>
                <option value="flexibility">Flexibility</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
              >
                <option value="all">All Time</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Workout List */}
        <div className="space-y-4">
          {filteredWorkouts.map((workout, index) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="bg-gray-800/60 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    workout.completed ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <h3 className="text-lg font-semibold text-white">{workout.name}</h3>
                    <p className="text-sm text-gray-400">{workout.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>{workout.exercises.length} exercises</span>
                  {workout.duration && <span>{workout.duration} min</span>}
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    workout.completed 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {workout.completed ? 'Completed' : 'Incomplete'}
                  </span>
                </div>
              </div>

              {/* Exercise List */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {workout.exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="p-3 bg-gray-700/30 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-white text-sm">{exercise.name}</span>
                      {exercise.completed && (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {exercise.avgSets} × {exercise.avgReps} {exercise.weight ? `@ ${exercise.weight}kg` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredWorkouts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No workouts found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </motion.div>
        )}
      </div>
    </div>
  );
    return (
    <SubscriptionGate
      hasSubscription={hasSubscription}
      featureName="Workout Analytics"
      description="Get detailed insights into your workout history, progress tracking, and performance analytics."
    >
      <WorkoutContent />
    </SubscriptionGate>
  );
};

export default PreviousWorkouts;