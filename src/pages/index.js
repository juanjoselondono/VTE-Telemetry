import Head from 'next/head';
import { Box, Container, Grid } from '@mui/material';
import { DashboardLayout } from '../components/dashboard-layout';
import { SocketProvider } from '../context/SocketContext';
import SensorData from '../components/SensorData';
//import { TrafficByDevice } from 'src/components/dashboard/traffic-by-device';  estas son las tablas
//icons
const Dashboard = () => {
  return(
  <div>
    <Head>
      <title>
        Dashboard | Lambda Team
      </title>
    </Head>
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8
      }}
    >
      <Container maxWidth={false}>
        <Grid
          container
          spacing={3}
        >
          <Grid
            item
            lg={12}
            md={12}
            xl={12}
            xs={12}
          >
            <SocketProvider>            
            <div style={{ display: 'flex', gap: '20px' }}>
                {/* Sensor de Temperatura: Filtra por 'temp01' */}
                <SensorData 
                    title="Sensor de RPM" 
                    identifier="rpm" // Esto se usa en useSensorData para filtrar
                />
                
                {/* Otro Sensor: Filtra por 'press03' */}
                <SensorData 
                    title="Sensor de Bateria" 
                    identifier="battery"
                />
                <SensorData 
                    title="Sensor de Potencia" 
                    identifier="potencia"
                />
            </div>
        </SocketProvider>
          </Grid>
          <Grid
            item
            lg={12}
            md={12}
            xl={12}
            xs={12}
          >
          </Grid>
        </Grid>
      </Container>
    </Box>
  </div>
  )
};

Dashboard.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Dashboard;


   