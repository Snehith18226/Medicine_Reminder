import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { useMedicines } from '../context/MedicineContext';
import { parseISO, isBefore, isAfter, isEqual } from 'date-fns';

const typeIcons = {
  Tablet: '💊',
  Syrup: '🧴',
  Injection: '💉',
  Capsule: '💊',
};

const formatDate = (date) => new Date(date).toISOString().split('T')[0];

const HistoryScreen = () => {
  const { medicines, setMedicines } = useMedicines();
  const [filter, setFilter] = useState('Taken');
  const [searchTerm, setSearchTerm] = useState('');

  const today = new Date();

  const filteredMedicines = medicines
    .filter((med) => {
      const medDate = parseISO(med.startDate);
      const isTaken = med.taken;

      if (filter === 'Taken') return isTaken && (isBefore(medDate, today) || isEqual(medDate, today));
      if (filter === 'Missed') return !isTaken && isBefore(medDate, today);
      if (filter === 'Upcoming') return isAfter(medDate, today);
      return false;
    })
    .filter((med) => med.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this medicine record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = medicines.filter((med) => med.id !== id);
            setMedicines(updated);
          },
        },
      ]
    );
  };

  const clearHistory = () => {
    Alert.alert(
      'Clear All History',
      `Delete all ${filter.toLowerCase()} records?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            const updated = medicines.filter((med) => {
              const medDate = parseISO(med.startDate);
              if (filter === 'Taken') return !(med.taken && (isBefore(medDate, today) || isEqual(medDate, today)));
              if (filter === 'Missed') return !(isBefore(medDate, today) && !med.taken);
              return true;
            });
            setMedicines(updated);
          },
        },
      ]
    );
  };

  const renderMedicine = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.medicineName}>
          {typeIcons[item.type] || '📦'} {item.name}
        </Text>
        {filter !== 'Upcoming' && (
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Text style={styles.deleteText}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.info}>🧪 Dosage: {item.dosage}</Text>
      <Text style={styles.info}>⏰ Time: {item.time}</Text>
      <Text style={styles.info}>🔁 Frequency: {item.frequency}</Text>
      <Text style={styles.info}>📅 Date: {formatDate(item.startDate)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📖 Medicine History</Text>

      <View style={styles.tabContainer}>
        {['Taken', 'Missed', 'Upcoming'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, filter === tab && styles.activeTab]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.tabText, filter === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search medicine name..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholderTextColor="#aaa"
      />

      {(filter === 'Taken' || filter === 'Missed') && filteredMedicines.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
          <Text style={styles.clearButtonText}>🧹 Clear All {filter}</Text>
        </TouchableOpacity>
      )}

      {filteredMedicines.length === 0 ? (
        <Text style={styles.noHistoryText}>No records found for {filter}</Text>
      ) : (
        <FlatList
          data={filteredMedicines}
          keyExtractor={(item) => item.id}
          renderItem={renderMedicine}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    borderRadius: 12,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#007aff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  activeTabText: {
    color: '#fff',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  clearButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    backgroundColor: '#ff3b30',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  medicineName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  deleteText: {
    fontSize: 18,
    color: '#ff3b30',
  },
  info: {
    fontSize: 14,
    marginTop: 4,
    color: '#555',
  },
  noHistoryText: {
    fontSize: 16,
    color: '#888',
    marginTop: 40,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 80,
  },
});
