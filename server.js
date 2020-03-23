// stole from this https://repl.it/talk/learn/Hosting-discordjs-bots-on-replit-Works-for-both-discordjs-and-Eris/11027

const express = require('express');
const server = express();

server.all('/', (req, res)=>{
    res.send('Your bot is alive!')
})

function keepAlive(){
    server.listen(3000, ()=>{console.log("Server is Ready!")});
}


module.exports = keepAlive;