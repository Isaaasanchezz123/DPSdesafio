import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { updateEvent, loadEvents } from '../utils/events';
import { getCurrentUser } from '../utils/auth';

const EditEventScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('personal');
  const [participants, setParticipants] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      const user = await getCurrentUser();
      if (!user) {
        navigation.navigate('Login');
        return;
      }

      const events = await loadEvents(user.id);
      const eventToEdit = events.find(event => event.id === eventId);
      
      if (eventToEdit) {
        setTitle(eventToEdit.title);
        setCategory(eventToEdit.category);
        setParticipants(eventToEdit.participants || '');
        
        const eventDate = new Date(eventToEdit.date);
        setDate(eventDate);
        setTime(eventDate);
      }
      
      setLoading(false);
    };
    
    fetchEvent();
  }, [eventId, navigation]);

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

    const updatedEvent = {
      title,
      category,
      participants: participants.trim(),
      date: eventDate.toISOString(),
    };

    await updateEvent(user.id, eventId, updatedEvent);
    navigation.goBack();
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de que quieres eliminar este evento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            const user = await getCurrentUser();
            if (user) {
              await deleteEvent(user.id, eventId);
              navigation.goBack();
            }
          }
        }
      ]
    );
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

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

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
          style={styles.picker}
          onValueChange={(itemValue) => setCategory(itemValue)}
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
      </TouchableOpacity>
      
      <Text style={styles.label}>Hora:</Text>
      <TouchableOpacity 
        style={styles.dateButton}
        onPress={() => setShowTimePicker(true)}
      >
        <Text>{time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</Text>
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
        <Text style={styles.saveButtonText}>Guardar Cambios</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={handleDelete}
      >
        <Text style={styles.deleteButtonText}>Eliminar Evento</Text>
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
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    justifyContent: 'center',
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
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditEventScreen;