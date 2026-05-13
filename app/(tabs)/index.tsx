import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Folder, Target, Zap, CircleCheck as CheckCircle2, Plus } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import VaultModal from '@/components/modals/VaultModal';
import OnboardingModal from '@/components/modals/OnboardingModal';
import QuickNoteModal from '@/components/modals/QuickNoteModal';
import WizardModal from '@/components/modals/WizardModal';

export default function HomeScreen() {
  const { activeProject, projectTasks, completedTasks, loading } = useApp();

  const [vaultOpen, setVaultOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [quickNoteOpen, setQuickNoteOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  const nowTasks = projectTasks.filter(t => t.priority_column === 'High' && !t.completed);
  const nextTasks = projectTasks.filter(
    t => (t.priority_column === 'Med' || t.priority_column === 'Low') && !t.completed,
  );
  const progress = projectTasks.length > 0
    ? Math.round((completedTasks.length / projectTasks.length) * 100)
    : 0;
  const RADIUS = 26;
  const CIRC = 2 * Math.PI * RADIUS;
  const strokeDash = (progress / 100) * CIRC;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#22d3ee" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeft}
          onPress={() => setVaultOpen(true)}
          activeOpacity={0.75}
        >
          <Folder size={18} color="#a78bfa" />
          <View>
            <Text style={styles.projectName} numberOfLines={1}>
              {activeProject?.name ?? 'Project Hub'}
            </Text>
            <Text style={styles.vaultHint}>Tap to open Vault</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress + Mission */}
        <View style={styles.missionCard}>
          <View style={styles.progressRing}>
            <Svg width={64} height={64} viewBox="0 0 64 64">
              <Circle
                cx={32} cy={32} r={RADIUS}
                stroke="#1e293b" strokeWidth={4} fill="none"
              />
              <Circle
                cx={32} cy={32} r={RADIUS}
                stroke="#22d3ee" strokeWidth={4} fill="none"
                strokeDasharray={`${strokeDash} ${CIRC}`}
                strokeLinecap="round"
                rotation={-90}
                originX={32}
                originY={32}
              />
            </Svg>
            <Text style={styles.progressPct}>{progress}%</Text>
          </View>
          <View style={styles.missionText}>
            <Text style={styles.missionLabel}>Mission</Text>
            <Text style={styles.missionValue} numberOfLines={3}>
              "{activeProject?.mission ?? 'No mission set yet.'}"
            </Text>
          </View>
        </View>

        {/* Strategy Specs */}
        <View style={styles.sectionHeader}>
          <Target size={14} color="#a78bfa" />
          <Text style={[styles.sectionTitle, { color: '#a78bfa' }]}>Strategy Specs</Text>
        </View>
        <View style={styles.specsGrid}>
          {['WHO (Audience)', 'WHAT (Product)', 'WHY (Problem)'].map(spec => (
            <View key={spec} style={styles.specCard}>
              <Text style={styles.specLabel}>{spec}</Text>
              <Plus size={16} color="#334155" />
            </View>
          ))}
        </View>

        {/* GO Roadmap */}
        <View style={styles.sectionHeader}>
          <Zap size={14} color="#f472b6" />
          <Text style={[styles.sectionTitle, { color: '#f472b6' }]}>GO Roadmap</Text>
        </View>
        <View style={styles.roadmapCard}>
          <View style={styles.roadmapRow}>
            <View style={[styles.roadmapLine, { backgroundColor: '#ec4899' }]} />
            <View style={styles.roadmapContent}>
              <View style={[styles.roadmapDot, { backgroundColor: '#ec4899' }]} />
              <Text style={[styles.roadmapPhaseLabel, { color: '#ec4899' }]}>NOW</Text>
              {nowTasks.length === 0 ? (
                <Text style={styles.emptyPhase}>No high priority goals.</Text>
              ) : (
                nowTasks.map(t => (
                  <Text key={t.id} style={styles.roadmapTaskNow}>{t.title}</Text>
                ))
              )}
            </View>
          </View>
          <View style={styles.roadmapRow}>
            <View style={[styles.roadmapLine, { backgroundColor: '#a855f7' }]} />
            <View style={styles.roadmapContent}>
              <View style={[styles.roadmapDot, { backgroundColor: '#a855f7' }]} />
              <Text style={[styles.roadmapPhaseLabel, { color: '#a855f7' }]}>NEXT</Text>
              {nextTasks.length === 0 ? (
                <Text style={styles.emptyPhase}>Empty queue.</Text>
              ) : (
                nextTasks.map(t => (
                  <Text key={t.id} style={styles.roadmapTaskNext}>{t.title}</Text>
                ))
              )}
            </View>
          </View>
        </View>

        {/* Devlog */}
        <View style={styles.sectionHeader}>
          <CheckCircle2 size={14} color="#22d3ee" />
          <Text style={[styles.sectionTitle, { color: '#22d3ee' }]}>Devlog</Text>
        </View>
        {completedTasks.length === 0 ? (
          <View style={styles.emptyDevlog}>
            <Text style={styles.emptyDevlogText}>No confetti moments yet.</Text>
          </View>
        ) : (
          <View style={styles.devlogList}>
            {[...completedTasks].reverse().map(t => (
              <View key={t.id} style={styles.devlogItem}>
                <Text style={styles.devlogTitle}>{t.title}</Text>
                <View style={styles.devlogBadge}>
                  <Text style={styles.devlogBadgeText}>Win</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      {fabOpen && (
        <TouchableOpacity
          style={styles.fabOverlay}
          activeOpacity={1}
          onPress={() => setFabOpen(false)}
        >
          <View style={styles.fabMenu}>
            <TouchableOpacity
              style={styles.fabMenuItem}
              onPress={() => { setFabOpen(false); setWizardOpen(true); }}
              activeOpacity={0.85}
            >
              <Target size={18} color="#ec4899" />
              <Text style={styles.fabMenuText}>New Priority Task</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fabMenuItem}
              onPress={() => { setFabOpen(false); setQuickNoteOpen(true); }}
              activeOpacity={0.85}
            >
              <Zap size={18} color="#f59e0b" />
              <Text style={styles.fabMenuText}>Quick Note (To Sort)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fabMenuItem}
              onPress={() => { setFabOpen(false); setOnboardingOpen(true); }}
              activeOpacity={0.85}
            >
              <Folder size={18} color="#a78bfa" />
              <Text style={styles.fabMenuText}>New Project</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
      <View style={styles.fabWrap}>
        <TouchableOpacity
          style={[styles.fab, fabOpen && styles.fabOpen]}
          onPress={() => setFabOpen(o => !o)}
          activeOpacity={0.85}
        >
          <Text style={styles.fabIcon}>{fabOpen ? '×' : '+'}</Text>
        </TouchableOpacity>
      </View>

      <VaultModal
        visible={vaultOpen}
        onClose={() => setVaultOpen(false)}
        onNewProject={() => { setVaultOpen(false); setOnboardingOpen(true); }}
      />
      <OnboardingModal
        visible={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        canClose
      />
      <QuickNoteModal visible={quickNoteOpen} onClose={() => setQuickNoteOpen(false)} />
      <WizardModal visible={wizardOpen} onClose={() => setWizardOpen(false)} editingTask={null} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#020617',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#0f172a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  projectName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#f1f5f9',
    maxWidth: 200,
  },
  vaultHint: {
    fontSize: 9,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    gap: 16,
    marginBottom: 24,
  },
  progressRing: {
    width: 64,
    height: 64,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  progressPct: {
    position: 'absolute',
    fontSize: 11,
    fontWeight: '800',
    color: '#22d3ee',
  },
  missionText: {
    flex: 1,
    gap: 4,
  },
  missionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  missionValue: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
    lineHeight: 19,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  specsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  specCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    borderStyle: 'dashed',
    padding: 12,
    alignItems: 'center',
    gap: 6,
    opacity: 0.6,
  },
  specLabel: {
    fontSize: 9,
    color: '#475569',
    textAlign: 'center',
    fontWeight: '700',
  },
  roadmapCard: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    gap: 20,
    marginBottom: 24,
  },
  roadmapRow: {
    flexDirection: 'row',
    gap: 12,
  },
  roadmapLine: {
    width: 2,
    borderRadius: 1,
    minHeight: 40,
  },
  roadmapContent: {
    flex: 1,
    gap: 4,
  },
  roadmapDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    left: -16,
    top: 6,
  },
  roadmapPhaseLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  roadmapTaskNow: {
    fontSize: 14,
    color: '#e2e8f0',
    fontWeight: '500',
  },
  roadmapTaskNext: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '400',
  },
  emptyPhase: {
    fontSize: 12,
    color: '#334155',
    fontStyle: 'italic',
  },
  emptyDevlog: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyDevlogText: {
    fontSize: 13,
    color: '#334155',
    fontStyle: 'italic',
  },
  devlogList: {
    gap: 8,
    marginBottom: 24,
  },
  devlogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 12,
    opacity: 0.65,
  },
  devlogTitle: {
    fontSize: 13,
    color: '#64748b',
    textDecorationLine: 'line-through',
    flex: 1,
    marginRight: 10,
  },
  devlogBadge: {
    backgroundColor: 'rgba(6,182,212,0.1)',
    borderWidth: 1,
    borderColor: '#0891b2',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  devlogBadgeText: {
    fontSize: 9,
    color: '#22d3ee',
    fontWeight: '700',
  },
  fabOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingBottom: 90,
    paddingRight: 20,
  },
  fabMenu: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  fabMenuText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e2e8f0',
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
  fabOpen: {
    backgroundColor: '#334155',
  },
  fabIcon: {
    fontSize: 28,
    color: '#fff',
    lineHeight: 32,
    fontWeight: '300',
  },
});
