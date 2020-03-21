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
    client.user.setActivity(`==help`);
});

// ALL COMMANDS
client.on('message', async message => {
    if( message.author.bot ) { return; } // Ignore bot's own messages
    if( message.channel.type === "dm" ) { return }; // Ignore dm messages
    
    /* 
    * Economy & Virus
    */
    if( message.guild ) {
        // ECONOMY
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

        // VIRUS
        docRef.get().then(async function(doc) { // VIRUS DEMO
            const virus = Math.floor(Math.random()*50)+1;
            console.log(virus);
            if(virus == 1 ) { // 1 in 50 chance
                // check if user ID is in DBT
                if ( doc.exists ) { // if player is playing then see how their immune sys
                    const chance = Math.random()*11; // will get a value between 0 & 10.99
                    let data = await doc.data(); // get data
                    const life = data.immune - chance;
                    if( life < 0 ) {
                        const random = Math.random();
                        let conditions;
                        if(random <= 0.25) { conditions = 'COVID-19'; }
                        else if(random >= 0.25 && random <= 0.50) { conditions = 'Bubonic plague'; }
                        else if(random >= 0.50 && random <= 0.75) { conditions = 'Ebola'; }
                        else if(random >= 0.75) { conditions = 'Cholera'; }
                        
                        data = await doc.data(); // update adata again.
                        const checker = data.problems.indexOf(conditions);
                        if(checker != -1) {
                            conditions = undefined;
                        }

                        if( conditions ) { // As long as there is condition
                            const temp = data.problems+conditions+', ';
                            console.log(temp);
                            docRef.update({
                                problems: temp,
                            });
                            message.channel.send(`You just caught ${conditions}!`);
                        }
                    }
                }
            }
        }).catch(function(error) {
            if( verbose ) { console.log(error); } // this will always error if person doesn't have a human.
        });

        // Killer
        docRef.get().then(async function(doc) {
            // check if user ID is in DB
            if ( doc.exists ) {
                const data = await doc.data();
                // check if they have any conditions
                if( data.problems.length != 0) {
                    // Give chance of cure 
                    const cure = Math.floor(Math.random()*100)+1;
                    const split = data.problems.split(', ');
                    split.pop(); // get rid of the space @ end
                    const split2 = split;
                    if( cure == 1 ) { // 1/100 chance of cure
                        let shifted = split.shift(); // get rid of first element
                        let result = '';
                        for(let i = 0; i < split.length; i++) {
                            result = result+split[i]+', '
                        }
                        docRef.update({
                            problems: result,
                        });
                        message.channel.send('Congratulations, you are cured of ' + shifted);
                    }

                    // Take damage
                    let totalDMG = 0;
                    for(let i = 0; i < split2.length; i++) {
                        if(split2[i] === 'COVID-19') { totalDMG += 2; }
                        else if(split2[i] === 'Bubonic plague') { totalDMG += 1; }
                        else if(split2[i] === 'Ebola') { totalDMG += 4; }
                        else if(split2[i] === 'Cholera') { totalDMG += 2; }
                    }
                    docRef.update({
                        hp: data.hp-totalDMG,
                    });
                }
            }
        }).catch(function(error) {
            if( verbose ) { console.log(error); } // this will always error if person doesn't have a human.
        });

        // GAME ENDER
        // EITHER HP GOES NEGATIVE OR MONEY GOES TO $200
        docRef.get().then(function(doc) {
            if (doc.exists) { // if it does then delete player
                const data = doc.data();
                if( data.hp <= 0 ) {
                    const tempo = data.problems.substring(0, data.problems.length - 2);
                    message.channel.send('R.I.P your human, he died from ' + tempo + '. Use `create <name>` to make a new human!');
                    docRef.delete();
                    return;
                }
                if( data.money > 200 ) {
                    let immune;
                    if(data.immune < 3) { immune = 'Weak'; }
                    else if(data.immune > 3 && data.immune < 7) { immune = 'Normal'; }
                    else if(data.immune > 7) { immune = 'Strong'; }
                    const tempo = data.problems.substring(0, data.problems.length - 2);
                    message.channel.send(`CONGRATS! You just completed the game, your winning stats:\nName: ${data.name}\nAge: ${data.age}\nMoney: \$${data.money}\nHealth: ${data.hp}\nImmune Strength: ${immune}\nStatus: ${data.problems}\nDeleting your human...`);
                    docRef.delete();
                    message.channel.send('Use `create <name>` to make a new human.')
                    return;
                }
            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
            return message.channel.send('error');
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
                const tempo = data.problems.substring(0, data.problems.length - 2);
                return message.channel.send(`Name: ${data.name}\nAge: ${data.age}\nMoney: \$${data.money}\nHealth: ${data.hp}\nImmune Strength: ${immune}\nStatus: ${tempo}\n`); // Send stats
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
\`1\`Medicine - \$10 (Helps ease the effects of diseases; Increases health)
\`2\`Exercise - \$25 (Boosts your immune system; Increases immune strength)
\`3\`Vaccine - \$NaN (Prevents you from getting some diseases; CURRENTLY DOESN'T WORK)
\`4\`Vitamins - \$25 (Does nothing... However uses the placebo effect to boost your immune; Increases immune strength)
\`5\`Essential Oils -\$50 (Does nothing... Uses the placebo effect to cure you; Has a chance of getting rid of a disease)
        `);
    }

    if( command === 'buy' || command === 'purchase' ) {
        if( !args[0] ) { // if there isn't an argument then
            return message.channel.send('Make sure to enter a number to purchase.');
        } else {
            const docRef = db.collection('users').doc(message.author.id);
            docRef.get().then(async function(doc) {
                if (doc.exists) { // if it does then update the player
                const data = doc.data();
                // TODO: too many ifs omg. replace with switch later. Also just replace with for loop & a list with the prices...
                    if( args[0] === '1' ) {
                        if( data.money < 10 ) {
                            return message.channel.send('You don\'t have enough money! Talk in chat to earn more!')
                        } else {
                            const temp = {
                                hp: data.hp+10,
                                money: data.money-10
                            }
                            await docRef.update(temp);
                            return message.channel.send('Purchased and applied! Use `stats` to check your updated stats.');
                        }
                    }
                    else if( args[0] === '2' ) {
                        if( data.money < 25 ) {
                            return message.channel.send('You don\'t have enough money! Talk in chat to earn more!')
                        } else {
                            const temp = {
                                money: data.money-25,
                                immune: data.immune+1
                            }
                            await docRef.update(temp);
                            return message.channel.send('Purchased and applied! Use `stats` to check your updated stats.');
                        }
                    }
                    else if( args[0] === '3' ) {
                        return message.channel.send('You cannot buy this item because it doesn\'t work.');
                    }
                    else if( args[0] === '4' ) {
                        if( data.money < 25 ) {
                            return message.channel.send('You don\'t have enough money! Talk in chat to earn more!')
                        } else {
                            const temp = {
                                money: data.money-25,
                                immune: data.immune+1
                            }
                            await docRef.update(temp);
                            return message.channel.send('Purchased and applied! Use `stats` to check your updated stats.');
                        }
                    }
                    else if( args[0] === '5' ) {
                        if( data.money < 50 ) {
                            return message.channel.send('You don\'t have enough money! Talk in chat to earn more!')
                        } else {
                            const cure = Math.floor(Math.random()*50)+1;
                            const split = data.problems.split(', ');
                            split.pop(); // get rid of the space @ end
                            const split2 = split;
                            if( cure == 1 ) { // 1/50 chance of cure
                                let shifted = split.shift(); // get rid of first element
                                let result = '';
                                for(let i = 0; i < split.length; i++) {
                                    result = result+split[i]+', '
                                }
                                await docRef.update({
                                    problems: result,
                                });
                            }
                            const temp = {
                                money: data.money-50
                            }
                            await docRef.update(temp);
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

    // Info command (information about stuff)
    if( command === 'info' || command === 'information' || command === 'help' ) {
        if( !args[0] ) { // if there isn't an argument then
            return message.channel.send(`
Prefix: \`${prefix}\`
> 
> Commands:
> 
Note things in <> are mandatory & things in [] are optional.
\`help [argument]\` -- Arguments specific to this command: \`about\`, \`start\`
\`help about\` -- About the creator of the bot.
\`help start\` -- Best method of using the bot.
\`ping\` -- Ping the server.
\`create <name>\` -- Create a new human.
\`delete\` -- Delete your human.
\`stats\` -- See the stats of your human.
\`store\` -- See items for sale.
\`buy <number>\` -- Purchase items in store.
            `);
        } else if( args[0] === 'about') {
            return message.channel.send(`
**Purpose:** To immitate real life.
**Created By:** Lo#4761
**Github:** https://github.com/randomlylelo/plague-Cord
**Repl.it:** https://repl.it/@randomlylelo/plague-Cord
            `);
        } else if( args[0] === 'start' ) {
            return message.channel.send(`
You earn money by talking in discord. (You are working, you will earn \$0-\$2 per message)
You spread and catch diseases by talking.
You can recover from diseases.
Your goal is to not die and earn \$200.
Have fun :)
> **Recommended method of playing:**
Gather a group of friends.
Delete any previous humans by using \`delete\`
Then create a new human using \`create <name>\`
After all friends created their human, then start chatting
First to make it to \$200 wins
            `);
        }
    }

    // Future Plan for leaderboard?
    return;
});

// When err, console log it
client.on('error', console.error);

client.login(process.env.TOKEN);