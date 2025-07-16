import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Box
} from '@mui/material';
import { deleteEvent, handleApiError } from '../services/api';

export default function EventList({ events, onEventDeleted }) {
  const [loadingStates, setLoadingStates] = useState({});
  const [error, setError] = useState(null);

  const handleDelete = async (eventId) => {
    setLoadingStates(prev => ({ ...prev, [eventId]: true }));
    setError(null);

    try {
      await deleteEvent(eventId);
      onEventDeleted(); // Trigger parent component to refresh data
    } catch (err) {
      handleApiError(err, setError);
    } finally {
      setLoadingStates(prev => ({ ...prev, [eventId]: false }));
    }
  };

  if (events.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography variant="body1" color="textSecondary">
          No events found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {events.map(event => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {event.name}
                </Typography>

                <Typography color="textSecondary" sx={{ mb: 1 }}>
                  {new Date(event.startTime).toLocaleString()} – {' '}
                  {new Date(event.endTime).toLocaleString()}
                </Typography>

                <Typography paragraph sx={{ mb: 1 }}>
                  {event.description}
                </Typography>

                <Typography sx={{ mb: 1 }}>
                  <strong>Location:</strong> {event.location}
                </Typography>

                <Typography>
                  <strong>Capacity:</strong> {event.capacity}
                </Typography>
              </CardContent>

              <Box sx={{ p: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleDelete(event.id)}
                  disabled={loadingStates[event.id]}
                  startIcon={
                    loadingStates[event.id] ?
                    <CircularProgress size={20} /> :
                    null
                  }
                  sx={{ width: '100%' }}
                >
                  {loadingStates[event.id] ? 'Deleting...' : 'Delete'}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}