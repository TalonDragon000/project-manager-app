import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  ScrollView, SafeAreaView,
} from 'react-native';
import { X, Folder } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import type { Project } from '@/types/database';

interface Props {
  visible: boolean;
  onClose: () => void;
  onNewProject: () => void;
}

function ProjectRow({ project, active, onPress }: {
  project: Project; active: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, active && styles.rowActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.dot, active && styles.dotActive]} />
      <View style={styles.rowText}>
        <Text style={[styles.rowName, active && styles.rowNameActive]} numberOfLines={1}>
          {project.name}
        </Text>
        <Text style={styles.rowMission} numberOfLines={1}>{project.mission}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function VaultModal({ visible, onClose, onNewProject }: Props) {
  const { projects, activeProjectId, setActiveProjectId } = useApp();

  const handleSelect = (id: string) => {
    setActiveProjectId(id);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Folder size={20} color="#a78bfa" />
              <Text style={styles.title}>The Vault</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color="#64748b" />
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>Only one active project at a time.</Text>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {projects.map(p => (
              <ProjectRow
                key={p.id}
                project={p}
                active={p.id === activeProjectId}
                onPress={() => handleSelect(p.id)}
              />
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.newBtn} onPress={onNewProject} activeOpacity={0.85}>
            <Text style={styles.newBtnText}>+ New Project</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.85)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 16,
    maxHeight: '80%',
    borderTopWidth: 1,
    borderColor: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f1f5f9',
  },
  closeBtn: {
    padding: 6,
  },
  hint: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 10,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 12,
  },
  rowActive: {
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderColor: '#7c3aed',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
  },
  dotActive: {
    backgroundColor: '#a78bfa',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  rowNameActive: {
    color: '#a78bfa',
  },
  rowMission: {
    fontSize: 11,
    color: '#475569',
  },
  newBtn: {
    marginTop: 16,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  newBtnText: {
    color: '#94a3b8',
    fontWeight: '700',
    fontSize: 14,
  },
});
