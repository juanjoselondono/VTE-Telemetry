// components/SensorGauge.js
import { motion } from 'framer-motion';

const SensorGauge = ({ title, value, unit, color }) => {
  return (
    <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center text-center border border-gray-800 w-80">
      <h3 className="text-gray-400 text-sm uppercase tracking-wide mb-2">{title}</h3>
      <motion.div
        key={value}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-6xl font-bold"
        style={{ color }}
      >
        {value ?? "--"}
        <span className="text-2xl text-gray-400 ml-1">{unit}</span>
      </motion.div>
      <div className="w-full bg-gray-800 rounded-full h-2 mt-4">
        <motion.div
          className="h-2 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((value / 200) * 100, 100)}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>
    </div>
  );
};

export default SensorGauge;
