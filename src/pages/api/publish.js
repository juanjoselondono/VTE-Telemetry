// src/pages/api/publish.js

// IMPORTACIÓN CORREGIDA: Importamos tanto el cliente como la promesa
import { mqttClient, connectionPromise } from '../../lib/mqttClient';

// --- Función Auxiliar para Promisificar la Publicación ---
/**
 * Envuelve el método mqttClient.publish basado en callback en una promesa.
 */
function publishMessage(client, topic, message) {
  return new Promise((resolve, reject) => {
    const options = { 
      qos: 1, 
      retain: false 
    };

    client.publish(topic,JSON.stringify(message), options, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(); 
    });
  });
}

// --- Handler Principal de la API Route ---
export default async function handler(req, res) {
  // 1. Manejo de Método HTTP no permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido. Solo se acepta POST.' });
  }

  const { topic, message } = req.body;

  // --- NUEVO: ESPERAR CONEXIÓN INICIAL ---
  try {
      // Espera a que la promesa se resuelva (conexión exitosa).
      // Si la promesa se rechaza (ej. por "Not Authorized" al inicio), el catch lo maneja.
      await connectionPromise;
  } catch (error) {
      console.error('Error al establecer la conexión MQTT:', error);
      // Si la conexión inicial falla, devolvemos un 503 inmediatamente.
      return res.status(503).json({ 
          message: 'Servicio MQTT no disponible. Fallo al conectar con el broker.',
          error: error.message
      });
  }
  // --- FIN DE ESPERA ---


  // 2. Validación de Conexión y Parámetros
  // Este chequeo solo es necesario si la conexión se pierde *después* de la conexión inicial.
  if (!mqttClient || !mqttClient.connected) {
    // Esto solo debería ocurrir si el broker se desconecta después de la primera conexión exitosa.
    return res.status(503).json({ message: 'Servicio MQTT no disponible (Conexión perdida).'});
  }

  if (!topic || !message) {
    return res.status(400).json({ message: 'Faltan parámetros: se requieren "topic" y "message" en el cuerpo de la solicitud.' });
  }

  // 3. Intentar Publicación
  try {
    await publishMessage(mqttClient, topic, message);
    
    // Éxito: Enviar respuesta HTTP 200
    return res.status(200).json({ 
      message: `Mensaje publicado correctamente en el tema: ${topic}`,
      payload: message 
    });

  } catch (err) {
    // Error: Si la publicación falla (ej. error de QoS o red después de la conexión)
    console.error('Error al publicar mensaje MQTT:', err);
    return res.status(500).json({ 
      message: 'Fallo interno al publicar el mensaje MQTT.', 
      error: err.message 
    });
  }
}