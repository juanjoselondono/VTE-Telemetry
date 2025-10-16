// context/SocketContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';

// 1. Crear y exportar la única instancia del socket
const socket = io({
    path: '/api/sockets',
    autoConnect: false // No conectar automáticamente
});

// 2. Crear el Contexto
const SocketContext = createContext(null);

// 3. Crear el Proveedor del Contexto
export const SocketProvider = ({ children }) => {
    // Estado global para el último mensaje recibido del tópico 'telemetria'
    const [lastMessage, setLastMessage] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Conectar el socket UNA SOLA VEZ
        if (!socket.connected) {
            socket.connect();
        }

        // Manejadores de Eventos del Socket Global
        const onConnect = () => {
            setIsConnected(true);
            console.log('Socket.IO Conectado.');
        };
        const onDisconnect = () => {
            setIsConnected(false);
            console.log('Socket.IO Desconectado.');
        };

        // Manejador del Tópico Único 'telemetria'
        // ¡Importante! Este es el único listener para la data en tiempo real
        const onTelemetryData = (data) => {
            // data debe ser el JSON completo (Ej: { sensorId: 'temp01', value: 25.5, ... })
            setLastMessage(data); 

        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        // Escucha el evento del backend que corresponde al tópico 'telemetria'
        socket.on('mqtt_data', onTelemetryData); 

        // Limpieza: solo remover listeners, NO desconectar el socket
        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('mqtt_data', onTelemetryData);
            // socket.disconnect(); // ¡NO hacer esto! Mantenemos la conexión viva
        };
    }, []);

    // El contexto provee el estado y la conexión global
    return (
        <SocketContext.Provider value={{ lastMessage, isConnected, socket }}>
            {children}
        </SocketContext.Provider>
    );
};

// Hook personalizado para usar el contexto fácilmente
export const useSocket = () => useContext(SocketContext);