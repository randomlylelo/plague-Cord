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
const verbose = true; // debug variable

client.once('ready', () => {
	console.log('Ready!');
    console.log();
});

// ALL COMMANDS
client.on('message', async message => {
    if( message.author.bot ) { return; } // Ignore bot's own messages
    if( message.channel.type === "dm" ) { return }; // Ignore dm messages
    
    /* 
    * Economy & Virus
    */
    if( message.guild ) {
        const docRef = db.collection('users').doc(message.author.id);
        docRef.get().then(async function(doc) {
            // check if user ID is in DB
            if ( doc.exists ) { // If so add money
                const data = await doc.data()
                const temp = data.money+Math.round(Math.random()*2); // chance to get 0 to 2 dollars.
                docRef.update({
                    money: temp,
                });
            }
        }).catch(function(error) {
            if( verbose ) { console.log(error); } // this will always error if person doesn't have a human.
        });

        docRef.get().then(async function(doc) { // VIRUS DEMO
            const virus = (Math.random()); // Since I don't want everyone to constanly be at risk...
            if(virus <= 0.25) { // curently 1/4 chance of getting virus
                // check if user ID is in DB
                if ( doc.exists ) { // if player is playing then see how their immune sys
                    const chance = Math.random()*11; // will get a value between 0 & 10.99
                    const data = await doc.data(); // get data
                    const life = data.immune - chance;
                    if( life < 0 ) {
                        const random = Math.random();
                        let conditions;
                        if(random <= 0.25) { conditions = 'COVID-19'; }
                        else if(random >= 0.25 && random <= 0.50) { conditions = 'Bubonic plague'; }
                        else if(random >= 0.50 && random <= 0.75) { conditions = 'Ebola'; }
                        else if(random >= 0.75) { conditions = 'Cholera'; }
                        
                        const checker = data.problems.indexOf(conditions);
                        if(checker != -1) {
                            conditions = undefined;
                        }

                        if( conditions ) { // As long as there is condition
                            const temp = data.problems+' '+conditions+',';
                            console.log(temp);
                            docRef.update({
                                problems: temp,
                            });
                        }
                    }
                }
            }
        }).catch(function(error) {
            if( verbose ) { console.log(error); } // this will always error if person doesn't have a human.
        });
    }

    if( message.content.indexOf(prefix) !== 0 ) { return; } // Ignore non-prefix messages

    /*
    * Commands
    */
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
                let immune;
                if(data.immune < 3) { immune = 'Weak'; }
                else if(data.immune > 3 && data.immune < 7) { immune = 'Normal'; }
                else if(data.immune > 7) { immune = 'Strong'; }
                return message.channel.send(`Name: ${data.name}\nAge: ${data.age}\nMoney: \$${data.money}\nHealth: ${data.hp}\nImmune Strength: ${immune}\nStatus: ${data.problems}\n`); // Send stats
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
                        money: 100,
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
    if( command === 'store' || command === 'shop' ) {
        return message.channel.send(`
**Notice** 
> When you buy something it automatically gets used.
> Also to purchase do \`buy <number>\`
\`1\`Medicine - $10 (Helps ease the effects of diseases; Lowers health loss due to diseases)
\`2\`Exercise - \$10 (Boosts your immune system; Increases immune strength)
\`3\`Vaccine - \$10 (Prevents you from getting some diseases;)
\`4\`Vitamins - \$10 (Does nothing... However uses the placebo effect to boost your immune; Increases immune strength)
\`5\`Essential Oils -\$10 (Does nothing... Uses the placebo effect to cure you; Has a chance of getting rid of a disease)
        `);
    }

    if( command === 'buy' || command === 'purchase' ) {
        if( !args[0] ) { // if there isn't an argument then
            return message.channel.send('Make sure to enter a number to purchase.');
        } else {
            const docRef = db.collection('users').doc(message.author.id);
            docRef.get().then(function(doc) {
                if (doc.exists) { // if it does then update the player
                const data = doc.data();
                // TODO: too many ifs omg. replace with switch later. Also just replace with for loop & a list with the prices...
                    if( args[0] === '1' ) {
                        if( data.money < 10 ) {
                            return message.channel.send('You don\'t have enough money! Talk in chat to earn more!')
                        } else {
                            const temp = {
                                money: data.money-10
                            }
                            docRef.update(temp);
                            return message.channel.send('Purchased and applied! Use `stats` to check your updated stats.');
                        }
                    }
                    else if( args[0] === '2' ) {
                        if( data.money < 10 ) {
                            return message.channel.send('You don\'t have enough money! Talk in chat to earn more!')
                        } else {
                            const temp = {
                                money: data.money-10
                            }
                            docRef.update(temp);
                            return message.channel.send('Purchased and applied! Use `stats` to check your updated stats.');
                        }
                    }
                    else if( args[0] === '3' ) {
                        if( data.money < 10 ) {
                            return message.channel.send('You don\'t have enough money! Talk in chat to earn more!')
                        } else {
                            const temp = {
                                money: data.money-10
                            }
                            docRef.update(temp);
                            return message.channel.send('Purchased and applied! Use `stats` to check your updated stats.');
                        }
                    }
                    else if( args[0] === '4' ) {
                        if( data.money < 10 ) {
                            return message.channel.send('You don\'t have enough money! Talk in chat to earn more!')
                        } else {
                            const temp = {
                                money: data.money-10
                            }
                            docRef.update(temp);
                            return message.channel.send('Purchased and applied! Use `stats` to check your updated stats.');
                        }
                    }
                    else if( args[0] === '5' ) {
                        if( data.money < 10 ) {
                            return message.channel.send('You don\'t have enough money! Talk in chat to earn more!')
                        } else {
                            const temp = {
                                money: data.money-10
                            }
                            docRef.update(temp);
                            return message.channel.send('Purchased and applied! Use `stats` to check your updated stats.');
                        }
                    }
                } else {
                    return message.channel.send('You don\' have a human to purcahse items! Use `create <name>` to make one!')
                }
            }).catch(function(error) {
                console.log("Error getting document:", error);
                return message.channel.send('error');
            });
        }
    }

    // Future Plan for leaderboard?
    return;
});

// When err, console log it
client.on('error', console.error);

client.login(process.env.TOKEN);