import express from 'express';
import cors from 'cors';
import { stripHtml } from "string-strip-html";

const server = express();
server.use(cors());
server.use(express.json());

const users  = [];
const messages = [];

server.post("/participants", (req,res)=>{
    const {name: rawName} = req.body;
    const name = stripHtml(rawName).result;
    const isOnline = users.some((e)=> {return e.name === name});
    if (!name || isOnline){
        res.send("bad username or user is already connected").status(401)
        return res.end();
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
    res.sendStatus(201);
})
server.get("/participants",(req, res) =>{
    res.send(users);
})
server.post("/messages", (req,res)=>{
    const {user: rawFrom} = req.headers;
    const {to:rawTo, text:rawText, type:rawType} = req.body;
    const from = stripHtml(rawFrom).result;
    const to = stripHtml(rawTo).result;
    const text = stripHtml(rawText).result;
    const type = stripHtml(rawType).result;
    if(!users.some((e)=> {
        return e.name === from;
    })){
        return res.sendStatus(401);
    }
    if (!to || !text){
        return res.sendStatus(400);
    }
    if (type !== "message" && type !==  "private_message"){
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
    res.sendStatus(201);
})
server.get("/messages", (req,res)=>{
    const {user} = req.headers;
    const limit = req.query.limit;
    const OnlineUser = users.find((u)=> u.name === user);
    if (!OnlineUser){
        return res.sendStatus(401);
    }
    if (!limit && user){
        const filteredMessages = messages.filter((m)=>{
            if ( m.to === user || m.from === user || m.to === 'Todos'){
                return m
            }
        });
        return res.status(200).send(filteredMessages);
    } else if (limit && user) {
        const sortedMessages = messages.sort((a, b) =>{ 
            return a.id - b.id;
        })
        const filteredMessages = (sortedMessages.filter((m)=>{
            if ( m.to === user || m.from === user || m.to === 'Todos'){
                return m
            }
        })
        ).slice(-limit);
        return res.status(200).send(filteredMessages);
    }
})
server.post("/status",(req,res)=>{
    const timeCheck = Date.now();
    const {user: rawUser} = req.headers;
    const user = stripHtml(rawUser).result;
    const OnlineUser = users.find((u)=> u.name === user);
    if (!OnlineUser){
        res.status(408).send("User has timed out");
        return res.end();
    }
    const leaseTime = timeCheck - OnlineUser.lastStatus;
    if(leaseTime <= 10000){
        OnlineUser.lastStatus = `${Date.now()}`
        return res.sendStatus(200);
    }
})
function checkUserStatus() {
    const timeCheck = Date.now();
    users.forEach((user,index)=>{
        const leaseTime = timeCheck - user.lastStatus;
        if (leaseTime > 10000){
            const date = new Date();
            const time = date.toLocaleTimeString('pt-br');
            const message = 
            {
                from: user.name,
                to: 'Todos',
                text: 'sai da sala...',
                type: 'status',
                time: time
            }
            messages.push(message);
            users.splice(index,1);
        }
    })
}
setInterval(checkUserStatus,15000);

server.listen(4000, ()=>(console.log('Server listening on port 4000')));