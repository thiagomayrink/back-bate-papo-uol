import express from 'express';
import cors from 'cors';

const server = express();
server.use(cors());
server.use(express.json());

const users  = [];
const messages = [];

server.post("/participants", (req,res)=>{
    const {name} = req.body;
    //sanitize name here!
    const isOnline = users.some((e)=> {
        return e.name === name;
    });
    if (name === "" || isOnline){
        return res.send("bad username or username is already connected").status(400);
    }
    const lastStatus = `${Date.now()}`;
    const user = {
        name,
        lastStatus
    }
    users.push(user);
    const date = new Date();
    const time = date.toLocaleTimeString('pt-br');
    const message = {
        from: user.name,
        to: 'Todos',
        text: 'entra na sala...',
        type: 'status',
        time: time
    }
    messages.push(message);
    res.sendStatus(200);
})
server.get("/participants",(req, res) =>{
    res.send(users);
})
server.post("/messages", (req,res)=>{
    const {user: from} = req.headers;
    const {to, text, type} = req.body;
    //sanitize text here!
    if (!to || !text){
        return res.sendStatus(400);
    }
    if (type !== "message" && type !==  "private_message"){
        return res.sendStatus(400);
    }
    if(!users.some((e)=> {
        return e.name === from;
    })){
        return res.sendStatus(400);
    }
    const date = new Date();
    const time = date.toLocaleTimeString('pt-br');
    const message = {
        from,
        to,
        text,
        type,
        time
    }
    messages.push(message);
    res.sendStatus(200);
})
server.get("/messages", (req,res)=>{
    const {user: from} = req.headers;
    const limit = req.query.limit;
    if (!limit && from){
        const filteredMessages = messages.filter((m)=>{
            if ( m.to === from || m.from === from || m.to === 'Todos'){
                return m
            }
        });
        return res.status(200).send(filteredMessages);
    } else if (limit && from) {
        const sortedMessages = messages.sort((a, b) =>{ 
            return a.id - b.id;
        })
        const filteredMessages = (sortedMessages.filter((m)=>{
            if ( m.to === from || m.from === from || m.to === 'Todos'){
                return m
            }
        })
        ).slice(-limit);
        return res.status(200).send(filteredMessages);
    }
})


server.listen(4000, ()=>(console.log('Server runnin on port 4000')));