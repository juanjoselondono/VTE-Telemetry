import { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';

const useSensorData = (identifier) => {
  const { lastMessage, isConnected } = useSocket();
  const [value, setValue] = useState(null);
  const [timestamp, setTimestamp] = useState(null);

  useEffect(() => {
    if (!lastMessage) return;
    console.log('📩 Mensaje recibido:', lastMessage);

    if (Object.keys(lastMessage).includes(identifier)) {
      const newValue = lastMessage[identifier];
      const newTimestamp = lastMessage.timestamp || Date.now();

      setValue(newValue);
      setTimestamp(newTimestamp);

      console.log(`[Sensor ${identifier}] Data recibida:`, newValue);
    }
  }, [lastMessage, identifier]);

  return { timestamp, value, isConnected };
};

export default useSensorData;
