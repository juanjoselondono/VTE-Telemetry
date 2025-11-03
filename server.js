// server.js
require('dotenv').config({ path: '.env.local' });
const next = require('next');
const http = require('http');
const { Server } = require('socket.io');
const mqtt = require('mqtt');
const { admin, db } = require('./lib/firebaseAdmin'); // Firebase Admin

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const MQTT_BROKER = process.env.MQTT_BROKER_URL;
const MQTT_USER = process.env.MQTT_USER;
const MQTT_PASS = process.env.MQTT_PASSWORD;
const MQTT_TOPIC = process.env.SUBSCRIPTION_TOPIC;

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

  // Nota: incluimos 'packet' para metadatos del mensaje MQTT
  mqttClient.on('message', (topic, message, packet) => {
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

    // --- Guardar en Firestore (sin deviceId, colección plana 'telemetry') ---
    const identifier =
      (typeof payload === 'object' && payload?.identifier) ||
      topic.split('/').slice(-1)[0];

    const docData = {
      payload: typeof payload === 'object' ? payload : null,
      receivedAt: admin.firestore.Timestamp.now(),
      deviceTimestamp:
        (typeof payload === 'object' && payload?.timestamp)
          ? new Date(payload.timestamp)
          : null,
    };

    // Una doc por mensaje en la colección 'telemetry'
    db.collection('telemetry')
      .add(docData)
      .catch((err) => {
        console.error('❌ Error guardando en Firestore:', err);
      });

    // Si quieres evitar posibles duplicados QoS1, considera usar .doc(<id determinístico>).set(...)
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