import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  useTheme,
} from '@mui/material';
import {
  collection,
  query,
  where,
  orderBy,
  limit as fsLimit,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from '../../lib/firebaseClient';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';

const identifierMap = {
  power: 'potencia',
  potencia: 'potencia',
  battery: 'battery',
  rpm: 'rpm',
  speed: 'speed',
};

const TelemetryChart = ({
  title = 'Histórico',
  identifier,
  unit = '',
  timeframeHours = 6,
  limit = 300,
  color,
  // control height from parent if you want; otherwise use sensible defaults
  chartHeight,
}) => {
  const theme = useTheme();
  const accent = color || '#C6FF00';
  const [points, setPoints] = useState([]);
  const [lastTs, setLastTs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!identifier) return;

    const start = new Date(Date.now() - timeframeHours * 60 * 60 * 1000);

    const q = query(
      collection(firestore, 'telemetry'),
      where('receivedAt', '>=', Timestamp.fromDate(start)),
      orderBy('receivedAt', 'asc'),
      fsLimit(limit)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = [];
        snap.forEach((doc) => {
          const d = doc.data();
          const t =
            d?.receivedAt?.toDate
              ? d.receivedAt.toDate()
              : d?.receivedAt instanceof Date
              ? d.receivedAt
              : new Date();

          const v = extractNumericValue(d, identifier);
          if (typeof v === 'number' && Number.isFinite(v)) {
            data.push({ t, value: v });
          }
        });

        const trimmed = data.slice(-limit);
        setPoints(trimmed);
        setLastTs(trimmed.length ? trimmed[trimmed.length - 1].t : null);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore onSnapshot error:', err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [identifier, timeframeHours, limit]);

  const stats = useMemo(() => {
    if (!points.length) return { min: null, max: null, latest: null };
    let min = points[0].value;
    let max = points[0].value;
    for (const p of points) {
      if (p.value < min) min = p.value;
      if (p.value > max) max = p.value;
    }
    return { min, max, latest: points[points.length - 1].value };
  }, [points]);

  return (
    <Card
      sx={{
        width: '100%',
        // remove the cap so it can go full width
        maxWidth: '100%',
        background: '#111',
        color: '#e5e5e5',
        borderRadius: 3,
        border: '1px solid rgba(198,255,0,0.2)',
        boxShadow: '0 0 40px rgba(198,255,0,0.06)',
      }}
      elevation={0}
    >
      <CardHeader
        title={
          <Typography variant="h5" sx={{ color: accent, fontWeight: 700 }}>
            {title}
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: '#a8b3b8' }}>
            {identifier}
          </Typography>
        }
      />
      <CardContent>
        <Box
          sx={{
            height:
              chartHeight ??
              { xs: 320, sm: 380, md: 460, lg: '60vh' }, // grow on larger screens
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${identifier}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accent} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={accent} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke={theme.palette.mode === 'dark' ? '#222' : '#eee'}
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="t"
                tickFormatter={(v) => format(new Date(v), 'HH:mm')}
                stroke="#6f7b81"
                tick={{ fill: '#a8b3b8', fontSize: 12 }}
              />
              <YAxis
                stroke="#6f7b81"
                tick={{ fill: '#a8b3b8', fontSize: 12 }}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  background: '#0d0f0f',
                  border: '1px solid rgba(198,255,0,0.2)',
                  borderRadius: 8,
                }}
                labelFormatter={(v) => format(new Date(v), 'yyyy-MM-dd HH:mm:ss')}
                formatter={(val) => [`${round(val)} ${unit}`, 'Valor']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={accent}
                fill={`url(#grad-${identifier})`}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={accent}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>

        <Stack direction="row" spacing={2} sx={{ mt: 2, rowGap: 2, columnGap: 2, flexWrap: 'wrap' }}>
          <Chip
            label={
              <Typography variant="body2" sx={{ color: '#0ce39a', fontWeight: 700 }}>
                Min: {stats.min !== null ? `${round(stats.min)} ${unit}` : '—'}
              </Typography>
            }
            sx={{ background: '#0b1512' }}
            variant="outlined"
          />
          <Chip
            label={
              <Typography variant="body2" sx={{ color: '#ffea00', fontWeight: 700 }}>
                Max: {stats.max !== null ? `${round(stats.max)} ${unit}` : '—'}
              </Typography>
            }
            sx={{ background: '#151205' }}
            variant="outlined"
          />
          <Chip
            label={
              <Typography variant="body2" sx={{ color: '#8efb6c', fontWeight: 700 }}>
                Último: {stats.latest !== null ? `${round(stats.latest)} ${unit}` : '—'}
              </Typography>
            }
            sx={{ background: '#0f150b' }}
            variant="outlined"
          />
          <Chip
            label={
              <Typography variant="body2" sx={{ color: '#8fd3ff' }}>
                {loading
                  ? 'Cargando...'
                  : lastTs
                  ? `Último dato: ${formatInTimeZone(lastTs, 'America/Bogota', "yyyy-MM-dd HH:mm:ss 'GMT'XXX")}`
                  : 'Sin datos'}
              </Typography>
            }
            sx={{ background: '#0b0f15' }}
            variant="outlined"
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TelemetryChart;

function round(n, p = 2) {
  if (typeof n !== 'number') return n;
  const f = Math.pow(10, p);
  return Math.round(n * f) / f;
}

function extractNumericValue(docData, identifier) {
  const key = identifierMap[identifier] || identifier;
  const { payload, raw } = docData || {};

  if (typeof payload === 'number') return payload;

  if (payload && typeof payload === 'object') {
    const m = payload.message && typeof payload.message === 'object' ? payload.message : payload;

    if (typeof m[key] === 'number') return m[key];
    if (typeof m[key] === 'string') {
      const n = parseFloat(m[key]);
      if (!Number.isNaN(n)) return n;
    }
    if (typeof m.value === 'number') return m.value;
    if (typeof m.value === 'string') {
      const n = parseFloat(m.value);
      if (!Number.isNaN(n)) return n;
    }
  }

  if (typeof raw === 'string') {
    const n = parseFloat(raw);
    if (!Number.isNaN(n)) return n;
  }
  return null;
}