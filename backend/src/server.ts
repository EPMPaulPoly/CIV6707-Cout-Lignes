import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import config from './config';

const app = express();
const port = config.server.port;

app.use(cors());

const pool = new Pool(config.database);

app.get('/api/transit-lines', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM transit_lines');
    const transitLines = result.rows;

    const geoJSON = {
      type: "FeatureCollection",
      features: transitLines.map(line => ({
        type: "Feature",
        properties: { name: line.name, color: line.color },
        geometry: JSON.parse(line.geometry)
      }))
    };

    res.json(geoJSON);
    client.release();
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});