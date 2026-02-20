import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Image } from 'react-native';

interface PopupProps {
  visible: boolean;
  onClose: () => void;
  eventName: string;
  totalPoints: number;
}

const AttendancePopup = ({
  visible,
  onClose,
  eventName,
  totalPoints,
}: PopupProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Pressable style={styles.closeIcon} onPress={onClose}>
            <Text style={{ color: 'white', fontSize: 20 }}>✕</Text>
          </Pressable>

          <View style={styles.trophyCircle}>
            <Text style={{ fontSize: 40 }}>🏆</Text>
          </View>

          <Text style={styles.title}>Event Complete!</Text>
          <Text style={styles.points}>+50</Text>
          <Text style={styles.pointsSub}>POINTS EARNED</Text>

          <Text style={styles.description}>
            You've successfully attended{' '}
            <Text style={{ fontWeight: 'bold' }}>{eventName}</Text>.
          </Text>

          <View style={styles.walletBox}>
            <View style={styles.walletCircle} />
            <View style={{ flex: 1 }}>
              <Text style={styles.walletLabel}>Updated Balance</Text>
              <Text style={styles.walletId}>Wallet ID: 8940</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.totalPoints}>{totalPoints}</Text>
              <Text style={styles.totalLabel}>TOTAL POINTS</Text>
            </View>
          </View>

          <Pressable style={styles.collectBtn} onPress={onClose}>
            <Text style={styles.collectText}>Collect</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#10151C',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  closeIcon: { position: 'absolute', top: 15, right: 20 },
  trophyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#A855F7',
  },
  title: { color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  points: { color: '#A855F7', fontSize: 48, fontWeight: '900' },
  pointsSub: {
    color: '#A855F7',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 15,
  },
  description: {
    color: '#94A3B8',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 25,
  },
  walletBox: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  walletCircle: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#334155',
    marginRight: 12,
  },
  walletLabel: { color: '#94A3B8', fontSize: 10 },
  walletId: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  totalPoints: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  totalLabel: { color: '#94A3B8', fontSize: 8 },
  collectBtn: { marginTop: 10 },
  collectText: { color: '#94A3B8', fontSize: 16 },
});

export default AttendancePopup;
