"use strict";

/*
* Credits:
* https://gist.github.com/eslachance/3349734a98d30011bb202f47342601d3#file-index-js-L56
* ^Helped me setup discordJS
* https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584
* https://discord.js.org/#/docs/main/stable/general/welcome
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
    if( message.author.bot ) { return; } // Ignore bot's own messages
    if( message.content.indexOf(prefix) !== 0 ) { return; } // Ignore non-prefix messages
    if(message.channel.type === "dm") { return }; // Ignore dm messages
    
    // Split up message in command & args
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if( verbose ) { console.log('Cmd & Args Verbose'); console.log(`Command: ${command}`); console.log(`Arguments: ${args}`); console.log(); }; // For debugging purposes.

    if( !command ) { return; } // If there is no command, ignore the message.
    
    // Basic Commands
    if( command === 'ping' ) {
        const retMessage = await message.channel.send('Ping?');
        retMessage.edit(`Pong! Latency is ${retMessage.createdTimestamp - message.createdTimestamp}ms.`);
    }

    if( command === 'help' ) {
        // Wanna use EMBEDS but doesn't work bc Node not V12 & REPL still hasn't fixed it... also discord.js hasn't fixed it either so the patch method is to update to Node V12.
        // https://github.com/discordjs/discord.js/issues/3910

        const retMessage = message.channel.send(`Prefix: \`${prefix}\` \nCommands: \n  \`ping\``);
    }
    // Bot Specific Commands

    return;
});

// When err, console log it
client.on('error', console.error);

client.login(process.env.TOKEN);