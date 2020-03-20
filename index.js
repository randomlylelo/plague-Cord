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
const db = require('./database/db.js');

// Declare Variables
const prefix = '==';
const verbose = true;

client.once('ready', () => {
	console.log('Ready!');
    console.log();
});

// ALL COMMANDS
client.on('message', async message => {
    if( message.author.bot ) { return; } // Ignore bot's own messages
    if( message.content.indexOf(prefix) !== 0 ) { return; } // Ignore non-prefix messages
    if( message.channel.type === "dm" ) { return }; // Ignore dm messages
    
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
    if( command === 'stats' ) {
        const docRef = db.collection('users').doc(message.author.id);
        let data;
        docRef.get().then(function(doc) {
            // check if user ID is in DB
            if (doc.exists) { // if so, return the stats of the player
                data = doc.data();
                if( verbose ) { console.log(data); }
                /* Stats Format:
                * Name
                * Age
                * HP 
                * Immune Strength (chance of getting virus)
                * Current heath issues
                */
                return message.channel.send(`Name: ${data.name}\nAge: ${data.age}\nHealth: ${data.hp}\nImmune System Strength: ${data.immune}\nCurrent Health Problems: ${data.problems}\n`); // Send stats
            } else { // if it doesn't reply with there is no account
                return message.channel.send('You don\'t have a human. Use the command `create` to make a human.');
            }
        }).catch(function(error) {
            if( verbose ) { console.log("Error getting document:", error); }
            return message.channel.send('error');
        });
    }

    // Create a player CMD
    if ( command === 'create' ) { // need argument of a name
        const docRef = db.collection('users').doc(message.author.id);

        docRef.get().then(function(doc) {
            if(!doc.exists) {
                if( !args[0] ) { // if there isn't an argument then
                    return message.channel.send('Make sure to enter the name of your human! The command is `create <name>`.');
                } else {
                    let player = {
                        name: args[0],
                        age: 20,
                        hp: 100,
                        immune: 5, // 1-10 for immune strength 1 being weakest 10 being strongest
                        problems: '',
                    }
                    docRef.set(player);
                    return message.channel.send(`${args[0]} successfully created! Use \`stats\` to check your stats!`)
                }
            } else {
                return message.channel.send('You already have a human! Use `stats` to see your current human stats');
            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
            return message.channel.send('error');
        });
    }

    // Delete player command
    if( command === 'delete' ) {
        const docRef = db.collection('users').doc(message.author.id);
        docRef.get().then(function(doc) {
            if (doc.exists) { // if it does then delete player
                docRef.delete();
                return message.channel.send('Human successfully deleted.');
            } else {
                return message.channel.send('You don\' have a human to delete')
            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
            return message.channel.send('error');
        });
    }

    // Store CMD to purchase items

    // Future Plan for leaderboard?



    return;
});

// When err, console log it
client.on('error', console.error);

client.login(process.env.TOKEN);