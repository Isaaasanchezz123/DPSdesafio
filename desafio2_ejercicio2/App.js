import React, { useState, useEffect, useCallback } from 'react';
import { Video } from 'expo-av';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, Modal, Linking, ScrollView } from 'react-native';
import { MaterialIcons, FontAwesome, Feather, Ionicons, Entypo } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, useNavigation, useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';

// Configuración inicial
const entriesDirectory = `${FileSystem.documentDirectory}bitacora/`;

async function ensureDirExists() {
  const dirInfo = await FileSystem.getInfoAsync(entriesDirectory);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(entriesDirectory, { intermediates: true });
  }
}

// ==================== PANTALLA DE FOTOGRAFÍA ====================
const FotografiaScreen = () => {
  const navigation = useNavigation();
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState(null);
  const [note, setNote] = useState('');
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    (async () => {
      await ensureDirExists();
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permiso de ubicación denegado');
      }
    })();
  }, []);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Necesitamos acceso a la cámara</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Conceder permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef) {
      try {
        const photo = await cameraRef.takePictureAsync();
        try {
          const currentLocation = await Location.getCurrentPositionAsync({});
          setLocation(currentLocation.coords);
          setLocationError(null);
        } catch (error) {
          setLocationError('No se pudo obtener la ubicación');
        }
        setCapturedMedia({ uri: photo.uri, type: 'photo' });
        setPreviewVisible(true);
      } catch (error) {
        console.error('Error al tomar foto:', error);
      }
    }
  };

  const saveEntry = async () => {
    if (!capturedMedia) return;

    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}.jpg`;
      const filePath = `${entriesDirectory}${fileName}`;

      await FileSystem.moveAsync({ from: capturedMedia.uri, to: filePath });

      const entry = {
        id: timestamp.toString(),
        uri: filePath,
        type: 'photo',
        note: note,
        location: location,
        date: new Date().toISOString(),
      };

      const entriesJson = await FileSystem.readAsStringAsync(`${entriesDirectory}entries.json`).catch(() => '[]');
      const entries = JSON.parse(entriesJson);
      entries.push(entry);
      await FileSystem.writeAsStringAsync(`${entriesDirectory}entries.json`, JSON.stringify(entries));

      setPreviewVisible(false);
      setCapturedMedia(null);
      setNote('');
      navigation.navigate('Multimedia');
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  return (
    <View style={styles.cameraContainer}>
      {previewVisible ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedMedia.uri }} style={styles.previewImage} />
          <TextInput
            style={styles.noteInput}
            placeholder="Añade una anotación..."
            value={note}
            onChangeText={setNote}
            multiline
          />
          
          {location && (
            <View style={styles.locationPreview}>
              <MaterialIcons name="location-on" size={20} color="#4a8cff" />
              <Text style={styles.locationPreviewText}>
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            </View>
          )}
          
          {locationError && <Text style={styles.locationError}>{locationError}</Text>}
          
          <View style={styles.previewButtons}>
            <TouchableOpacity style={styles.discardButton} onPress={() => setPreviewVisible(false)}>
              <Feather name="x" size={24} color="white" />
              <Text style={styles.buttonText}>Descartar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={saveEntry}>
              <Feather name="check" size={24} color="white" />
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <CameraView style={styles.camera} facing={facing} ref={setCameraRef}>
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.flipButton} onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}>
              <Ionicons name="camera-reverse" size={32} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <FontAwesome name="camera" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
    </View>
  );
};

// ==================== PANTALLA DE VIDEO ====================
const VideoScreen = () => {
  const navigation = useNavigation();
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState(null);
  const [note, setNote] = useState('');
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    (async () => {
      await ensureDirExists();
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permiso de ubicación denegado');
      }
    })();
  }, []);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Necesitamos acceso a la cámara</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Conceder permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const startRecording = async () => {
    if (cameraRef && !isRecording) {
      setIsRecording(true);
      try {
        const video = await cameraRef.startRecording();
        setCapturedMedia({ uri: video.uri, type: 'video' });
      } catch (error) {
        setIsRecording(false);
        console.error('Error al grabar video:', error);
      }
    }
  };

  const stopRecording = async () => {
    if (cameraRef && isRecording) {
      try {
        await cameraRef.stopRecording();
        setIsRecording(false);
        try {
          const currentLocation = await Location.getCurrentPositionAsync({});
          setLocation(currentLocation.coords);
          setLocationError(null);
        } catch (error) {
          setLocationError('No se pudo obtener la ubicación');
        }
        setPreviewVisible(true);
      } catch (error) {
        setIsRecording(false);
        console.error('Error al detener grabación:', error);
      }
    }
  };

  const saveEntry = async () => {
    if (!capturedMedia) return;

    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}.mp4`;
      const filePath = `${entriesDirectory}${fileName}`;

      await FileSystem.moveAsync({ from: capturedMedia.uri, to: filePath });

      const entry = {
        id: timestamp.toString(),
        uri: filePath,
        type: 'video',
        note: note,
        location: location,
        date: new Date().toISOString(),
      };

      const entriesJson = await FileSystem.readAsStringAsync(`${entriesDirectory}entries.json`).catch(() => '[]');
      const entries = JSON.parse(entriesJson);
      entries.push(entry);
      await FileSystem.writeAsStringAsync(`${entriesDirectory}entries.json`, JSON.stringify(entries));

      setPreviewVisible(false);
      setCapturedMedia(null);
      setNote('');
      navigation.navigate('Multimedia');
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  return (
    <View style={styles.cameraContainer}>
      {previewVisible ? (
        <View style={styles.previewContainer}>
          <Video
            source={{ uri: capturedMedia.uri }}
            style={styles.previewImage}
            resizeMode="cover"
            shouldPlay
            isLooping
          />
          <TextInput
            style={styles.noteInput}
            placeholder="Añade una anotación..."
            value={note}
            onChangeText={setNote}
            multiline
          />
          
          {location && (
            <View style={styles.locationPreview}>
              <MaterialIcons name="location-on" size={20} color="#4a8cff" />
              <Text style={styles.locationPreviewText}>
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            </View>
          )}
          
          {locationError && <Text style={styles.locationError}>{locationError}</Text>}
          
          <View style={styles.previewButtons}>
            <TouchableOpacity style={styles.discardButton} onPress={() => setPreviewVisible(false)}>
              <Feather name="x" size={24} color="white" />
              <Text style={styles.buttonText}>Descartar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={saveEntry}>
              <Feather name="check" size={24} color="white" />
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <CameraView style={styles.camera} facing={facing} ref={setCameraRef}>
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.flipButton} onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}>
              <Ionicons name="camera-reverse" size={32} color="white" />
            </TouchableOpacity>
            
            {isRecording ? (
              <TouchableOpacity style={styles.recordingButton} onPress={stopRecording}>
                <View style={styles.recordingIndicator} />
                <Text style={styles.recordingText}>Detener</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.captureButton} onPress={startRecording}>
                <FontAwesome name="video-camera" size={28} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </CameraView>
      )}
    </View>
  );
};

// ==================== PANTALLA DE MULTIMEDIA ====================
const MultimediaScreen = () => {
  const navigation = useNavigation();
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      const loadEntries = async () => {
        try {
          const entriesJson = await FileSystem.readAsStringAsync(`${entriesDirectory}entries.json`).catch(() => '[]');
          setEntries(JSON.parse(entriesJson).reverse());
        } catch (error) {
          console.error('Error al cargar entradas:', error);
        }
      };
      
      loadEntries();
    }, [])
  );

  const filteredEntries = entries.filter(entry => {
    if (activeFilter === 'photos') return entry.type === 'photo';
    if (activeFilter === 'videos') return entry.type === 'video';
    if (searchQuery && !entry.note?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const deleteEntry = async (id) => {
    try {
      const entryToDelete = entries.find(entry => entry.id === id);
      await FileSystem.deleteAsync(entryToDelete.uri);
      const updatedEntries = entries.filter(entry => entry.id !== id);
      await FileSystem.writeAsStringAsync(`${entriesDirectory}entries.json`, JSON.stringify(updatedEntries));
      setEntries(updatedEntries);
      setSelectedEntry(null);
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  return (
    <View style={styles.bitacoraContainer}>
      <View style={styles.bitacoraHeader}>
        <Text style={styles.bitacoraTitle}>Multimedia</Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar en anotaciones..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === 'all' && styles.activeFilter]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>Todo</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === 'photos' && styles.activeFilter]}
            onPress={() => setActiveFilter('photos')}
          >
            <MaterialIcons name="photo-camera" size={18} color={activeFilter === 'photos' ? 'white' : '#4a8cff'} />
            <Text style={[styles.filterText, activeFilter === 'photos' && styles.activeFilterText]}>Fotos</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === 'videos' && styles.activeFilter]}
            onPress={() => setActiveFilter('videos')}
          >
            <FontAwesome name="video-camera" size={16} color={activeFilter === 'videos' ? 'white' : '#4a8cff'} />
            <Text style={[styles.filterText, activeFilter === 'videos' && styles.activeFilterText]}>Videos</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {filteredEntries.length === 0 ? (
        <View style={styles.emptyState}>
          <Entypo name="images" size={50} color="#ddd" />
          <Text style={styles.emptyText}>No hay registros multimedia</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEntries}
          numColumns={2}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.mediaGrid}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.mediaItem} onPress={() => setSelectedEntry(item)}>
              {item.type === 'photo' ? (
                <Image source={{ uri: item.uri }} style={styles.mediaImage} />
              ) : (
                <View style={styles.videoContainer}>
                  <Video
                    source={{ uri: item.uri }}
                    style={styles.mediaImage}
                    resizeMode="cover"
                    shouldPlay={false}
                    isMuted={true}
                  />
                  <MaterialIcons name="play-circle-filled" size={40} color="white" style={styles.playIcon} />
                </View>
              )}
              
              <View style={styles.mediaNoteContainer}>
                <Text style={styles.mediaNote} numberOfLines={2}>{item.note}</Text>
              </View>
              
              <View style={styles.mediaFooter}>
                <Text style={styles.mediaDate}>
                  {new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </Text>
                {item.location && <MaterialIcons name="location-on" size={16} color="#4a8cff" />}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal visible={!!selectedEntry} animationType="slide">
        {selectedEntry && (
          <View style={styles.detailContainer}>
            {selectedEntry.type === 'photo' ? (
              <Image source={{ uri: selectedEntry.uri }} style={styles.detailImage} />
            ) : (
              <Video
                source={{ uri: selectedEntry.uri }}
                style={styles.detailImage}
                useNativeControls
                resizeMode="contain"
                shouldPlay
              />
            )}
            
            <ScrollView style={styles.detailContent}>
              <Text style={styles.detailDate}>
                {new Date(selectedEntry.date).toLocaleString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
              
              {selectedEntry.note && <Text style={styles.detailNote}>{selectedEntry.note}</Text>}
              
              {selectedEntry.location && (
                <TouchableOpacity 
                  style={styles.locationButton}
                  onPress={() => Linking.openURL(`https://www.google.com/maps?q=${selectedEntry.location.latitude},${selectedEntry.location.longitude}`)}
                >
                  <MaterialIcons name="open-in-new" size={20} color="#4a8cff" />
                  <Text style={styles.locationText}>Abrir en Google Maps</Text>
                </TouchableOpacity>
              )}
              
              <View style={styles.detailButtons}>
                <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedEntry(null)}>
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => deleteEntry(selectedEntry.id)}>
                  <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
};

// ==================== PANTALLA DE LISTA DE ARCHIVOS ====================
const ListaArchivosScreen = () => {
  const navigation = useNavigation();
  const [entries, setEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      const loadEntries = async () => {
        try {
          const entriesJson = await FileSystem.readAsStringAsync(`${entriesDirectory}entries.json`).catch(() => '[]');
          setEntries(JSON.parse(entriesJson).reverse());
        } catch (error) {
          console.error('Error al cargar entradas:', error);
        }
      };
      
      loadEntries();
    }, [])
  );

  const filteredEntries = entries.filter(entry => 
    entry.note?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.listContainer}>
      <Text style={styles.listTitle}>Lista de Archivos</Text>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar archivos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
      </View>

      {filteredEntries.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="file-text" size={50} color="#ddd" />
          <Text style={styles.emptyText}>No hay archivos registrados</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEntries}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.noteItem}>
              <Text style={styles.noteText}>{item.note}</Text>
              <Text style={styles.noteDate}>
                {new Date(item.date).toLocaleString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
              {item.location && (
                <TouchableOpacity 
                  style={styles.noteLocation}
                  onPress={() => Linking.openURL(`https://www.google.com/maps?q=13.8333,-88.9167`)}
                >
                  <MaterialIcons name="location-on" size={16} color="#4a8cff" />
                  <Text style={styles.noteLocationText}>Ver ubicación</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
};

// ==================== NAVEGACIÓN PRINCIPAL app ====================
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#4a8cff',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            height: 70,
            paddingBottom: 10,
            paddingTop: 5,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            marginBottom: 5,
          },
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="Fotografía" 
          component={FotografiaScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="camera" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="Video" 
          component={VideoScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="video-camera" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="Multimedia" 
          component={MultimediaScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="photo-library" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="Archivos" 
          component={ListaArchivosScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Feather name="list" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}


const styles = StyleSheet.create({

  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  permissionText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  permissionButton: {
    backgroundColor: '#4a8cff',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Estilos para cámara
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButton: {
    position: 'absolute',
    left: 30,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 15,
    borderRadius: 30,
  },
  captureButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    padding: 20,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'white',
  },
  recordingButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  recordingText: {
    color: 'white',
    fontWeight: 'bold',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  previewImage: {
    flex: 1,
    borderRadius: 10,
    marginBottom: 20,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  locationPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
  locationPreviewText: {
    marginLeft: 5,
    color: '#4a8cff',
    fontSize: 14,
  },
  locationError: {
    color: '#ff4444',
    marginBottom: 15,
    textAlign: 'center',
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4a8cff',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discardButton: {
    flex: 1,
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 10,
    marginLeft: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
  },


  bitacoraContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bitacoraHeader: {
    padding: 20,
    paddingBottom: 10,
  },
  bitacoraTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    paddingLeft: 40,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 14,
  },
  filterContainer: {
    paddingBottom: 5,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
  },
  activeFilter: {
    backgroundColor: '#4a8cff',
    borderColor: '#4a8cff',
  },
  filterText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  activeFilterText: {
    color: 'white',
  },
  mediaGrid: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  mediaItem: {
    flex: 1,
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
    elevation: 2,
  },
  mediaImage: {
    width: '100%',
    aspectRatio: 1,
  },
  videoContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    position: 'absolute',
  },
  mediaNoteContainer: {
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  mediaNote: {
    fontSize: 14,
    color: '#333',
  },
  mediaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    paddingTop: 5,
  },
  mediaDate: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 15,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  detailImage: {
    width: '100%',
    height: '50%',
  },
  detailContent: {
    padding: 20,
  },
  detailDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  detailNote: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    lineHeight: 24,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationText: {
    color: '#4a8cff',
    marginLeft: 5,
    fontSize: 16,
  },
  detailButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  closeButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ff4444',
    fontWeight: '600',
  },


  listContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  listTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  listContent: {
    paddingBottom: 20,
  },
  noteItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  noteText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  noteLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteLocationText: {
    color: '#4a8cff',
    fontSize: 14,
    marginLeft: 5,
  },
});
