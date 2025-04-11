import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert 
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; 
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { addEvent } from '../utils/events';
import { getCurrentUser } from '../utils/auth';

const AddEventScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('personal');
  const [participants, setParticipants] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Por favor ingresa un título para el evento');
      return;
    }

    const user = await getCurrentUser();
    if (!user) {
      navigation.navigate('Login');
      return;
    }

    // Combinar fecha y hora
    const eventDate = new Date(date);
    eventDate.setHours(time.getHours());
    eventDate.setMinutes(time.getMinutes());

    const newEvent = {
      title,
      category,
      participants: participants.trim(),
      date: eventDate.toISOString(),
    };

    await addEvent(user.id, newEvent);
    navigation.goBack();
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Título del evento"
        value={title}
        onChangeText={setTitle}
      />
      
      <Text style={styles.label}>Categoría:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Personal" value="personal" />
          <Picker.Item label="Trabajo" value="work" />
          <Picker.Item label="Estudio" value="study" />
          <Picker.Item label="Reunión" value="meeting" />
          <Picker.Item label="Otro" value="other" />
        </Picker>
      </View>
      
      <TextInput
        style={styles.input}
        placeholder="Participantes (opcional)"
        value={participants}
        onChangeText={setParticipants}
      />
      
      <Text style={styles.label}>Fecha:</Text>
      <TouchableOpacity 
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text>{date.toLocaleDateString('es-ES')}</Text>
        <Ionicons name="calendar" size={20} color="#666" />
      </TouchableOpacity>
      
      <Text style={styles.label}>Hora:</Text>
      <TouchableOpacity 
        style={styles.dateButton}
        onPress={() => setShowTimePicker(true)}
      >
        <Text>{time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</Text>
        <Ionicons name="time" size={20} color="#666" />
      </TouchableOpacity>
      
      {(showDatePicker || showTimePicker) && (
        <DateTimePicker
          value={showDatePicker ? date : time}
          mode={showDatePicker ? 'date' : 'time'}
          display="default"
          onChange={showDatePicker ? onDateChange : onTimeChange}
        />
      )}
      
      <TouchableOpacity 
        style={styles.saveButton}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>Guardar Evento</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  pickerContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddEventScreen;