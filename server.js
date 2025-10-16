// server.js
const next = require('next');
const http = require('http');
const { Server } = require('socket.io');
const mqtt = require('mqtt');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Configuración MQTT
const MQTT_BROKER = 'mqtt://18.219.125.138:1883';
const MQTT_USER = 'VTEprueba';
const MQTT_PASS = '1234';
const MQTT_TOPIC = 'sensor/data';

const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  // --- Inicializamos Socket.IO ---
  const io = new Server(server, {
    path: '/api/socket',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Guardamos globalmente (por si quieres acceder desde otros módulos)
  global.io = io;

  io.on('connection', (socket) => {
    console.log('⚡ Cliente conectado:', socket.id);
    socket.on('disconnect', () => console.log('🔌 Cliente desconectado:', socket.id));
  });

  // --- Conexión MQTT persistente ---
  const mqttClient = mqtt.connect(MQTT_BROKER, {
    username: MQTT_USER,
    password: MQTT_PASS,
    clientId: 'next_server_' + Math.random().toString(16).substr(2, 8),
    reconnectPeriod: 2000,
    keepalive: 60,
  });

  mqttClient.on('connect', () => {
    console.log('✅ Conectado al broker MQTT');
    mqttClient.subscribe(MQTT_TOPIC, { qos: 1 }, (err, granted) => {
      if (err) console.error('❌ Error de suscripción:', err);
      else console.log(`📡 Suscrito al tema: ${MQTT_TOPIC}`);
    });
  });

  mqttClient.on('message', (topic, message) => {
    const raw = message.toString();
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = raw;
    }

    console.log(`[MQTT] ${topic}:`, payload);

    // Emitir por Socket.IO a todos los clientes web
    io.emit('mqtt_message', {
      topic,
      payload,
      timestamp: new Date().toISOString(),
    });
  });

  mqttClient.on('error', (err) => console.error('❌ Error MQTT:', err.message));
  mqttClient.on('close', () => console.log('⚠️ Conexión MQTT cerrada. Intentando reconectar...'));

  // --- Arrancar el servidor HTTP/Next ---
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`🚀 Servidor activo en http://localhost:${PORT}`);
    console.log('🟢 MQTT y Socket.IO corriendo persistentemente.');
  });
});
