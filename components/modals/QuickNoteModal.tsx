import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { X, Zap } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function QuickNoteModal({ visible, onClose }: Props) {
  const { createTask, activeProjectId } = useApp();
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!text.trim() || !activeProjectId) return;
    setSaving(true);
    await createTask({
      project_id: activeProjectId,
      title: text.trim(),
      reach: 3,
      impact: 3,
      confidence: 3,
      effort: 3,
      moscow: 'Should',
      priority_column: 'To Sort',
      completed: false,
      tags: [],
    });
    setSaving(false);
    setText('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Zap size={20} color="#f59e0b" />
              <Text style={styles.title}>Brain Dump</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color="#64748b" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Dump your idea here. We'll sort it later..."
            placeholderTextColor="#475569"
            multiline
            autoFocus
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.cta, !text.trim() && styles.ctaDisabled]}
            onPress={handleSave}
            disabled={!text.trim() || saving}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>{saving ? 'Saving...' : 'Send to "To Sort"'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.9)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    minHeight: 340,
    borderTopWidth: 1,
    borderColor: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f59e0b',
  },
  closeBtn: {
    padding: 6,
  },
  input: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    padding: 14,
    color: '#f1f5f9',
    fontSize: 16,
    minHeight: 120,
    marginBottom: 16,
  },
  cta: {
    backgroundColor: '#d97706',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});
