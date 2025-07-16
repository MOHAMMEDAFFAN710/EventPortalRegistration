import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Container, Typography, Box, Button, Alert } from '@mui/material';
import EventList from './components/EventList';
import EventForm from './components/EventForm';
import EventsPage from './pages/EventsPage';
import { getEvents, createEvent, checkBackendHealth } from './services/api'; // Fixed import

function HomePage({ events, onCreateEvent, onDelete, backendStatus }) {
  return (
    <>
      {backendStatus === 'error' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Backend connection failed - please ensure the server is running
        </Alert>
      )}

      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Event Registration Portal
        </Typography>
      </Box>

      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Create New Event
        </Typography>
        <EventForm onCreateEvent={onCreateEvent} disabled={backendStatus !== 'connected'} />
      </Box>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Upcoming Events
          </Typography>
          <Button component={Link} to="/events" variant="outlined">
            View All Events
          </Button>
        </Box>
        <EventList
          events={events.slice(0, 3)}
          onDelete={onDelete}
          loading={backendStatus === 'loading'}
        />
      </Box>
    </>
  );
}

function App() {
  const [events, setEvents] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [backendStatus, setBackendStatus] = useState('loading');

  useEffect(() => {
    const verifySystem = async () => {
      try {
        setBackendStatus('loading');
        const isBackendUp = await checkBackendHealth(); // Using correct function name

        if (isBackendUp) {
          setBackendStatus('connected');
          const response = await getEvents();
          setEvents(response.data);
        } else {
          setBackendStatus('error');
        }
      } catch (error) {
        console.error('System verification failed:', error);
        setBackendStatus('error');
      }
    };

    verifySystem();
  }, [refresh]);

  const handleCreateEvent = async (eventData) => {
    try {
      await createEvent(eventData);
      setRefresh(!refresh);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    }
  };

  return (
    <BrowserRouter>
      <Container maxWidth="md" sx={{ my: 4 }}>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                events={events}
                onCreateEvent={handleCreateEvent}
                onDelete={() => setRefresh(!refresh)}
                backendStatus={backendStatus}
              />
            }
          />
          <Route
            path="/events"
            element={
              <EventsPage
                events={events}
                onDelete={() => setRefresh(!refresh)}
                backendStatus={backendStatus}
              />
            }
          />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;