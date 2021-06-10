import express from 'express';
import cors from 'cors';

const server = express();
server.use(cors());
server.use(express.json());

server.listen(4000, ()=>(console.log('Server runnin on port 4000')));