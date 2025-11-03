import Head from 'next/head';
import { Box, Container, Grid } from '@mui/material';
import { DashboardLayout } from '../components/dashboard-layout';
import { SocketProvider } from '../context/SocketContext';
import SensorData from '../components/SensorData';
import BatteryLevel from 'src/components/BatteryData';
import TelemetryChart from 'src/components/TelemetryChart';

const Dashboard = () => {
  return (
    <div>
      <Head>
        <title>Dashboard | VTE Team</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth={false}>
          <SocketProvider>
            <Grid container spacing={3}>
              {/* Sensors row */}
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SensorData title="Sensor de Potencia" identifier="potencia" />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <BatteryLevel title="Sensor de Batería" identifier="battery" />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SensorData title="Sensor de RPM" identifier="rpm" />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SensorData title="Sensor de Velocidad" identifier="speed" />
              </Grid>

              {/* Charts row */}
              {/* If you add a second chart later, make both md={6} lg={6} to place them side by side */}
              <Grid item xs={12} md={12} lg={12}>
                <TelemetryChart
                  title="Histórico de Potencia (kW)"
                  identifier="potencia"
                  unit="kW"
                  timeframeHours={6}
                  limit={300}
                  color="#C6FF00"
                />
              </Grid>
              <Grid item xs={12} md={12} lg={12}>
                <TelemetryChart
                  title="Histórico de Batería (%)"
                  identifier="battery"
                  unit="%"
                  timeframeHours={6}
                  limit={300}
                  color="#00BFFF"
                />
              </Grid>
              <Grid item xs={12} md={12} lg={12}> 
                <TelemetryChart
                  title="Histórico de RPM"
                  identifier="rpm"
                  unit="RPM"
                  timeframeHours={6}
                  limit={300}
                  color="#FFA500"
                />
              </Grid>
            </Grid>
          </SocketProvider>
        </Container>
      </Box>
    </div>
  );
};

Dashboard.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Dashboard;