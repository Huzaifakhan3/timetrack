import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface Timer {
  id: number;
  name: string;
  elapsed: number;
  running: boolean;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#84cc16'];

export default function App() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Animation values
  const fadeAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0.8);

  useEffect(() => {
    loadTimers();
    // Entrance animation
    fadeAnim.value = withTiming(1, { duration: 800 });
    scaleAnim.value = withSpring(1, { damping: 15, stiffness: 150 });
  }, []);

  useEffect(() => {
    saveTimers();
  }, [timers]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) =>
        prev.map((t) =>
          t.running ? { ...t, elapsed: t.elapsed + 1 } : t
        )
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadTimers = async () => {
    try {
      const saved = await AsyncStorage.getItem('timers');
      if (saved) {
        setTimers(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading timers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTimers = async () => {
    try {
      await AsyncStorage.setItem('timers', JSON.stringify(timers));
    } catch (error) {
      console.error('Error saving timers:', error);
    }
  };

  const addTimer = () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Please enter a timer name');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimers([
      ...timers,
      { id: Date.now(), name: newName.trim(), elapsed: 0, running: false },
    ]);
    setNewName('');
  };

  const toggleTimer = (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimers(
      timers.map((t) =>
        t.id === id ? { ...t, running: !t.running } : t
      )
    );
  };

  const resetTimer = (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimers(
      timers.map((t) =>
        t.id === id ? { ...t, elapsed: 0, running: false } : t
      )
    );
  };

  const deleteTimer = (id: number) => {
    Alert.alert(
      'Delete Timer',
      'Are you sure you want to delete this timer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setTimers(timers.filter((t) => t.id !== id));
          },
        },
      ]
    );
  };

  const resetAll = () => {
    Alert.alert(
      'Clear All Timers',
      'Are you sure you want to clear all timers?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setTimers([]);
          },
        },
      ]
    );
  };

  const formatTime = (secs: number): string => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
  };

  const total = timers.reduce((acc, timer) => acc + timer.elapsed, 0);
  const activeTimers = timers.filter(t => t.running).length;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ scale: scaleAnim.value }],
    };
  });

  const PulsingDot = ({ running }: { running: boolean }) => {
    const pulseAnim = useSharedValue(1);
    
    useEffect(() => {
      if (running) {
        pulseAnim.value = withRepeat(
          withTiming(1.5, { duration: 1000 }),
          -1,
          true
        );
      } else {
        pulseAnim.value = withTiming(1, { duration: 300 });
      }
    }, [running]);

    const pulseStyle = useAnimatedStyle(() => {
      const backgroundColor = interpolateColor(
        pulseAnim.value,
        [1, 1.5],
        running ? ['#10b981', '#34d399'] : ['#6b7280', '#6b7280']
      );
      
      return {
        transform: [{ scale: pulseAnim.value }],
        backgroundColor,
      };
    });

    return <Animated.View style={[styles.statusDot, pulseStyle]} />;
  };

  const TimerCard = ({ timer, index }: { timer: Timer; index: number }) => {
    const cardScale = useSharedValue(1);

    const handlePressIn = () => {
      cardScale.value = withSpring(0.98);
    };

    const handlePressOut = () => {
      cardScale.value = withSpring(1);
    };

    const cardStyle = useAnimatedStyle(() => ({
      transform: [{ scale: cardScale.value }],
    }));

    return (
      <Animated.View style={[styles.timerCard, cardStyle]}>
        <LinearGradient
          colors={timer.running ? ['#f0fdf4', '#ffffff'] : ['#ffffff', '#f8fafc']}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.timerInfo}>
              <PulsingDot running={timer.running} />
              <Text style={styles.timerName} numberOfLines={1}>
                {timer.name}
              </Text>
            </View>
            <Text style={styles.timerTime}>{formatTime(timer.elapsed)}</Text>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.primaryButton,
                { backgroundColor: timer.running ? '#f97316' : '#10b981' }
              ]}
              onPress={() => toggleTimer(timer.id)}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <Ionicons
                name={timer.running ? 'pause' : 'play'}
                size={16}
                color="white"
              />
              <Text style={styles.buttonText}>
                {timer.running ? 'Pause' : 'Start'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => resetTimer(timer.id)}
            >
              <Ionicons name="refresh" size={16} color="#6b7280" />
              <Text style={styles.secondaryButtonText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.dangerButton]}
              onPress={() => deleteTimer(timer.id)}
            >
              <Ionicons name="trash" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const StatsCard = ({ title, value, icon, color }: {
    title: string;
    value: string | number;
    icon: string;
    color: string;
  }) => (
    <View style={styles.statsCard}>
      <LinearGradient colors={[color, `${color}dd`]} style={styles.statsGradient}>
        <View style={styles.statsContent}>
          <View style={styles.statsText}>
            <Text style={styles.statsTitle}>{title}</Text>
            <Text style={styles.statsValue}>{value}</Text>
          </View>
          <Ionicons name={icon as any} size={24} color="rgba(255,255,255,0.8)" />
        </View>
      </LinearGradient>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#f1f5f9', '#e2e8f0']} style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <LinearGradient colors={['#f1f5f9', '#e2e8f0', '#cbd5e1']} style={styles.background}>
        <Animated.View style={[styles.content, animatedStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="timer" size={24} color="white" />
            </View>
            <Text style={styles.title}>Time Tracker Pro</Text>
            <Text style={styles.subtitle}>Track your time with precision</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <StatsCard
              title="Total Timers"
              value={timers.length}
              icon="albums"
              color="#3b82f6"
            />
            <StatsCard
              title="Active"
              value={activeTimers}
              icon="play-circle"
              color="#10b981"
            />
            <StatsCard
              title="Total Time"
              value={formatTime(total)}
              icon="time"
              color="#8b5cf6"
            />
          </View>

          {/* Add Timer */}
          <View style={styles.addTimerContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter timer name (e.g., 'Work Project')"
                placeholderTextColor="#9ca3af"
                value={newName}
                onChangeText={setNewName}
                onSubmitEditing={addTimer}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.addButton, !newName.trim() && styles.addButtonDisabled]}
                onPress={addTimer}
                disabled={!newName.trim()}
              >
                <LinearGradient
                  colors={newName.trim() ? ['#6366f1', '#8b5cf6'] : ['#d1d5db', '#9ca3af']}
                  style={styles.addButtonGradient}
                >
                  <Ionicons name="add" size={20} color="white" />
                  <Text style={styles.addButtonText}>Add</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {timers.length > 0 && (
              <TouchableOpacity style={styles.clearAllButton} onPress={resetAll}>
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Timers List */}
          <ScrollView
            style={styles.timersList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.timersContent}
          >
            {timers.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="timer" size={48} color="#6366f1" />
                </View>
                <Text style={styles.emptyTitle}>Ready to Track Time?</Text>
                <Text style={styles.emptySubtitle}>
                  Create your first timer to start tracking your activities and boost your productivity.
                </Text>
              </View>
            ) : (
              timers.map((timer, index) => (
                <TimerCard key={timer.id} timer={timer} index={index} />
              ))
            )}
          </ScrollView>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: 16,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    flex: 1,
  },
  statsTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  addTimerContainer: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: 'rgba(203,213,225,0.5)',
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  clearAllButton: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  clearAllText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
  },
  timersList: {
    flex: 1,
  },
  timersContent: {
    paddingBottom: 20,
  },
  timerCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  timerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  timerTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    fontFamily: 'monospace',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  primaryButton: {
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dangerButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(99,102,241,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});