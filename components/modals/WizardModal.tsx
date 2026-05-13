import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, ScrollView, SafeAreaView,
} from 'react-native';
import { X, Target, Circle as HelpCircle } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import {
  FIBONACCI, QUICK_TAGS, MOSCOW_OPTIONS,
  calculateScore, predictColumn, getColumnAccentColor,
} from '@/store/appStore';
import type { Task } from '@/types/database';

interface Props {
  visible: boolean;
  onClose: () => void;
  editingTask: Task | null;
}

type WizardField = {
  title: string;
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
  moscow: string;
  tags: string[];
  infoOpen: string | null;
};

const DEFAULT_FORM: WizardField = {
  title: '', reach: 3, impact: 3, confidence: 3, effort: 3,
  moscow: 'Should', tags: [], infoOpen: null,
};

const METRIC_HINT = 'Why the jump? 1 (Minimal), 2 (Small), 3 (Med), 5 (Large), 8 (Epic). If it feels bigger than a 3, jump to 5.';

export default function WizardModal({ visible, onClose, editingTask }: Props) {
  const { createTask, updateTask, activeProjectId } = useApp();
  const [form, setForm] = useState<WizardField>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      if (editingTask) {
        setForm({
          title: editingTask.title,
          reach: editingTask.reach,
          impact: editingTask.impact,
          confidence: editingTask.confidence,
          effort: editingTask.effort,
          moscow: editingTask.moscow,
          tags: editingTask.tags,
          infoOpen: null,
        });
      } else {
        setForm(DEFAULT_FORM);
      }
    }
  }, [visible, editingTask]);

  const score = calculateScore(form.reach, form.impact, form.confidence, form.effort);
  const predicted = predictColumn(score, form.moscow);
  const accentColor = getColumnAccentColor(predicted);

  const toggleTag = (tag: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !activeProjectId) return;
    setSaving(true);
    if (editingTask) {
      await updateTask(editingTask.id, {
        title: form.title.trim(),
        reach: form.reach,
        impact: form.impact,
        confidence: form.confidence,
        effort: form.effort,
        moscow: form.moscow,
        tags: form.tags,
        priority_column: predicted,
      });
    } else {
      await createTask({
        project_id: activeProjectId,
        title: form.title.trim(),
        reach: form.reach,
        impact: form.impact,
        confidence: form.confidence,
        effort: form.effort,
        moscow: form.moscow,
        priority_column: predicted,
        completed: false,
        tags: form.tags,
      });
    }
    setSaving(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Target size={18} color="#ec4899" />
              <Text style={styles.headerTitle}>The Gatekeeper</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Title + Tags */}
            <TextInput
              style={styles.titleInput}
              value={form.title}
              onChangeText={t => setForm(f => ({ ...f, title: t }))}
              placeholder="Goal Name..."
              placeholderTextColor="#475569"
              autoFocus
            />
            <View style={styles.tagsRow}>
              {QUICK_TAGS.map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tag, form.tags.includes(tag) && styles.tagActive]}
                  onPress={() => toggleTag(tag)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.tagText, form.tags.includes(tag) && styles.tagTextActive]}>
                    + {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Live Prediction Gauge */}
            <View style={styles.gauge}>
              <View style={styles.gaugeBar}>
                <View
                  style={[
                    styles.gaugeFill,
                    {
                      width: `${Math.min((parseFloat(score) / 40) * 100, 100)}%`,
                      backgroundColor: accentColor,
                    },
                  ]}
                />
              </View>
              <View style={styles.gaugeContent}>
                <View>
                  <Text style={styles.gaugeTierLabel}>Calculated Tier</Text>
                  <Text style={[styles.gaugeTier, { color: accentColor }]}>
                    {predicted} Priority
                  </Text>
                </View>
                <View style={styles.gaugeScore}>
                  <Text style={styles.gaugeScoreNum}>{score}</Text>
                  <Text style={styles.gaugeScoreUnit}>RICE Pts</Text>
                </View>
              </View>
            </View>

            {/* MoSCoW */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>MoSCoW Filter (Overrides RICE)</Text>
              <View style={styles.moscowRow}>
                {MOSCOW_OPTIONS.map(m => {
                  const active = form.moscow === m;
                  return (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.moscowBtn,
                        active && (m === 'Must' ? styles.moscowMust : styles.moscowActive),
                      ]}
                      onPress={() => setForm(f => ({ ...f, moscow: m }))}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.moscowText, active && styles.moscowTextActive]}>
                        {m}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* RICE Sliders */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>RICE Estimation (Fibonacci)</Text>
              {(['reach', 'impact', 'confidence', 'effort'] as const).map(metric => (
                <View key={metric} style={styles.metricCard}>
                  <View style={styles.metricHeader}>
                    <View style={styles.metricLeft}>
                      <Text style={styles.metricName}>{metric}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          setForm(f => ({
                            ...f,
                            infoOpen: f.infoOpen === metric ? null : metric,
                          }))
                        }
                      >
                        <HelpCircle size={16} color="#475569" />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.metricValue}>{form[metric]}</Text>
                  </View>
                  {form.infoOpen === metric && (
                    <View style={styles.hint}>
                      <Text style={styles.hintText}>
                        <Text style={styles.hintBold}>Why the jump? </Text>
                        {METRIC_HINT}
                      </Text>
                    </View>
                  )}
                  <View style={styles.fibRow}>
                    {FIBONACCI.map(val => (
                      <TouchableOpacity
                        key={val}
                        style={[
                          styles.fibBtn,
                          form[metric] === val && styles.fibBtnActive,
                        ]}
                        onPress={() => setForm(f => ({ ...f, [metric]: val }))}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.fibText,
                            form[metric] === val && styles.fibTextActive,
                          ]}
                        >
                          {val}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Sticky CTA */}
          <View style={styles.cta}>
            <TouchableOpacity
              style={[styles.ctaBtn, !form.title.trim() && styles.ctaBtnDisabled]}
              onPress={handleSave}
              disabled={!form.title.trim() || saving}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaBtnText}>
                {saving ? 'Saving...' : `Commit to ${predicted} Priority`}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.95)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#020617',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flex: 1,
    marginTop: 60,
    borderTopWidth: 1,
    borderColor: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f1f5f9',
  },
  closeBtn: {
    padding: 6,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  titleInput: {
    borderBottomWidth: 2,
    borderBottomColor: '#334155',
    paddingVertical: 10,
    fontSize: 24,
    fontWeight: '800',
    color: '#f1f5f9',
    marginBottom: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagActive: {
    backgroundColor: '#ec4899',
    borderColor: '#ec4899',
  },
  tagText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  tagTextActive: {
    color: '#fff',
  },
  gauge: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
    marginBottom: 20,
  },
  gaugeBar: {
    height: 3,
    backgroundColor: '#1e293b',
  },
  gaugeFill: {
    height: '100%',
  },
  gaugeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 16,
    paddingTop: 14,
  },
  gaugeTierLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  gaugeTier: {
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gaugeScore: {
    alignItems: 'flex-end',
  },
  gaugeScoreNum: {
    fontSize: 28,
    fontWeight: '900',
    color: '#e2e8f0',
  },
  gaugeScoreUnit: {
    fontSize: 10,
    color: '#475569',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  moscowRow: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#1e293b',
    gap: 2,
  },
  moscowBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  moscowActive: {
    backgroundColor: '#1e293b',
  },
  moscowMust: {
    backgroundColor: '#9f1239',
  },
  moscowText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  moscowTextActive: {
    color: '#f1f5f9',
  },
  metricCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 10,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e2e8f0',
    textTransform: 'capitalize',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#22d3ee',
  },
  hint: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  hintText: {
    fontSize: 11,
    color: '#cbd5e1',
    lineHeight: 16,
  },
  hintBold: {
    color: '#22d3ee',
    fontWeight: '700',
  },
  fibRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  fibBtn: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#1e293b',
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: 44,
  },
  fibBtnActive: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
  },
  fibText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  fibTextActive: {
    color: '#020617',
  },
  cta: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#020617',
  },
  ctaBtn: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#ec4899',
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaBtnDisabled: {
    opacity: 0.4,
  },
  ctaBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
