import React, { useState, useEffect } from 'react';
import { Target, BookOpen, Clock, TrendingUp, Award, Calendar, Plus, CheckCircle, BarChart3, PieChart, Activity } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Goal, Lesson, UserProgress } from '../types';

export function Dashboard() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [recentLessons, setRecentLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<UserProgress>({
    total_lessons: 15,
    completed_lessons: 11,
    total_goals: 6,
    completed_goals: 3,
    streak_days: 12,
    last_activity: new Date().toISOString()
  });
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    // Enhanced sample data with more realistic progress tracking
    setGoals([
      {
        id: '1',
        user_id: user.id,
        title: 'Complete JavaScript Fundamentals',
        description: 'Master the basics of JavaScript programming including variables, functions, and DOM manipulation',
        target_date: '2025-02-15',
        completed: false,
        progress: 78,
        created_at: '2025-01-01'
      },
      {
        id: '2',
        user_id: user.id,
        title: 'Learn React Hooks',
        description: 'Understanding useState, useEffect, useContext, and custom hooks',
        target_date: '2025-02-01',
        completed: true,
        progress: 100,
        created_at: '2025-01-01'
      },
      {
        id: '3',
        user_id: user.id,
        title: 'Database Design Principles',
        description: 'Learn SQL, normalization, and database optimization techniques',
        target_date: '2025-03-01',
        completed: false,
        progress: 45,
        created_at: '2025-01-05'
      },
      {
        id: '4',
        user_id: user.id,
        title: 'API Development with Node.js',
        description: 'Build RESTful APIs using Express.js and integrate with databases',
        target_date: '2025-02-28',
        completed: false,
        progress: 23,
        created_at: '2025-01-08'
      }
    ]);

    setRecentLessons([
      {
        id: '1',
        user_id: user.id,
        title: 'Introduction to Variables',
        description: 'Learn about different types of variables in programming',
        content: '',
        completed: true,
        completion_date: '2025-01-10',
        duration_minutes: 15,
        created_at: '2025-01-10'
      },
      {
        id: '2',
        user_id: user.id,
        title: 'Functions and Methods',
        description: 'Understanding how to create and use functions',
        content: '',
        completed: true,
        completion_date: '2025-01-12',
        duration_minutes: 22,
        created_at: '2025-01-12'
      },
      {
        id: '3',
        user_id: user.id,
        title: 'Array Methods in JavaScript',
        description: 'Master map, filter, reduce, and other array methods',
        content: '',
        completed: true,
        completion_date: '2025-01-14',
        duration_minutes: 28,
        created_at: '2025-01-14'
      },
      {
        id: '4',
        user_id: user.id,
        title: 'Async/Await Patterns',
        description: 'Handle asynchronous operations in modern JavaScript',
        content: '',
        completed: false,
        completion_date: undefined,
        duration_minutes: 35,
        created_at: '2025-01-15'
      }
    ]);
  };

  const addGoal = async () => {
    if (!newGoalTitle.trim()) return;

    const newGoal: Goal = {
      id: Date.now().toString(),
      user_id: user!.id,
      title: newGoalTitle,
      description: newGoalDescription,
      target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completed: false,
      progress: 0,
      created_at: new Date().toISOString()
    };

    setGoals(prev => [...prev, newGoal]);
    setNewGoalTitle('');
    setNewGoalDescription('');
    setShowNewGoal(false);

    // Update progress stats
    setProgress(prev => ({
      ...prev,
      total_goals: prev.total_goals + 1
    }));
  };

  const toggleGoalComplete = (goalId: string) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const newCompleted = !goal.completed;
        const newProgress = newCompleted ? 100 : Math.max(0, goal.progress - 10);
        
        // Update overall progress stats
        setProgress(prevProgress => ({
          ...prevProgress,
          completed_goals: newCompleted 
            ? prevProgress.completed_goals + 1 
            : Math.max(0, prevProgress.completed_goals - 1)
        }));
        
        return { ...goal, completed: newCompleted, progress: newProgress };
      }
      return goal;
    }));
  };

  const updateGoalProgress = (goalId: string, newProgress: number) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, progress: Math.min(100, Math.max(0, newProgress)) }
        : goal
    ));
  };

  const completionRate = Math.round((progress.completed_lessons / progress.total_lessons) * 100);
  const goalCompletionRate = Math.round((progress.completed_goals / progress.total_goals) * 100);
  const weeklyProgress = [65, 72, 68, 85, 78, 92, 88]; // Sample weekly progress data

  const getStreakColor = (days: number) => {
    if (days >= 30) return 'text-purple-600 dark:text-purple-400';
    if (days >= 14) return 'text-emerald-600 dark:text-emerald-400';
    if (days >= 7) return 'text-blue-600 dark:text-blue-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-emerald-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.user_metadata?.name || 'Scholar'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Here's your learning progress and upcoming goals. Keep up the great work!
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{completionRate}%</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">+5% from last week</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Current Streak</p>
                <p className={`text-2xl font-bold ${getStreakColor(progress.streak_days)}`}>
                  {progress.streak_days} days
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Personal best!</p>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Lessons Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {progress.completed_lessons}/{progress.total_lessons}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">3 this week</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Goals Achieved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {progress.completed_goals}/{progress.total_goals}
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">{goalCompletionRate}% complete</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Award className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Visualization */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-2" />
                Weekly Progress
              </h2>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <div className="flex items-end space-x-2 h-32">
              {weeklyProgress.map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-purple-600 to-blue-500 rounded-t-lg transition-all duration-500 hover:from-purple-700 hover:to-blue-600"
                    style={{ height: `${value}%` }}
                  ></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Enhanced Goals Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Goals</h2>
                </div>
                <button
                  onClick={() => setShowNewGoal(!showNewGoal)}
                  className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {showNewGoal && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <input
                    type="text"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    placeholder="Enter your new goal title..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-3"
                  />
                  <textarea
                    value={newGoalDescription}
                    onChange={(e) => setNewGoalDescription(e.target.value)}
                    placeholder="Add a description (optional)..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-3 h-20 resize-none"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={addGoal}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Add Goal
                    </button>
                    <button
                      onClick={() => setShowNewGoal(false)}
                      className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {goals.map((goal) => (
                  <div key={goal.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900 dark:text-white">{goal.title}</h3>
                      <button
                        onClick={() => toggleGoalComplete(goal.id)}
                        className={`p-1 rounded transition-colors ${
                          goal.completed
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-gray-400 hover:text-emerald-600'
                        }`}
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    </div>
                    {goal.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{goal.description}</p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-3">
                      <span>Progress: {goal.progress}%</span>
                      <span>Due: {new Date(goal.target_date).toLocaleDateString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(goal.progress)}`}
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateGoalProgress(goal.id, goal.progress + 10)}
                        className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                      >
                        +10%
                      </button>
                      <button
                        onClick={() => updateGoalProgress(goal.id, goal.progress - 10)}
                        className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        -10%
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Recent Lessons */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Lessons</h2>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recentLessons.map((lesson) => (
                  <div key={lesson.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">{lesson.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <Clock className="h-4 w-4" />
                        <span>{lesson.duration_minutes}min</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{lesson.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {lesson.completed 
                          ? `Completed: ${lesson.completion_date ? new Date(lesson.completion_date).toLocaleDateString() : 'Recently'}`
                          : 'In Progress'
                        }
                      </span>
                      <div className="flex items-center space-x-2">
                        {lesson.completed && (
                          <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        )}
                        {!lesson.completed && (
                          <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}