import AsyncStorage from '@react-native-async-storage/async-storage';

// Lista de usuarios predefinidos
const predefinedUsers = [
  {
    id: '1',
    username: 'juanperez',
    email: 'juanperez@gmail.com',
    password: 'juan12345'
  },
  {
    id: '2',
    username: 'davidisaac',
    email: 'davidisaac@gmail.com',
    password: 'dvd1234'
  },
  {
    id: '3',
    username: 'bryanwill',
    email: 'bryanwill@gmail.com',
    password: 'bryan2345'
  }
];

// Inicializar los usuarios en AsyncStorage
const initializeUsers = async () => {
  try {
    const existingUsers = await AsyncStorage.getItem('users');
    if (!existingUsers) {
      await AsyncStorage.setItem('users', JSON.stringify(predefinedUsers));
    }
  } catch (error) {
    console.error('Error inicializando usuarios:', error);
  }
};

// Registrar nuevo usuario
export const registerUser = async (newUser) => {
  try {
    await initializeUsers();
    const usersString = await AsyncStorage.getItem('users');
    const users = usersString ? JSON.parse(usersString) : [];
    
    // Verificar si el email ya existe
    const emailExists = users.some(user => user.email === newUser.email);
    if (emailExists) {
      throw new Error('El correo electrónico ya está registrado');
    }
    
    // Verificar si el username ya existe
    const usernameExists = users.some(user => user.username === newUser.username);
    if (usernameExists) {
      throw new Error('El nombre de usuario ya está en uso');
    }
    
    // Agregar el nuevo usuario
    users.push(newUser);
    await AsyncStorage.setItem('users', JSON.stringify(users));
    return true;
  } catch (error) {
    console.error('Error registrando usuario:', error);
    throw error;
  }
};

// Iniciar sesión
export const loginUser = async (email, password) => {
  try {
    await initializeUsers();
    const usersString = await AsyncStorage.getItem('users');
    const users = usersString ? JSON.parse(usersString) : [];
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    } else {
      throw new Error('Credenciales incorrectas');
    }
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

// Obtener usuario actual
export const getCurrentUser = async () => {
  try {
    const userString = await AsyncStorage.getItem('currentUser');
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error('Error obteniendo usuario actual:', error);
    return null;
  }
};

// Cerrar sesión
export const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem('currentUser');
  } catch (error) {
    console.error('Error cerrando sesión:', error);
  }
};