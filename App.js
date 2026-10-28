
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@study_planner_tasks';

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved tasks when the app starts.
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const savedTasks = await AsyncStorage.getItem(STORAGE_KEY);

        if (savedTasks !== null) {
          const parsedTasks = JSON.parse(savedTasks);
          if (Array.isArray(parsedTasks)) {
            setTasks(parsedTasks);
          }
        }
      } catch (error) {
        console.error('Could not load tasks:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadTasks();
  }, []);

  // Save tasks whenever the task list changes.
  useEffect(() => {
    if (!isLoaded) return;

    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(tasks)
        );
      } catch (error) {
        console.error('Could not save tasks:', error);
      }
    };

    saveTasks();
  }, [tasks, isLoaded]);

  const addTask = () => {
    const title = task.trim();

    if (!title) return;

    const newTask = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks(previous => [newTask, ...previous]);
    setTask('');
    Keyboard.dismiss();
  };

  const toggleTask = id => {
    setTasks(previous =>
      previous.map(item =>
        item.id === id
          ? { ...item, completed: !item.completed }
          : item
      )
    );
  };

  const deleteTask = id => {
    setTasks(previous =>
      previous.filter(item => item.id !== id)
    );
  };

  const clearCompleted = () => {
    setTasks(previous =>
      previous.filter(item => !item.completed)
    );
  };

  const completedCount = tasks.filter(
    item => item.completed
  ).length;

  const pendingCount = tasks.length - completedCount;

  const progress = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  const filteredTasks = tasks.filter(item => {
    if (filter === 'Pending') return !item.completed;
    if (filter === 'Completed') return item.completed;
    return true;
  });

  const renderTask = ({ item }) => (
    <View style={styles.taskCard}>
      <TouchableOpacity
        style={[
          styles.check,
          item.completed && styles.checked,
        ]}
        onPress={() => toggleTask(item.id)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.completed }}
        accessibilityLabel={`Mark ${item.title} ${
          item.completed ? 'pending' : 'completed'
        }`}
      >
        <Text style={styles.checkText}>
          {item.completed ? '✓' : ''}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.taskDetails}
        onPress={() => toggleTask(item.id)}
        accessibilityRole="button"
      >
        <Text
          style={[
            styles.taskTitle,
            item.completed && styles.done,
          ]}
        >
          {item.title}
        </Text>
        <Text style={styles.taskStatus}>
          {item.completed ? 'Completed' : 'Tap to complete'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteTask(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${item.title}`}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4657D9" />
        <Text style={styles.loadingText}>
          Loading your tasks...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F4F6FC"
      />

      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        renderItem={renderTask}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Text style={styles.eyebrow}>
              MY PRODUCTIVITY SPACE
            </Text>

            <Text style={styles.heading}>
              Study Planner
            </Text>

            <Text style={styles.subtitle}>
              Organize your day. Achieve your goals.
            </Text>

            <View style={styles.progressCard}>
              <Text style={styles.progressLabel}>
                YOUR DAILY PROGRESS
              </Text>

              <View style={styles.progressRow}>
                <Text style={styles.progressNumber}>
                  {progress}%
                </Text>

                <Text style={styles.target}>
                  {completedCount} of {tasks.length} completed
                </Text>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress}%` },
                  ]}
                />
              </View>

              <Text style={styles.progressHint}>
                {progress === 100 && tasks.length > 0
                  ? 'Amazing! All tasks completed!'
                  : 'Keep going, one task at a time.'}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>
              Add a new task
            </Text>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="What do you need to do?"
                placeholderTextColor="#969BB0"
                value={task}
                onChangeText={setTask}
                onSubmitEditing={addTask}
                returnKeyType="done"
                maxLength={120}
                accessibilityLabel="New task"
              />

              <TouchableOpacity
                style={styles.addButton}
                onPress={addTask}
                accessibilityRole="button"
              >
                <Text style={styles.addText}>+ Add</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {tasks.length}
                </Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {pendingCount}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {completedCount}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                My tasks
              </Text>

              {completedCount > 0 && (
                <TouchableOpacity onPress={clearCompleted}>
                  <Text style={styles.clearText}>
                    Clear completed
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.filterRow}>
              {['All', 'Pending', 'Completed'].map(option => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setFilter(option)}
                  style={[
                    styles.filterButton,
                    filter === option && styles.activeFilter,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filter === option &&
                        styles.activeFilterText,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>
              {filter === 'All'
                ? 'No tasks yet'
                : `No ${filter.toLowerCase()} tasks`}
            </Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'All'
                ? 'Add your first task and start making progress!'
                : 'Try another filter or add a new task.'}
            </Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 30 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FC',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F4F6FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#626B85',
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 24,
    flexGrow: 1,
  },
  eyebrow: {
    color: '#4F5ED7',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  heading: {
    fontSize: 32,
    fontWeight: '800',
    color: '#202746',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#7B8298',
    marginTop: 6,
    marginBottom: 24,
  },
  progressCard: {
    backgroundColor: '#4657D9',
    padding: 20,
    borderRadius: 20,
    marginBottom: 26,
  },
  progressLabel: {
    fontSize: 11,
    color: '#E2E6FF',
    fontWeight: '700',
    letterSpacing: 1,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  target: {
    color: '#E2E6FF',
    fontSize: 12,
  },
  progressTrack: {
    height: 7,
    backgroundColor: '#818DE9',
    borderRadius: 10,
    marginTop: 15,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  progressHint: {
    color: '#E2E6FF',
    fontSize: 12,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#202746',
    fontWeight: '800',
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E7EAF4',
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#202746',
  },
  addButton: {
    backgroundColor: '#4657D9',
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderRadius: 10,
    justifyContent: 'center',
  },
  addText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 26,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EAF5',
  },
  statNumber: {
    fontSize: 24,
    color: '#3546B4',
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    color: '#7B8298',
    marginTop: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearText: {
    color: '#4657D9',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#E8EAF6',
    borderRadius: 22,
  },
  activeFilter: {
    backgroundColor: '#4657D9',
  },
  filterText: {
    fontSize: 12,
    color: '#626B85',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8EAF5',
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#A5ADD0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: '#4657D9',
    borderColor: '#4657D9',
  },
  checkText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  taskDetails: {
    flex: 1,
    marginLeft: 12,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#202746',
  },
  done: {
    color: '#999FB0',
    textDecorationLine: 'line-through',
  },
  taskStatus: {
    color: '#9298AB',
    fontSize: 11,
    marginTop: 5,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 4,
  },
  deleteText: {
    color: '#D64D61',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    marginTop: 5,
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#202746',
  },
  emptySubtitle: {
    color: '#7B8298',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 18,
  },
});
