import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { useUser } from '../contexts/UserContext';
import { formatDate, getTodayString, isPastDate, isFutureDate, formatDateForCalender } from '../utils/dateUtils';
import {  isCurrentDays } from '../utils/isCurrentDay';

const ProgressCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { workouts, getWorkoutsByDate } = useUser();

  // console.log(workouts);
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getWorkoutStatus = (date: Date) => {
    const dateStr = formatDateForCalender(date);
    // console.log("dateStr",dateStr);
    
    const dayWorkouts = getWorkoutsByDate(dateStr);
    // console.log("dayWorkouts ",dayWorkouts);
    //   console.log("date in getWorkoutsByDate",dateStr);
      // console.log("w.date",w.date, "Id: ", i);
    
    // No workouts scheduled for this date
    if (dayWorkouts.length === 0) {
      return 'none';
    }
    
    // Check completion status
    const completedWorkouts = dayWorkouts.filter(w => w.completed);
    const totalWorkouts = dayWorkouts.length;
    
    if (completedWorkouts.length === totalWorkouts) {
      return 'completed';
    }
    
    if (completedWorkouts.length > 0) {
      return 'partial';
    }
    
    // For past dates with incomplete workouts
    if (isPastDate(dateStr)) {
      return 'missed';
    }
    
    // For today with incomplete workouts
    if (dateStr === getTodayString()) {
      return 'scheduled';
    }
    
    // For future dates with scheduled workouts
    return 'scheduled';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'partial': return 'bg-yellow-500';
      case 'missed': return 'bg-red-500';
      case 'scheduled': return 'bg-blue-500';
      default: return 'bg-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'partial': return 'Partially Complete';
      case 'missed': return 'Missed';
      case 'scheduled': return 'Scheduled';
      default: return 'No Workout';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gray-800/60 rounded-xl p-6 border border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-5 h-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Progress Calendar</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </button>
          <h4 className="text-sm font-medium text-white min-w-[120px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </h4>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day,i) => (
          <div key={i} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        
        {daysInMonth.map((date) => {
          // console.log("date daysInMonth ",date);
          
          const status = getWorkoutStatus(date);
          const statusColor = getStatusColor(status);
          const isCurrentDay = isCurrentDays(date, 'Asia/Kolkata');
          // console.log("status",status);
          // console.log("statusColor",statusColor);
          // console.log("isCurrentDay",isCurrentDay);
          
          const dateStr = formatDate(date);
          const dayWorkouts = getWorkoutsByDate(dateStr);
          // console.log(`${format(date, 'MMM dd')} - ${getStatusText(status)}${dayWorkouts.length > 0 ? ` (${dayWorkouts.length} workout${dayWorkouts.length > 1 ? 's' : ''})` : ''}`)
          return (
            <motion.div
              key={date.toISOString()}
              whileHover={{ scale: 1.1 }}
              className={`
                relative aspect-square flex items-center justify-center text-xs font-medium rounded-lg cursor-pointer transition-all duration-200
                ${isCurrentDay ? 'ring-2 ring-primary-400 ring-offset-1 ring-offset-gray-800' : ''}
                ${statusColor}
                ${status === 'none' ? 'text-gray-400 hover:bg-gray-600' : 'text-white hover:opacity-80'}
              `}
              
              title={`${format(date, 'MMM dd')} - ${getStatusText(status)}${dayWorkouts.length > 0 ? ` (${dayWorkouts.length} workout${dayWorkouts.length > 1 ? 's' : ''})` : ''}`}
            >
              {format(date, 'd')}
              {isCurrentDay && (
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -bottom-0.5 w-1.5 h-1.5 bg-primary-400 rounded-full" 
                />
              )}
              {dayWorkouts.length > 1 && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-white/80 rounded-full text-xs flex items-center justify-center">
                  <span className="text-gray-800 font-bold" style={{ fontSize: '8px' }}>
                    {dayWorkouts.length}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-gray-400">Completed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          <span className="text-gray-400">Partial</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-gray-400">Missed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <span className="text-gray-400">Scheduled</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-700 rounded-full" />
          <span className="text-gray-400">No Workout</span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-400">
              {workouts.filter(w => w.completed).length}
            </div>
            <div className="text-xs text-gray-400">Completed</div>
          </div>
          <div>
            <div className="text-lg font-bold text-primary-400">
              {Math.round((workouts.filter(w => w.completed).length / Math.max(workouts.length, 1)) * 100)}%
            </div>
            <div className="text-xs text-gray-400">Success Rate</div>
          </div>
          <div>
            <div className="text-lg font-bold text-orange-400">
              {workouts.filter(w => !w.completed && !isPastDate(w.date)).length}
            </div>
            <div className="text-xs text-gray-400">Upcoming</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressCalendar;


