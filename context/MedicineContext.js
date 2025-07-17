import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MedicineContext = createContext();

export const MedicineProvider = ({ children }) => {
  const [medicines, setMedicines] = useState([]);

  // Load medicines from AsyncStorage on app startup
  useEffect(() => {
    const loadMedicines = async () => {
      try {
        const storedMedicines = await AsyncStorage.getItem('medicines');
        if (storedMedicines) {
          setMedicines(JSON.parse(storedMedicines));
        }
      } catch (error) {
        console.error('Failed to load medicines:', error);
      }
    };

    loadMedicines();
  }, []);

  // Save medicines to AsyncStorage whenever they change
  useEffect(() => {
    AsyncStorage.setItem('medicines', JSON.stringify(medicines));
  }, [medicines]);

  // Add a new medicine
  const addMedicineToList = (medicine) => {
    const withDefaults = {
      ...medicine,
      taken: false,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setMedicines((prev) => [...prev, withDefaults]);
  };

  // Toggle the "taken" status of a medicine
  const toggleMedicineTaken = (id) => {
    setMedicines((prev) =>
      prev.map((med) =>
        med.id === id ? { ...med, taken: !med.taken } : med
      )
    );
  };

  // Delete a medicine from the list
  const deleteMedicineFromList = (id) => {
    setMedicines((prev) => prev.filter((med) => med.id !== id));
  };

  // Clear all medicines (used for clearing history)
  const clearMedicineHistory = () => {
    setMedicines([]);
  };

  return (
    <MedicineContext.Provider
      value={{
        medicines,
        setMedicines,
        addMedicineToList,
        toggleMedicineTaken,
        deleteMedicineFromList,
        clearMedicineHistory,
      }}
    >
      {children}
    </MedicineContext.Provider>
  );
};

// Hook for consuming the context
export const useMedicines = () => useContext(MedicineContext);
