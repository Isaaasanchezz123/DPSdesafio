import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EventCard = ({ event, color }) => {
  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 6 }]}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.category}>{event.category}</Text>
      {event.participants && (
        <Text style={styles.participants}>Con: {event.participants}</Text>
      )}
      <Text style={styles.date}>{formatDate(event.date)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  participants: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  date: {
    fontSize: 14,
    color: '#333',
  },
});

export default EventCard;