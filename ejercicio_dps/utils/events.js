import AsyncStorage from '@react-native-async-storage/async-storage';

// Guardar eventos de un usuario
export const saveEvents = async (userId, events) => {
  try {
    await AsyncStorage.setItem(`events_${userId}`, JSON.stringify(events));
  } catch (error) {
    console.error('Error al guardar eventos:', error);
  }
};

// Cargar eventos de un usuario
export const loadEvents = async (userId) => {
  try {
    const events = await AsyncStorage.getItem(`events_${userId}`);
    return events ? JSON.parse(events) : [];
  } catch (error) {
    console.error('Error al cargar eventos:', error);
    return [];
  }
};

// Agregar nuevo evento
export const addEvent = async (userId, newEvent) => {
  try {
    const events = await loadEvents(userId);
    events.push({ ...newEvent, id: Date.now().toString() });
    await saveEvents(userId, events);
    return events;
  } catch (error) {
    console.error('Error al agregar evento:', error);
    return [];
  }
};

// Actualizar evento existente
export const updateEvent = async (userId, eventId, updatedEvent) => {
  try {
    let events = await loadEvents(userId);
    events = events.map(event => 
      event.id === eventId ? { ...updatedEvent, id: eventId } : event
    );
    await saveEvents(userId, events);
    return events;
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    return [];
  }
};

// Eliminar evento
export const deleteEvent = async (userId, eventId) => {
  try {
    let events = await loadEvents(userId);
    events = events.filter(event => event.id !== eventId);
    await saveEvents(userId, events);
    return events;
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    return [];
  }
};