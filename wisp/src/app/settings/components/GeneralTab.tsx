import { Box, Typography, Card, CardContent, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Member, User } from '../types';

interface GeneralTabProps {
  user: User | null;
  members: Member[];
}

export default function GeneralTab({ user, members }: GeneralTabProps) {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Your Information
      </Typography>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid key="name" item xs={12} sm={6}>
              <Typography variant="subtitle1">Name</Typography>
              <Typography variant="body1">{user?.username}</Typography>
            </Grid>
            <Grid key="email" item xs={12} sm={6}>
              <Typography variant="subtitle1">Email</Typography>
              <Typography variant="body1">{user?.email}</Typography>
            </Grid>
            <Grid key="household" item xs={12}>
              <Typography variant="subtitle1">Household</Typography>
              <Typography variant="body1">
                {members.find(m => m.id === user?.id)?.household?.name || 'No household'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Typography variant="h5" gutterBottom>
        Household Members
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 