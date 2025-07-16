import React, { useState } from 'react';
import {
  TextField,
  Button,
  Stack,
  Typography
} from '@mui/material';

export default function EventForm({ onCreateEvent }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    capacity: 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateEvent(formData);
    setFormData({
      name: '',
      description: '',
      startTime: '',
      endTime: '',
      location: '',
      capacity: 1
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="Event Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
          fullWidth
        />
        <TextField
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          multiline
          rows={3}
          fullWidth
        />
        <TextField
          label="Start Time"
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
          value={formData.startTime}
          onChange={(e) => setFormData({...formData, startTime: e.target.value})}
          required
          fullWidth
        />
        <TextField
          label="End Time"
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
          value={formData.endTime}
          onChange={(e) => setFormData({...formData, endTime: e.target.value})}
          required
          fullWidth
        />
        <TextField
          label="Location"
          value={formData.location}
          onChange={(e) => setFormData({...formData, location: e.target.value})}
          required
          fullWidth
        />
        <TextField
          label="Capacity"
          type="number"
          value={formData.capacity}
          onChange={(e) => setFormData({...formData, capacity: e.target.value})}
          inputProps={{ min: 1 }}
          required
          fullWidth
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          sx={{ mt: 2 }}
        >
          Create Event
        </Button>
      </Stack>
    </form>
  );
}