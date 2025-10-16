// src/components/RealTimeData.js

import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Configura la conexión al WebSocket de Next.js
const socket = io({
    path: '/api/sockets',
    autoConnect: false // No conectar automáticamente
});

const RealTimeData = () => {
    // Estado para guardar el último dato recibido
    const [lastMessage, setLastMessage] = useState(null);
    // Estado para saber si Socket.IO está conectado
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Conectar al socket
        socket.connect();
        
        // Manejadores de Eventos del Socket
        const onConnect = () => {
            setIsConnected(true);
            console.log('Frontend conectado al Socket.IO Server.');
        };

        const onDisconnect = () => {
            setIsConnected(false);
            console.log('Frontend desconectado del Socket.IO Server.');
        };
        
        // Manejador del evento 'mqtt_data' que viene del backend
        const onMqttData = (data) => {
            console.log('Datos en tiempo real recibidos:', data);
            setLastMessage(data); // Actualiza el estado con el nuevo mensaje
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('mqtt_data', onMqttData);

        // Limpieza: Desconectar y remover listeners al desmontar el componente
        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('mqtt_data', onMqttData);
            socket.disconnect();
        };
    }, []);

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Datos de MQTT en Tiempo Real</h2>
            <p>Estado de la Conexión: 
                <strong style={{ color: isConnected ? 'green' : 'red' }}>
                    {isConnected ? ' CONECTADO' : ' DESCONECTADO'}
                </strong>
            </p>

            {lastMessage ? (
                <div>
                    <p><strong>Último Tema:</strong> {lastMessage.topic}</p>
                    <p><strong>Último Valor:</strong> <span style={{ fontSize: '24px', color: '#0070f3' }}>{lastMessage.message}</span></p>
                    <p><strong>Hora:</strong> {new Date(lastMessage.timestamp).toLocaleTimeString()}</p>
                </div>
            ) : (
                <p>Esperando datos...</p>
            )}
        </div>
    );
};

export default RealTimeData;