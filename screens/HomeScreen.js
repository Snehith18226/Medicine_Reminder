import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Switch,
  Animated,
  Platform,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import { scheduleMedicineNotification } from '../services/NotificationService';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import * as LocalAuthentication from 'expo-local-authentication';
import { useMedicines } from '../context/MedicineContext';

const motivationalQuotes = [
  "Your health is your wealth 💪",
  "One step at a time is all it takes 🧘‍♂️",
  "Small steps every day = big results 🌱",
  "Stay strong, take your meds on time ⏰",
  "Healing begins with consistency ❤️",
  "You’ve got this. Keep going! 🚀",
];

const HomeScreen = () => {
  const { medicines, addMedicineToList, toggleMedicineTaken, deleteMedicineFromList } = useMedicines();

  const [modalVisible, setModalVisible] = useState(false);
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [type, setType] = useState('Tablet');
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedFrequency, setSelectedFrequency] = useState('Once Daily');
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const greetingOpacity = useRef(new Animated.Value(0)).current;
  const [greeting, setGreeting] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    authenticateUser();
  }, []);

  const authenticateUser = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access your medicine list',
    });

    if (result.success) {
      setIsAuthenticated(true);
      const hour = new Date().getHours();
      const greet = hour < 12 ? 'Good Morning ☀️' : hour < 18 ? 'Good Afternoon 🌤️' : 'Good Evening 🌙';
      setGreeting(greet);
      Animated.timing(greetingOpacity, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }).start();

      const interval = setInterval(() => {
        setQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
      }, 5000);
      return () => clearInterval(interval);
    } else {
      Alert.alert('Authentication Failed', 'Unable to authenticate.');
    }
  };

  const formatDateString = (date) => {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  };
  

  const addMedicine = async () => {
    if (!medicineName || !dosage) return;

    const newItem = {
      id: Date.now().toString(),
      name: medicineName,
      dosage: dosage + ' mg',
      type,
      time: selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      frequency: selectedFrequency,
      taken: false,
      startDate: formatDateString(selectedStartDate),
    };

    addMedicineToList(newItem);
    await scheduleMedicineNotification(medicineName, selectedTime);
    setMedicineName('');
    setDosage('');
    setType('Tablet');
    setSelectedFrequency('Once Daily');
    setSelectedStartDate(new Date());
    setModalVisible(false);
  };

  const today = formatDateString(new Date());
  const todayMedicines = medicines.filter((med) => med.startDate === today);

  const takenCount = todayMedicines.filter((med) => med.taken).length;
  const total = todayMedicines.length;
  const progress = total > 0 ? (takenCount / total) * 100 : 0;

  const typeIcons = {
    Tablet: '💊',
    Syrup: '🧴',
    Injection: '💉',
    Capsule: '💊',
  };

  const frequencyIcons = {
    'Once Daily': '🔁',
    'Twice Daily': '🔁🔁',
    'Every 6 Hours': '⏲️',
    'Every 8 Hours': '⏰',
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <ActivityIndicator size="large" color="#007aff" />
        <Text style={{ marginTop: 20, fontSize: 16 }}>Authenticating...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.greetingContainer, { opacity: greetingOpacity }]}>
        <Text style={styles.greetingText}>{greeting}</Text>
        <Text style={styles.quoteText}>{motivationalQuotes[quoteIndex]}</Text>
      </Animated.View>

      <Text style={styles.title}>🧠 Today's Medicines</Text>

      <View style={styles.progressContainer}>
        <AnimatedCircularProgress
          size={160}
          width={20}
          fill={progress}
          tintColor="#4cd964"
          backgroundColor="#dcdcdc"
          duration={800}
        >
          {() => <Text style={styles.progressText}>{Math.round(progress)}%</Text>}
        </AnimatedCircularProgress>
        <Text style={styles.statusText}>{takenCount} of {total} taken</Text>
      </View>

      <FlatList
        data={todayMedicines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onLongPress={() => deleteMedicineFromList(item.id)}
            activeOpacity={0.8}
          >
            <View style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.text}>{typeIcons[item.type] || '📦'} {item.name}</Text>
                <Text style={styles.dosageText}>🧪 {item.dosage}</Text>
                <Text style={styles.time}>⏰ {item.time}</Text>
                <Text style={styles.frequency}>{frequencyIcons[item.frequency] || '🔁'} {item.frequency}</Text>
              </View>
              <Switch
                value={item.taken}
                onValueChange={() => toggleMedicineTaken(item.id)}
                thumbColor={item.taken ? '#34C759' : '#f4f3f4'}
                trackColor={{ false: '#bbb', true: '#aaf' }}
              />
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addText}>➕ Add Medicine</Text>
      </TouchableOpacity>

      {/* Scrollable Add Medicine Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.modalContainer}>
            <View style={styles.modal}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Add New Medicine</Text>

                <TextInput
                  placeholder="Medicine Name"
                  value={medicineName}
                  onChangeText={setMedicineName}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Dosage (mg)"
                  value={dosage}
                  onChangeText={setDosage}
                  keyboardType="numeric"
                  style={styles.input}
                />

                <Text style={styles.inputLabel}>Type</Text>
                <RNPickerSelect
                  onValueChange={(value) => setType(value)}
                  value={type}
                  items={[
                    { label: '💊 Tablet', value: 'Tablet' },
                    { label: '🧴 Syrup', value: 'Syrup' },
                    { label: '💉 Injection', value: 'Injection' },
                    { label: '💊 Capsule', value: 'Capsule' },
                  ]}
                  style={{ inputAndroid: styles.picker, inputIOS: styles.picker }}
                />

                <Text style={styles.inputLabel}>Frequency</Text>
                <RNPickerSelect
                  onValueChange={(value) => setSelectedFrequency(value)}
                  value={selectedFrequency}
                  items={[
                    { label: 'Once Daily', value: 'Once Daily' },
                    { label: 'Twice Daily', value: 'Twice Daily' },
                    { label: 'Every 6 Hours', value: 'Every 6 Hours' },
                    { label: 'Every 8 Hours', value: 'Every 8 Hours' },
                  ]}
                  style={{ inputAndroid: styles.picker, inputIOS: styles.picker }}
                />

                <Text style={styles.inputLabel}>Time</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.timeButton}>
                  <Text style={styles.timeText}>
                    {selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>

                {showTimePicker && (
                  <DateTimePicker
                    value={selectedTime}
                    mode="time"
                    display="default"
                    onChange={(event, selected) => {
                      setShowTimePicker(false);
                      if (selected) setSelectedTime(selected);
                    }}
                  />
                )}

                <Text style={styles.inputLabel}>Start Date</Text>
                <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.timeButton}>
                  <Text style={styles.timeText}>{formatDateString(selectedStartDate)}</Text>
                </TouchableOpacity>

                {showStartDatePicker && (
                  <DateTimePicker
                    value={selectedStartDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowStartDatePicker(false);
                      if (selectedDate) setSelectedStartDate(selectedDate);
                    }}
                  />
                )}

                <View style={styles.buttonRow}>
                  <Button title="Save" onPress={addMedicine} color="#4cd964" />
                  <Button title="Cancel" onPress={() => setModalVisible(false)} color="#ff3b30" />
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default HomeScreen;


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fefefe', paddingTop: 60, paddingHorizontal: 20 },
  authContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  greetingContainer: { marginBottom: 10, alignItems: 'center' },
  greetingText: { fontSize: 24, fontWeight: 'bold', color: '#222' },
  quoteText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 4, fontStyle: 'italic' },
  title: { fontSize: 22, fontWeight: 'bold', marginVertical: 12, color: '#333' },
  progressContainer: { alignItems: 'center', marginBottom: 20 },
  progressText: { fontSize: 30, fontWeight: 'bold', color: '#444' },
  statusText: { fontSize: 16, marginTop: 8, color: '#555' },
  item: { backgroundColor: '#eef6ff', padding: 16, marginVertical: 8, borderRadius: 12, elevation: 2 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  text: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  dosageText: { fontSize: 16, color: '#555', marginTop: 4 },
  time: { fontSize: 14, color: '#444', marginTop: 4 },
  frequency: { fontSize: 14, color: '#444', marginTop: 4 },
  addButton: { backgroundColor: '#007aff', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  addText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  modal: { backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 16, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: { borderBottomWidth: 1, borderColor: '#ccc', marginBottom: 12, paddingVertical: 8 },
  inputLabel: { fontSize: 16, fontWeight: '600', marginTop: 10 },
  picker: { fontSize: 16, paddingVertical: 10, color: '#333', backgroundColor: '#f0f0f0', borderRadius: 8, paddingHorizontal: 10, marginBottom: 12 },
  timeButton: { backgroundColor: '#eee', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 12 },
  timeText: { fontSize: 16, color: '#333' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
});
