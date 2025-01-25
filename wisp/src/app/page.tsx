"use client";
import { Button, List, ListItem } from '@mui/material';
import apiClient from '../lib/axios';
import { useState, useEffect } from 'react';

// Define the interface for the movement object
interface Movement {
  id: number;
  amount: number;
  member: {
    id: number;
    name: string;
  }
}

export default function Home() {
  const [movements, setMovements] = useState<Movement[]>([]);

  useEffect(() => {
    apiClient.get('http://127.0.0.1:8000/api/movements/')
      .then((response) => {
        setMovements(response.data);
      })
      .catch((error) => {
        console.error('Full error:', error);
        console.error('Error fetching the data:', error);
      });
  }, []);

  return (
    <>
      <Button>Chuen</Button>
      <List>
        {movements.map((movement) => (
          <ListItem key={movement.id}>{movement.member.name} spent {movement.amount}</ListItem>
        ))}
      </List>
    </>
  );
}
