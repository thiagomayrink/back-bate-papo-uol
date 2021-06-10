import express from 'express';
import cors from 'cors';

const server = express();
server.use(cors());
server.use(express.json());

const users  = [];
const messages = [];

server.post("/participants", (req,res)=>{
    const {name} = req.body;
    if (name===""){
        return res.sendStatus(400);
    }
    const lastStatus = `${Date.now()}`;
    const user = {
        name,
        lastStatus
    }
    users.push(user);
    const date = new Date();
    const timeHMS = date.toLocaleTimeString('pt-br');
    const message = {
        from: user.name,
        to: 'Todos',
        text: 'entra na sala...',
        type: 'status',
        time: timeHMS
    }
    messages.push(message);
    res.sendStatus(200);
})
server.get("/participants",(req, res) =>{
    res.send(users);
})



server.listen(4000, ()=>(console.log('Server runnin on port 4000')));