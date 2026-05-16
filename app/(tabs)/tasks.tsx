import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, GestureResponderEvent,
} from 'react-native';
import { CircleCheck as CheckCircle2, Plus, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import {
  COLUMNS, calculateScore, getColumnAccentColor,
} from '@/store/appStore';
import type { Task } from '@/types/database';
import WizardModal from '@/components/modals/WizardModal';
import QuickNoteModal from '@/components/modals/QuickNoteModal';

export default function TasksScreen() {
  const { projectTasks, completeTask } = useApp();
  const [colIndex, setColIndex] = useState(0);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [quickNoteOpen, setQuickNoteOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [confettiId, setConfettiId] = useState<string | null>(null);

  const touchStartX = useRef(0);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeCol = COLUMNS[colIndex];
  const activeTasks = projectTasks.filter(t => t.priority_column === activeCol && !t.completed);

  const handleTouchStart = (e: GestureResponderEvent) => {
    touchStartX.current = e.nativeEvent.pageX;
  };
  const handleTouchEnd = (e: GestureResponderEvent) => {
    const diff = touchStartX.current - e.nativeEvent.pageX;
    if (diff > 50 && colIndex < COLUMNS.length - 1) setColIndex(i => i + 1);
    if (diff < -50 && colIndex > 0) setColIndex(i => i - 1);
  };

  const handleLongPressStart = (task: Task) => {
    pressTimer.current = setTimeout(() => openWizardEdit(task), 500);
  };
  const handleLongPressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const openWizardEdit = (task: Task) => {
    setEditingTask(task);
    setWizardOpen(true);
  };

  const openWizardNew = () => {
    setEditingTask(null);
    setWizardOpen(true);
  };

  const handleComplete = async (id: string) => {
    setConfettiId(id);
    setTimeout(() => setConfettiId(null), 1200);
    await completeTask(id);
  };

  const accentColor = getColumnAccentColor(activeCol);

  return (
    <SafeAreaView style={styles.root}>
      {/* Column Header */}
      <View
        style={styles.header}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <View>
          <View style={styles.headerTitleRow}>
            <Text style={styles.colName}>{activeCol}</Text>
            <Text style={styles.colSub}>Priority</Text>
          </View>
          <Text style={styles.taskCount}>
            {activeTasks.length} task{activeTasks.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Dot indicators */}
        <View style={styles.dotsRow}>
          {COLUMNS.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => setColIndex(i)}>
              <View
                style={[
                  styles.dot,
                  i === colIndex
                    ? [styles.dotActive, { backgroundColor: accentColor }]
                    : styles.dotInactive,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Accent line */}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      {/* Task List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Brain dump button for To Sort */}
        {activeCol === 'To Sort' && (
          <TouchableOpacity
            style={styles.brainDumpBtn}
            onPress={() => setQuickNoteOpen(true)}
            activeOpacity={0.8}
          >
            <Plus size={18} color="#94a3b8" />
            <Text style={styles.brainDumpText}>Raw Brain Dump</Text>
          </TouchableOpacity>
        )}

        {/* Empty state */}
        {activeTasks.length === 0 && activeCol !== 'To Sort' && (
          <View style={styles.emptyState}>
            <CheckCircle2 size={40} color="#1e293b" />
            <Text style={styles.emptyStateTitle}>Zone Clear</Text>
            <Text style={styles.emptyStateSubtitle}>Nothing in {activeCol} priority</Text>
          </View>
        )}

        {/* Task Cards */}
        {activeTasks.map(task => {
          const score = calculateScore(task.reach, task.impact, task.confidence, task.effort);
          const isCompleting = confettiId === task.id;
          return (
            <View
              key={task.id}
              onTouchStart={() => handleLongPressStart(task)}
              onTouchEnd={handleLongPressEnd}
              style={[styles.card, isCompleting && styles.cardCompleting]}
            >
              <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
              <View style={styles.cardInner}>
                <View style={styles.cardTop}>
                  <View style={styles.cardTitleWrap}>
                    <Text style={styles.cardTitle}>{task.title}</Text>
                    {task.tags.length > 0 && (
                      <View style={styles.tagsRow}>
                        {task.tags.map(tag => (
                          <View key={tag} style={styles.tagBadge}>
                            <Text style={styles.tagBadgeText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  {activeCol === 'To Sort' ? (
                    <TouchableOpacity
                      style={styles.prioritizeBtn}
                      onPress={() => openWizardEdit(task)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.prioritizeBtnText}>Prioritize</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.completeBtn}
                      onPress={() => handleComplete(task.id)}
                      activeOpacity={0.8}
                    >
                      {isCompleting
                        ? <Text style={{ fontSize: 16 }}>🎉</Text>
                        : <CheckCircle2 size={18} color="#334155" />
                      }
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.cardMeta}>
                  <View style={styles.metaBadge}>
                    <Text style={styles.metaBadgeText}>RICE: {score}</Text>
                  </View>
                  <View
                    style={[
                      styles.moscowBadge,
                      task.moscow === 'Must' && styles.moscowMustBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.moscowBadgeText,
                        task.moscow === 'Must' && styles.moscowMustText,
                      ]}
                    >
                      {task.moscow}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Left peek arrow */}
      {colIndex > 0 && (
        <TouchableOpacity
          style={styles.peekBtnLeft}
          onPress={() => setColIndex(i => i - 1)}
          activeOpacity={0.7}
        >
          <ChevronLeft size={16} color="#475569" />
          <Text style={styles.peekLabel}>{COLUMNS[colIndex - 1]}</Text>
        </TouchableOpacity>
      )}

      {/* Right peek arrow */}
      {colIndex < COLUMNS.length - 1 && (
        <TouchableOpacity
          style={styles.peekBtn}
          onPress={() => setColIndex(i => i + 1)}
          activeOpacity={0.7}
        >
          <ChevronRight size={16} color="#475569" />
          <Text style={styles.peekLabel}>{COLUMNS[colIndex + 1]}</Text>
        </TouchableOpacity>
      )}

      {/* FAB */}
      <View style={styles.fabWrap}>
        <TouchableOpacity style={styles.fab} onPress={openWizardNew} activeOpacity={0.85}>
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </View>

      <WizardModal
        visible={wizardOpen}
        onClose={() => setWizardOpen(false)}
        editingTask={editingTask}
      />
      <QuickNoteModal visible={quickNoteOpen} onClose={() => setQuickNoteOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#020617',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  colName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#f1f5f9',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  colSub: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  taskCount: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  dot: {
    borderRadius: 10,
  },
  dotActive: {
    width: 20,
    height: 6,
  },
  dotInactive: {
    width: 6,
    height: 6,
    backgroundColor: '#1e293b',
  },
  accentBar: {
    height: 2,
    marginHorizontal: 20,
    borderRadius: 1,
    marginBottom: 16,
    opacity: 0.6,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  brainDumpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#1e293b',
    borderRadius: 16,
    paddingVertical: 18,
    backgroundColor: 'transparent',
  },
  brainDumpText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  emptyStateSubtitle: {
    fontSize: 12,
    color: '#1e293b',
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  cardCompleting: {
    opacity: 0.6,
  },
  cardAccent: {
    height: 2,
    width: '100%',
    opacity: 0.8,
  },
  cardInner: {
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  cardTitleWrap: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f1f5f9',
    lineHeight: 21,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tagBadge: {
    backgroundColor: '#1e293b',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  tagBadgeText: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: '600',
  },
  completeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  prioritizeBtn: {
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.4)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexShrink: 0,
  },
  prioritizeBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#f59e0b',
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  metaBadge: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  metaBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#22d3ee',
  },
  moscowBadge: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  moscowMustBadge: {
    backgroundColor: 'rgba(236,72,153,0.1)',
    borderColor: '#ec4899',
  },
  moscowBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  moscowMustText: {
    color: '#ec4899',
  },
  peekBtn: {
    position: 'absolute',
    right: 0,
    top: '50%',
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: '#1e293b',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  peekBtnLeft: {
    position: 'absolute',
    left: 0,
    top: '50%',
    backgroundColor: '#0f172a',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: '#1e293b',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  peekLabel: {
    fontSize: 8,
    color: '#334155',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fabWrap: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    zIndex: 30,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ec4899',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  fabIcon: {
    fontSize: 28,
    color: '#fff',
    lineHeight: 32,
    fontWeight: '300',
  },
});
