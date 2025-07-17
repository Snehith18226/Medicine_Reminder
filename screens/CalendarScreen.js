import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { useMedicines } from '../context/MedicineContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';

const CalendarScreen = () => {
  const { medicines } = useMedicines();
  const [selectedDate, setSelectedDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    const grouped = {};

    medicines.forEach((med) => {
      const date = med.startDate;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(med);
    });

    const marks = {};

    Object.keys(grouped).forEach((date) => {
      const meds = grouped[date];
      const total = meds.length;
      const takenCount = meds.filter((m) => m.taken).length;

      let color = '#e74c3c'; // red (none taken)
      if (takenCount === total) color = '#2ecc71'; // green (all taken)
      else if (takenCount > 0) color = '#f1c40f'; // yellow (some taken)

      marks[date] = {
        selected: selectedDate === date,
        marked: true,
        selectedColor: selectedDate === date ? '#4a90e2' : color,
        dotColor: color,
        customStyles: {
          container: {
            backgroundColor: selectedDate === date ? '#4a90e2' : color,
            borderRadius: 16,
          },
          text: {
            color: 'white',
            fontWeight: 'bold',
          },
        },
      };
    });

    setMarkedDates(marks);
  }, [medicines, selectedDate]);

  const filteredMedicines = selectedDate
    ? medicines.filter((med) => med.startDate === selectedDate)
    : [];

  const renderMedicineItem = ({ item }) => (
    <View style={styles.medicineItem}>
      <MaterialCommunityIcons name="calendar-clock" size={24} color="#4a90e2" />
      <View style={styles.textContainer}>
        <Text style={styles.medicineName}>{item.name}</Text>
        <Text style={styles.time}>
          {item.time} • {item.dosage} • {item.frequency}
        </Text>
        <Text style={styles.startDate}>Start Date: {item.startDate}</Text>
        <Text style={styles.takenStatus}>
          Status: {item.taken ? '✅ Taken' : '❌ Not Taken'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>📅 Medicine Schedule</Text>

        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          markingType={'custom'}
          theme={{
            todayTextColor: '#00adf5',
            arrowColor: '#4a90e2',
            textMonthFontWeight: 'bold',
          }}
          style={styles.calendar}
        />

        <Text style={styles.subTitle}>
          {selectedDate
            ? `Showing medicines for ${selectedDate}`
            : 'Select a date to view schedule'}
        </Text>

        {selectedDate && filteredMedicines.length === 0 ? (
          <Text style={styles.noData}>No medicines for this date.</Text>
        ) : (
          <FlatList
            data={filteredMedicines}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMedicineItem}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f9fc',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  calendar: {
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  subTitle: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#444',
    marginBottom: 12,
  },
  medicineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f0ff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  textContainer: {
    marginLeft: 10,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: '600',
  },
  time: {
    fontSize: 14,
    color: '#666',
  },
  startDate: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  takenStatus: {
    fontSize: 13,
    color: '#4a90e2',
    marginTop: 2,
  },
  noData: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default CalendarScreen;
