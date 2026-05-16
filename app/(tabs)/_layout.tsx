import { useState } from 'react';
import { Tabs } from 'expo-router';
import { Hop as Home, LayoutList, Folder, Target, Zap, Plus, X } from 'lucide-react-native';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AppProvider } from '@/context/AppContext';
import VaultModal from '@/components/modals/VaultModal';
import OnboardingModal from '@/components/modals/OnboardingModal';
import QuickNoteModal from '@/components/modals/QuickNoteModal';
import WizardModal from '@/components/modals/WizardModal';

function TabBarIcon({ icon: Icon, focused }: { icon: typeof Home; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Icon size={20} color={focused ? '#22d3ee' : '#475569'} strokeWidth={2} />
    </View>
  );
}

function GlobalFAB() {
  const [fabOpen, setFabOpen] = useState(false);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [quickNoteOpen, setQuickNoteOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <>
      {fabOpen && (
        <TouchableOpacity
          style={styles.fabOverlay}
          activeOpacity={1}
          onPress={() => setFabOpen(false)}
          accessible={false}
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

      <View style={styles.fabWrap} pointerEvents="box-none">
        <TouchableOpacity
          style={[styles.fab, fabOpen && styles.fabActive]}
          onPress={() => setFabOpen(o => !o)}
          activeOpacity={0.85}
        >
          <View style={{ transform: [{ rotate: fabOpen ? '45deg' : '0deg' }] }}>
            {fabOpen ? <X size={24} color="#fff" /> : <Plus size={24} color="#fff" />}
          </View>
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
    </>
  );
}

export default function TabLayout() {
  return (
    <AppProvider>
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: '#22d3ee',
            tabBarInactiveTintColor: '#475569',
            tabBarLabelStyle: styles.tabLabel,
            tabBarBackground: () => <View style={styles.tabBarBg} />,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ focused }) => <TabBarIcon icon={Home} focused={focused} />,
            }}
          />
          <Tabs.Screen
            name="tasks"
            options={{
              title: 'Tasks',
              tabBarIcon: ({ focused }) => <TabBarIcon icon={LayoutList} focused={focused} />,
            }}
          />
        </Tabs>
        <GlobalFAB />
      </View>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0f172a',
    borderTopColor: '#1e293b',
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarBg: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(34,211,238,0.12)',
  },
  fabOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
    backgroundColor: 'rgba(2,6,23,0.8)',
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
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ec4899',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#020617',
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  fabActive: {
    backgroundColor: '#334155',
    borderColor: '#020617',
  },
});
