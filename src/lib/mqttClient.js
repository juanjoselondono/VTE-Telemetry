// src/lib/mqttClient.js

import mqtt from 'mqtt';

// ***********************************************
// ⚠️ CONFIGURACIÓN CLAVE
// ***********************************************
const MQTT_BROKER_URL = 'mqtt://18.219.125.138:1883'; 
const MQTT_USER = 'VTEprueba'; 
const MQTT_PASSWORD = '1234'; 
const SUBSCRIPTION_TOPIC = 'sensor/data';
// ***********************************************

let mqttClient = null;
let connectionPromise = null;

// --- Lógica de Inicialización Singleton ---
if (!mqttClient) {
    connectionPromise = new Promise((resolve, reject) => {
        // --- Opciones de Conexión ---
        const options = {
            username: MQTT_USER,
            password: MQTT_PASSWORD,
            // Aseguramos un ID único para evitar que el broker cierre otras sesiones
            clientId: 'nextjs_backend_' + Math.random().toString(16).substr(2, 8),
            keepalive: 60, // Tiempo en segundos para PING
            reconnectPeriod: 1000 // Tiempo en ms para intentar reconectar
        };

        // 1. Conectar al broker
        mqttClient = mqtt.connect(MQTT_BROKER_URL, options); 

        // 2. Manejo del evento de CONEXIÓN EXITOSA
        mqttClient.on('connect', () => {
            console.log('✅ Cliente MQTT conectado al broker');
            
            mqttClient.subscribe(SUBSCRIPTION_TOPIC, { qos: 1 }, (err) => {
                if (err) {
                    console.error('❌ Error al suscribirse:', err);
                } else {
                    console.log(`Suscrito a tema: ${SUBSCRIPTION_TOPIC}`);
                }
            });
            
            // Resolvemos la promesa para desbloquear las API Routes que están en "await connectionPromise"
            resolve(mqttClient); 
        });

        // 3. Manejo de ERRORES
        mqttClient.on('error', (error) => {
            console.error('❌ Error de conexión MQTT:', error);
            // Rechazamos la promesa solo si es un error fatal de inicio (como "Not Authorized")
            // Después del inicio, el cliente intenta reconectar automáticamente
            if (mqttClient && !mqttClient.connected) {
                // Si la promesa aún no se ha resuelto, la rechazamos
                // Esto permite que el try/catch en publish.js lo capture en el primer intento.
                reject(error);
            }
        });

        // 4. Manejo de MENSAJES RECIBIDOS (datos entrantes)
        mqttClient.on('message', (topic, message) => {
            console.log(`[MQTT RECIBIDO] Tema: ${topic.toString()}, Payload: ${message.toString()}`);
        });

        // 5. Manejo de CIERRE de conexión
        mqttClient.on('close', () => {
            // El cliente intentará reconectar automáticamente
            console.log('⚠️ Conexión MQTT cerrada. Reconexión en curso...');
        });
    });
}
// --- Fin de Inicialización Singleton ---


// Exportamos el cliente y la promesa para que la API Route los utilice.
export { mqttClient, connectionPromise };

// NOTA: No necesitamos la bandera 'isConnected' si usamos 'mqttClient.connected' 
// y la lógica de la promesa para el primer chequeo.