const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./Database/connection');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auth', require('./Authentication/authRoutes'));
app.use('/api/users', require('./Authentication/userRoutes'));
app.use('/api/teams', require('./Teams/teamRoutes'));
app.use('/api/players', require('./Players/playerRoutes'));
app.use('/api/matches', require('./Matches/matchRoutes'));
app.use('/api/competitions', require('./Competitions/competitionRoutes'));
app.use('/api/news', require('./News/newsRoutes'));
app.use('/api/injuries', require('./Injuries/injuryRoutes'));
app.use('/api/training', require('./Training/trainingRoutes'));
app.use('/api/stats', require('./Statistics/statsRoutes'));

app.get('/', (req,res)=> res.send('Sindhuli FC API Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));