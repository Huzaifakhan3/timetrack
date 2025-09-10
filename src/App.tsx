import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Play, Pause, RotateCcw, Trash2, Timer, TrendingUp, Clock } from "lucide-react";

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", 
  "#10b981", "#06b6d4", "#ef4444", "#84cc16"
];

interface TimerType {
  id: number;
  name: string;
  elapsed: number;
  running: boolean;
  startTime: number;
  pausedTime: number;
}

export default function App() {
  const [timers, setTimers] = useState<TimerType[]>(() => {
    const saved = localStorage.getItem("timers");
    return saved ? JSON.parse(saved) : [];
  });
  const [newName, setNewName] = useState("");

  useEffect(() => {
    localStorage.setItem("timers", JSON.stringify(timers));
  }, []);

  // High-precision timer updates using requestAnimationFrame
  useEffect(() => {
    let animationId: number;
    
    const updateDisplay = () => {
      setTimers(prevTimers => 
        prevTimers.map(timer => {
          if (!timer.running) return timer;
          
          const now = Date.now();
          const currentElapsed = Math.floor((now - timer.startTime) / 1000) + timer.pausedTime;
          
          return {
            ...timer,
            elapsed: currentElapsed
          };
        })
      );
      
      animationId = requestAnimationFrame(updateDisplay);
    };
    
    animationId = requestAnimationFrame(updateDisplay);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  const addTimer = () => {
    if (!newName.trim()) return;
    const now = Date.now();
    setTimers([
      ...timers,
      { 
        id: Date.now(), 
        name: newName, 
        elapsed: 0, 
        running: false,
        startTime: now,
        pausedTime: 0,
      },
    ]);
    setNewName("");
  };

  const toggleTimer = (id: number) => {
    const now = Date.now();
    setTimers(
      timers.map(timer => {
        if (timer.id !== id) return timer;
        
        if (timer.running) {
          // Pausing: save current elapsed time
          const currentElapsed = Math.floor((now - timer.startTime) / 1000) + timer.pausedTime;
          return {
            ...timer,
            running: false,
            elapsed: currentElapsed,
            pausedTime: currentElapsed,
            startTime: now, // Reset for next start
          };
        } else {
          // Starting: set new start time, keep paused time
          return {
            ...timer,
            running: true,
            startTime: now,
            // pausedTime stays the same
          };
        }
      })
    );
  };

  const resetTimer = (id: number) => {
    const now = Date.now();
    setTimers(
      timers.map((t) =>
        t.id === id ? { 
          ...t, 
          elapsed: 0, 
          running: false,
          startTime: now,
          pausedTime: 0,
        } : t
      )
    );
  };

  const deleteTimer = (id: number) => {
    setTimers(timers.filter((t) => t.id !== id));
  };

  const resetAll = () => {
    setTimers([]);
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  };

  const data = timers.map((t) => ({ name: t.name, value: t.elapsed }));
  
  // Calculate longest session time
  const total = timers.length > 0 ? Math.max(...timers.map(t => t.elapsed)) : 0;
  const activeTimers = timers.filter(t => t.running).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                <Timer className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Time Tracker Pro
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
              Track your time with precision and style
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Timers</p>
                  <p className="text-2xl font-bold">{timers.length}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Active Timers</p>
                  <p className="text-2xl font-bold">{activeTimers}</p>
                </div>
                <Play className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Longest Session</p>
                  <p className="text-2xl font-bold">{formatTime(total)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Add Timer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    type="text"
                    className="h-12 text-base bg-white/80 dark:bg-slate-900/80 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter timer name (e.g., 'Work Project', 'Exercise')"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTimer()}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={addTimer} 
                    className="h-12 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={!newName.trim()}
                  >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Add Timer
                  </Button>
                  {timers.length > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={resetAll}
                      className="h-12 px-4 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Timers List */}
          <div className="xl:col-span-2">
            <AnimatePresence>
              {timers.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-16"
                >
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                    <Timer className="w-12 h-12 text-indigo-500" />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Ready to Track Time?
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Create your first timer to start tracking your activities and boost your productivity.
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {timers.map((timer, index) => (
                    <motion.div
                      key={timer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      layout
                    >
                      <Card className={`group hover:shadow-xl transition-all duration-300 border-0 ${
                        timer.running 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-lg shadow-green-100 dark:shadow-green-900/20' 
                          : 'bg-white/70 dark:bg-slate-800/70 hover:bg-white/90 dark:hover:bg-slate-800/90'
                      } backdrop-blur-sm`}>
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`w-3 h-3 rounded-full ${
                                  timer.running ? 'bg-green-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'
                                }`} />
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 truncate">
                                  {timer.name}
                                </h3>
                              </div>
                              <div className="text-3xl font-mono font-bold text-slate-700 dark:text-slate-300">
                                {formatTime(timer.elapsed)}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              <Button
                                onClick={() => toggleTimer(timer.id)}
                                className={`${
                                  timer.running
                                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                    : 'bg-green-500 hover:bg-green-600 text-white'
                                } border-0 shadow-md hover:shadow-lg transition-all duration-200`}
                              >
                                {timer.running ? (
                                  <>
                                    <Pause className="w-4 h-4 mr-2" />
                                    Pause
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4 mr-2" />
                                    Start
                                  </>
                                )}
                              </Button>
                              
                              <Button
                                variant="outline"
                                onClick={() => resetTimer(timer.id)}
                                className="border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset
                              </Button>
                              
                              <Button
                                variant="outline"
                                onClick={() => deleteTimer(timer.id)}
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Analytics Panel */}
          <div className="xl:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 sticky top-24">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                    Time Distribution
                  </CardTitle>
                  {total > 0 && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Total tracked: <span className="font-semibold">{formatTime(total)}</span>
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  {total > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            innerRadius={40}
                            paddingAngle={2}
                            label={({ name, percent }) => 
                              percent > 5 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                            }
                            labelLine={false}
                          >
                            {data.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                className="hover:opacity-80 transition-opacity cursor-pointer"
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number, name: string) => [
                              `${name}: ${formatTime(value)}`, 
                              'Duration'
                            ]}
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: 'none',
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Legend 
                            wrapperStyle={{ fontSize: '12px' }}
                            iconType="circle"
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Start tracking to see your time distribution
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}