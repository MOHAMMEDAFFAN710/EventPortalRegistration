import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Typography, Box } from '@mui/material';
import EventList from '../components/EventList';

export default function EventsPage({ events, onDelete }) {
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          All Events
        </Typography>
        <Button component={Link} to="/" variant="outlined">
          Back to Home
        </Button>
      </Box>
      <EventList events={events} onDelete={onDelete} />
    </>
  );
}