import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  canClose: boolean;
}

export default function OnboardingModal({ visible, onClose, canClose }: Props) {
  const { createProject } = useApp();
  const [name, setName] = useState('');
  const [mission, setMission] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await createProject(name.trim(), mission.trim());
    setSaving(false);
    setName('');
    setMission('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {canClose && (
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={22} color="#94a3b8" />
            </TouchableOpacity>
          )}
          <View style={styles.header}>
            <Text style={styles.title}>New Project</Text>
            <Text style={styles.subtitle}>A 10-second start to maintain focus.</Text>
          </View>
          <View style={styles.fields}>
            <View style={styles.field}>
              <Text style={styles.label}>Project Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. DeFi Wallet"
                placeholderTextColor="#475569"
                autoFocus
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Core Mission (One sentence)</Text>
              <TextInput
                style={styles.input}
                value={mission}
                onChangeText={setMission}
                placeholder="Why are we building this?"
                placeholderTextColor="#475569"
              />
            </View>
          </View>
          <TouchableOpacity
            style={[styles.cta, !name.trim() && styles.ctaDisabled]}
            onPress={handleCreate}
            disabled={!name.trim() || saving}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>{saving ? 'Creating...' : 'Start Building'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 32,
  },
  closeBtn: {
    position: 'absolute',
    top: 48,
    right: 24,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#c084fc',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  fields: {
    gap: 24,
    marginBottom: 40,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#0f172a',
    borderBottomWidth: 2,
    borderBottomColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 18,
    color: '#f1f5f9',
    borderRadius: 8,
  },
  cta: {
    backgroundColor: '#7c3aed',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
