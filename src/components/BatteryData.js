import React from "react";
import { motion } from "framer-motion";
import useSensorData from "./hooks/useSensorData";
import { formatInTimeZone } from 'date-fns-tz';

const BatteryLevel = ({ title = "Sensor de Batería", identifier = "bateria" }) => {
  const { value, isConnected, timestamp } = useSensorData(identifier);
  const maxValue = 100;
  const unit = "%";

  // Valor seguro (en caso de desconexión o datos nulos)
  let safeValue = typeof value === "number" && !isNaN(value) ? value : 0;
  if (!isConnected) safeValue = 50;
  safeValue = Math.min(Math.max(safeValue, 0), maxValue);

  const normalizedValue = safeValue / maxValue;

  // --- Color según nivel ---
  const getColor = () => {
    if (normalizedValue < 0.2) return "#FF3B30"; // rojo
    if (normalizedValue < 0.5) return "#FFD60A"; // amarillo
    return "#CCFF00"; // verde
  };

  const color = getColor();

  // --- Segmentos del ícono de batería ---
  const segments = 5;
  const activeSegments = Math.round(normalizedValue * segments);

  const styles = {
    container: {
      flex: 1,
      backgroundColor: "#0d0d0d",
      color: "white",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      borderRadius: "12px",
    },
    title: {
      fontSize: "1.25rem",
      fontWeight: 600,
      marginBottom: "12px",
      color: "#CCFF00",
    },
    svg: {
      width: "160px",
      height: "80px",
      marginTop: "20px",
    },
    valueText: {
      fontSize: "3rem",
      fontWeight: 800,
      color,
      marginTop: "20px",
      textShadow: "0 0 2px rgba(0,0,0,0.4)",
    },
    unitText: {
      fontSize: "1.125rem",
      fontWeight: 500,
      color: "gray",
    },
    infoSection: {
      marginTop: "28px",
      textAlign: "center",
      width: "100%",
    },
    connectionStatus: {
      fontSize: "1rem",
      marginTop: "25%",
    },
    statusText: {
      fontWeight: 700,
      color: isConnected ? "#a7f3d0" : "#f87171",
    },
    timestampText: {
      fontSize: "0.875rem",
      color: "gray",
      marginTop: "4px",
    },
  };

  return (
    <div style={styles.container}>
      <h4 style={styles.title}>{title}</h4>

      {/* --- Ícono SVG de batería --- */}
      <svg
        viewBox="0 0 120 60"
        style={styles.svg}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Contorno */}
        <rect
          x="5"
          y="10"
          width="100"
          height="40"
          rx="6"
          ry="6"
          stroke="#555"
          strokeWidth="3"
          fill="none"
        />
        {/* Pestaña superior */}
        <rect
          x="106"
          y="22"
          width="8"
          height="16"
          rx="3"
          ry="3"
          fill="#555"
        />

        {/* Segmentos dinámicos */}
        {Array.from({ length: segments }).map((_, i) => {
          const segmentWidth = 16;
          const segmentSpacing = 3;
          const x = 8 + i * (segmentWidth + segmentSpacing);

          const isActive = i < activeSegments;
          const fillColor = isActive ? color : "transparent";
          const stroke = isActive ? color : "#333";

          return (
            <motion.rect
              key={i}
              x={x}
              y={14}
              width={segmentWidth}
              height={32}
              rx="4"
              ry="4"
              stroke={stroke}
              strokeWidth="2"
              fill={fillColor}
              animate={{
                fill: fillColor,
                stroke: stroke,
                boxShadow: isActive ? `0 0 10px ${color}` : "none",
              }}
              transition={{ duration: 0.3 }}
            />
          );
        })}
      </svg>

      {/* --- Valor central --- */}
      <div style={{ textAlign: "center" }}>
        <p style={styles.valueText}>{safeValue.toFixed(0)}</p>
        <p style={styles.unitText}>{unit}</p>
      </div>

      {/* --- Info inferior --- */}
      <div style={styles.infoSection}>
        <p style={styles.connectionStatus}>
          Conexión Global:{" "}
          <strong style={styles.statusText}>
            {isConnected ? "CONECTADO" : "DESCONECTADO"}
          </strong>
        </p>
        <p style={styles.timestampText}>Último dato: {formatInTimeZone(timestamp, 'America/Bogota', "yyyy-MM-dd HH:mm:ss 'GMT'XXX")}</p>
      </div>
    </div>
  );
};

export default BatteryLevel;
