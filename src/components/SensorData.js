import React from "react";
import useSensorData from "./hooks/useSensorData";
import { motion } from "framer-motion";

const LOGO_COLOR = '#CCFF00'; 
const START_ANGLE = 135;
const END_ANGLE = 45;
const TOTAL_ARC = START_ANGLE - END_ANGLE;

const NEEDLE_PIVOT_HEIGHT = 140;
const NEEDLE_LENGTH = 120;

const MAX_VALUES = {
  'Sensor de RPM': { max: 600, unit: 'RPM' },
  'Sensor de Batería': { max: 100, unit: '%' }, 
  'Sensor de Potencia': { max: 500, unit: 'kW' }, 
  'Sensor de Velocidad': { max: 60, unit: 'km/h' },
};

const GaugeScale = ({ maxValue, size, startAngle, endAngle, steps }) => {
  const values = Array.from({ length: steps + 1 }, (_, i) => Math.round(i * (maxValue / steps)));
  const totalArc = startAngle - endAngle;
  const R = size / 2; 
  const ARC_BORDER_WIDTH = 10; 

  return (
    <div style={{
      position: 'absolute',
      width: `${size}px`,
      height: `${size}px`,
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)'
    }}>
      {values.map((val, index) => {
        const normalizedIndex = index / steps;
        const rotation = startAngle - (normalizedIndex * totalArc);
        const rad = (rotation - 90) * (Math.PI / 180);

        const tickLength = index % 2 === 0 ? 14 : 8;
        const tickDistance = R - ARC_BORDER_WIDTH;
        const tickX = R + tickDistance * Math.cos(rad);
        const tickY = R + tickDistance * Math.sin(rad);

        const textDistance = R - 35;
        const textX = R + textDistance * Math.cos(rad);
        const textY = R + textDistance * Math.sin(rad);

        return (
          <React.Fragment key={index}>
            <div
              style={{
                position: 'absolute',
                width: '2px',
                height: `${tickLength}px`,
                backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.4)',
                left: `${tickX}px`,
                top: `${tickY}px`,
                transformOrigin: '0 0',
                transform: `rotate(${rotation}deg) translate(-50%, -100%)`,
              }}
            />
            {index % 2 === 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: `${textX}px`,
                  top: `${textY}px`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'rgba(255, 255, 255, 0.85)',
                  textShadow: '0 0 2px rgba(0,0,0,0.4)', // Shadow más sutil
                }}
              >
                {val.toFixed(0)}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const SensorData = ({ title, identifier }) => {
  const config = MAX_VALUES[title] || { max: 100, unit: '%' }; 
  const { timestamp, value, isConnected } = useSensorData(identifier || title);

  const maxValue = config.max;
  const unit = config.unit;

  let safeValue = typeof value === "number" && !isNaN(value) ? value : 0;
  if (!isConnected) safeValue = maxValue / 2;
  else safeValue = Math.max(0, safeValue);
  safeValue = Math.min(safeValue, maxValue);

  const normalizedValue = safeValue / maxValue;
  const angle = START_ANGLE - (normalizedValue * TOTAL_ARC);
  const displayValue = safeValue.toFixed(0);

  const gaugeSize = 256;
  const PIVOT_MARGIN_FROM_BOTTOM = NEEDLE_PIVOT_HEIGHT;
  const needleBottom = PIVOT_MARGIN_FROM_BOTTOM;
  const needleLength = NEEDLE_LENGTH;
  const gaugeWrapperHeight = gaugeSize / 2 + PIVOT_MARGIN_FROM_BOTTOM + 10;

  const styles = {
    container: { flex: 1, backgroundColor: '#0d0d0d', color: 'white', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', borderRadius: '12px' },
    title: { fontSize: '1.25rem', fontWeight: 600, marginBottom: '5px', color: LOGO_COLOR },
    gaugeWrapper: { position: 'relative', width: `${gaugeSize}px`, height: `${gaugeWrapperHeight}px`, marginTop: '10px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' },
    gaugeArcBase: { position: 'absolute', width: `${gaugeSize}px`, height: `${gaugeSize}px`, borderRadius: '50%', border: '10px solid transparent', WebkitMask: 'radial-gradient(transparent 50%, black 50%)', mask: 'radial-gradient(transparent 50%, black 50%)', clipPath: 'inset(50% 0 0 0)', transform: 'translateY(50%)' },
    backgroundArc: { background: `conic-gradient(from ${START_ANGLE}deg, #1e3d40 0deg, #2a5054 5%, #2a5054 95%, #1e3d40 100%)` },
    progressArc: { zIndex: 5 },
    centerDot: { position: 'absolute', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'white', zIndex: 20, boxShadow: `0 0 15px ${LOGO_COLOR}`, bottom: `${needleBottom - 8}px` },
    needle: { position: 'absolute', bottom: `${needleBottom}px`, width: '4px', height: `${needleLength}px`, backgroundColor: LOGO_COLOR, zIndex: 10, borderRadius: '4px', boxShadow: `0 0 20px ${LOGO_COLOR}`, transformOrigin: 'bottom center' },
    centerValue: { position: 'absolute', bottom: '0', textAlign: 'center', zIndex: 30, height: `${PIVOT_MARGIN_FROM_BOTTOM}px`, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    valueText: { fontSize: '3rem', fontWeight: 800, color: LOGO_COLOR, textShadow: '0 0 2px rgba(0,0,0,0.4)' }, // shadow más sutil
    unitText: { fontSize: '1.125rem', fontWeight: 500, color: 'gray' },
    infoSection: { marginTop: '32px', textAlign: 'center', width: '100%' },
    connectionStatus: { fontSize: '1rem', marginTop: '8px' },
    statusText: { fontWeight: 700, color: isConnected ? '#a7f3d0' : '#f87171' },
    timestampText: { fontSize: '0.875rem', color: 'gray', marginTop: '4px' }
  };

  return (
    <div style={styles.container}>
      <h4 style={styles.title}>{title}</h4>

      <div style={styles.gaugeWrapper}>
        <GaugeScale 
          maxValue={maxValue}
          size={gaugeSize}
          startAngle={START_ANGLE}
          endAngle={END_ANGLE}
          steps={10} 
        />

        {/* Arco de fondo */}
        <div style={{ ...styles.gaugeArcBase, ...styles.backgroundArc }} />

        {/* Semicírculo de progreso verde */}
        <motion.div
          style={{ ...styles.gaugeArcBase, ...styles.progressArc }}
          animate={{
            background: `conic-gradient(
              from ${START_ANGLE}deg,
              green 0deg,
              green ${normalizedValue * TOTAL_ARC}deg,
              transparent ${normalizedValue * TOTAL_ARC}deg
            )`
          }}
          transition={{ type: "spring", stiffness: 120, damping: 12 }}
        />

        {/* Aguja */}
        <motion.div
          style={styles.needle}
          animate={{ rotate: angle }}
          transition={{ type: "spring", stiffness: 120, damping: 12 }}
        />

        <div style={styles.centerDot} />
        
        <div style={styles.centerValue}>
          <p style={styles.valueText}>{displayValue}</p>
          <p style={styles.unitText}>{unit}</p>
        </div>
      </div>

      <div style={styles.infoSection}>
        <p><span style={{ fontWeight: 500 }}>Valor Máximo:</span> {maxValue} {unit}</p>
        <p style={styles.connectionStatus}>
          Conexión Global: <strong style={styles.statusText}>{isConnected ? "CONECTADO" : "DESCONECTADO"}</strong>
        </p>
        <p style={styles.timestampText}>Último dato: {timestamp}</p>
      </div>
    </div>
  );
};

export default SensorData;
