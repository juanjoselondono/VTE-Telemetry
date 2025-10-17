import { Server } from 'socket.io';
import { mqttClient } from '../../lib/mqttClient';

const ioHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket.IO ya está corriendo.');
    res.end();
    return;
  }

  const io = new Server(res.socket.server, {
    path: '/api/sockets',
    addTrailingSlash: false,
  });

  res.socket.server.io = io;
  console.log('Socket.IO Server inicializado.');

  // Vincular MQTT → Socket.IO (solo una vez)
  if (mqttClient && !mqttClient.__socket_io_hooked) {
    mqttClient.on('message', (topic, message) => {
      let data;

      try {
        const str = message.toString();
        data = JSON.parse(str);
      } catch {
        data = message;
      }

      // Tomar los datos del interior si vienen dentro de "message"
      const inner = data.message || data;
      const WHEEL_DIAMETER = 0.6; // en metros
      const payload = {
        rpm: inner.rpm,
        potencia: inner.potencia,
        battery: inner.battery,
        speed: parseInt((2 * Math.PI * (WHEEL_DIAMETER/2) * inner.rpm * 60) / 1000),
        timestamp: new Date().toISOString(),
      };

      io.emit('mqtt_data', payload);

      console.log('[Socket.IO] Nuevo mensaje MQTT recibido:');
      console.dir(payload, { depth: null });
    });

    mqttClient.__socket_io_hooked = true;
  }

  io.on('connection', (socket) => {
    console.log(` Cliente web conectado: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(` Cliente web desconectado: ${socket.id}`);
    });
  });

  res.end();
};

export default ioHandler;
