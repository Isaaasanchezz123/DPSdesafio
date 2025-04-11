import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { loadEvents } from '../utils/events';
import { getCurrentUser, logoutUser } from '../utils/auth';
import EventCard from '../components/EventCard';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const userData = await getCurrentUser();
      if (userData) {
        setUser(userData);
        const userEvents = await loadEvents(userData.id);
        setEvents(userEvents);
      } else {
        navigation.navigate('Login');
      }
    };
    
    fetchData();
    
    const unsubscribe = navigation.addListener('focus', fetchData);
    
    return unsubscribe;
  }, [navigation]);

  const getColorByDate = (eventDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDay = new Date(eventDate);
    eventDay.setHours(0, 0, 0, 0);
    
    if (eventDay < today) return '#FF3B30'; // Rojo para eventos pasados
    if (eventDay > today) return '#007AFF'; // Azul para eventos futuros
    return '#34C759'; // Verde para eventos hoy
  };

  const handleLogout = async () => {
    await logoutUser();
    navigation.navigate('Login');
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Hola, {user.username}</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay eventos programados</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddEvent')}
          >
            <Text style={styles.addButtonText}>Agregar Evento</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={events.sort((a, b) => new Date(a.date) - new Date(b.date))}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => navigation.navigate('EditEvent', { eventId: item.id })}
            >
              <EventCard 
                event={item} 
                color={getColorByDate(item.date)}
              />
            </TouchableOpacity>
          )}
        />
      )}
      
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => navigation.navigate('AddEvent')}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});

export default HomeScreen;