"use strict";

/*
* Credits:
* https://gist.github.com/eslachance/3349734a98d30011bb202f47342601d3#file-index-js-L56
* ^Helped me setup discordJS
*/
// Setup Discord
const Discord = require('discord.js');
const client = new Discord.Client();

// Declare Variables
const prefix = '==';
const verbose = true;

client.once('ready', () => {
	console.log('Ready!');
    console.log();
});

client.on('message', async message => {
    if( message.author.bot ) { return; } // ignore bot's own messages
    if( message.content.indexOf(prefix) !== 0 ) { return; } // ignore non-prefix messages
    
    // Split up message in command & args
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if( verbose ) { console.log('Cmd & Args Verbose'); console.log('Command: ' + command); console.log('Arguments: ' + args); console.log(); }; // For debugging purposes.

    if( !command ) { return; } // If there is no command, ignore the message.
    
    // Basic Commands
    if( command === 'ping' ) {
        const retMessage = await message.channel.send('Ping?');
        retMessage.edit(`Pong! Latency is ${retMessage.createdTimestamp - message.createdTimestamp}ms.`);
    }

    if( command === 'help' ) {

    }
    // Bot Specific Commands

    return;
});

// When err, console log it
client.on('error', console.error);

client.login(process.env.TOKEN);