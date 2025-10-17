import Head from 'next/head';
import { Box, Container, Grid } from '@mui/material';
import { DashboardLayout } from '../components/dashboard-layout';
import { SocketProvider } from '../context/SocketContext';
import SensorData from '../components/SensorData';
import BatteryLevel from 'src/components/BatteryData';

const Dashboard = () => {
  return (
    <div>
      <Head>
        <title>Dashboard | Lambda Team</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth={false}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <SocketProvider>
                {/* --- GRID RESPONSIVE --- */}
                <Grid
                  container
                  spacing={3}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',          // Móviles → 1 columna
                      sm: '1fr 1fr',      // Tablets → 2 columnas
                      md: '1fr 1fr 1fr',  // Laptops → 3 columnas
                      lg: '1fr 1fr 1fr',  // Monitores grandes → 3 columnas
                    },
                    gap: '20px',
                    justifyItems: 'center',
                  }}
                >
                  <SensorData title="Sensor de RPM" identifier="rpm" />
                  <SensorData title="Sensor de Velocidad" identifier="speed" />
                  <BatteryLevel title="Sensor de Batería" identifier="battery" />
                </Grid>
              </SocketProvider>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </div>
  );
};

Dashboard.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Dashboard;
