import React from 'react';
import { Container, Typography, Paper, Box, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  const stats = [
    { title: 'Total Users', value: '1,234' },
    { title: 'Active Projects', value: '56' },
    { title: 'Revenue', value: '$12,345' },
    { title: 'Growth', value: '+23%' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  {stat.title}
                </Typography>
                <Typography variant="h4">{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Welcome to Your Dashboard
        </Typography>
        <Typography color="text.secondary">
          This is a placeholder dashboard. Implement your SaaS features here!
        </Typography>
      </Paper>
    </Container>
  );
}

export default Dashboard;
