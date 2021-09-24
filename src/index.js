const Discord= require('discord.js')
const config = require("./Data/config.json")
const Distube = require('distube')

const client = new Discord.Client({ 
    partials : ["CHANNEL","MESSAGE"],
    restTimeOffset :0,
    intents :14023
});

const distube = new Distube(client,{
    searchSongs : false,
    emitNewSongOnly :true
});


const prefix =config.prefix
const ruleChannel = '890858802788835329'
const welcomeChannel= '890858785600585738'
const generalChat = '889382427741544512'


client.on("ready", () => {
    console.log(`${client.user.username} is Online`)
})


client.on('guildMemberAdd', member =>{
    
    const newEmbed = new Discord.MessageEmbed()
    .setColor('RANDOM')
    .setTitle(`Welcome To ${member.guild.name}`)
    .setDescription(`Hello <@${member.user.id}>, Welcome to **${member.guild.name}**. Thanks For Joining Our Server.
     Please Read ${member.guild.channels.cache.get(ruleChannel).toString()}. Have a Nice Time.
     You can Chat with server members In <#${generalChat}>`)
    .setThumbnail(member.user.displayAvatarURL({dynamic: true, size: 1024}))
    .setFooter('Thank You for joining the server');

    member.guild.channels.cache.get(welcomeChannel).send(
        newEmbed
    ); 
});

 
client.on("message", async(message) => {

    if (message.author.bot) return
    if(!message.content.startsWith(prefix)) return;
    
    const args = message.content.slice(prefix.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase();
 
    if(command ==='play'){
        if(!message.member.voice.channel) return message.channel.send(`Please Join a Voice Channel to play songs`)
        if(!args[0]) return message.channel.send(`Please enter a song name `)
        distube.play(message,args.join())
    }
    
    if(command==='stop'){
        const bot = message.guild.members.cache.get(client.user.id)
        if(!message.member.voice.channel) return message.channel.send(`Please Join a Voice Channel `)
        if(bot.voice.channel!==message.member.voice.channel) return message.channel.send(`You are not in the same Voice Channel`)
        distube.stop(message)
        message.channel.send(`<@${message.author.id}> stopped the music`)
    }

    if(command==='pause'){
        const bot = message.guild.members.cache.get(client.user.id)
        if(!message.member.voice.channel) return message.channel.send(`Please Join a Voice Channel `)
        if(bot.voice.channel!==message.member.voice.channel) return message.channel.send(`You are not in the same Voice Channel`)
        distube.pause(message)
        message.channel.send(`<@${message.author.id}> paused the music`)
    }

    if(command==='resume'){
        const bot = message.guild.members.cache.get(client.user.id)
        if(!message.member.voice.channel) return message.channel.send(`Please Join a Voice Channel `)
        if(bot.voice.channel!==message.member.voice.channel) return message.channel.send(`You are not in the same Voice Channel`)
        distube.resume(message)
    }
    if(command==='skip') distube.skip(message)


    if (command == "queue") {
        let queue = distube.getQueue(message);
        message.channel.send('Current queue:\n' + queue.songs.map((song, id) =>
            ` **${id + 1}**. ${song.name} - \`${song.formattedDuration}\`` 
        ).slice(0, 10).join("\n"));
    }
    if(command==='dc') {
        message.channel.send(`**ADIOS AMIGOS**`)
        message.guild.me.voice.channel.leave()
    }
    if(command === 'ping'){
        message.channel.send('Loading data').then (async (msg) =>{
            msg.delete(); message.reply(`🏓Latency is ${msg.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
        })
    }
    if (command == "jump"){
        const bot = message.guild.members.cache.get(client.user.id)
        if(!message.member.voice.channel) return message.channel.send(`Please Join a Voice Channel `)
        if(bot.voice.channel!==message.member.voice.channel) return message.channel.send(`You are not in the same Voice Channel`)
        distube.jump(message, parseInt(args[0])).catch(err => message.channel.send("Invalid song number."));
    }

    if(command === 'clear'){
        if(!message.member.hasPermission('ADMINISTRATOR',{checkAdmin:true,checkOwner:true}))
        message.reply(`Sorry , You are not privlidged to use this command`)
        else deleteMessages(args[0],message)
    }

    if(command==='kick'){
        if(!message.member.hasPermission('ADMINISTRATOR',{checkAdmin:true,checkOwner:true}))
        message.reply(`Sorry , You are not privlidged to use this command`)
        else kickMember(message)
    }
    
    if(command==='ban'){
        if(!message.member.hasPermission('ADMINISTRATOR',{checkAdmin:true,checkOwner:true})){
            message.reply(`Sorry , You are not privlidged to use this command`)
        }
        else{
            let member = message.mentions.members.first();
            if(!member) return message.reply("Please mention a valid member of this server");
            member.ban({reason : 'lodu tha bhsodiwala'});
        }
    }

    if(command === 'help')
    helpEmbed(message)

    if(command === 'rules'){
        const newEmbed = new Discord.MessageEmbed()
        .setColor('RANDOM')
        .setTitle('SERVER RULES')
        .setDescription('Rules List (please read carefully)')
        .addFields(
            {name :'Rule 1' , value : 'Please be nice to everyone'},
            {name :'Rule 2' , value : 'Follow me on Instagram https://www.instagram.com/ma7ksman '},
            {name :'Rule 3' , value : 'Gaali dena allowed hai ' }
        )
        .setImage('https://www.nycomdiv.com/wp-content/uploads/sites/381/2017/07/Know-the-Rules-320x242.png')
        .setFooter('Thank You for joining the server')
        .setURL('https://www.youtube.com/channel/UCkBOj-Fo4DQDVEkor4yUixg/');
        message.channel.send(newEmbed)
    }

    if(command === 'youtube'||command === 'yt')
    message.reply('https://www.youtube.com/channel/UCkBOj-Fo4DQDVEkor4yUixg/');

})

const status = (queue) => `Volume: \`${queue.volume}%\` | Filter: \`${queue.filter || "Off"}\` | Loop: \`${queue.repeatMode ? queue.repeatMode == 2 ? "All Queue" : "This Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;

    distube
    .on("playSong", (message, queue, song) => message.channel.send(
        new Discord.MessageEmbed().setTitle(`Playing \`${song.name}\` - \`${song.formattedDuration}\`\nRequested by: ${song.user.username}\n${status(queue)}`)
        .setColor('RANDOM')
    ))
    .on("addSong", (message, queue, song) => message.channel.send(
        `Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`
    ))
    .on("playList", (message, queue, playlist, song) => message.channel.send(
        `Play \`${playlist.name}\` playlist (${playlist.songs.length} songs).\nRequested by: ${song.user}\nNow playing \`${song.name}\` - \`${song.formattedDuration}\`\n${status(queue)}`
    ))
    .on("addList", (message, queue, playlist) => message.channel.send(
        `Added \`${playlist.name}\` playlist (${playlist.songs.length} songs) to queue\n${status(queue)}`
    ))
    // DisTubeOptions.searchSongs = true
    .on("searchResult", (message, result) => {
        let i = 0;
        message.channel.send(`**Choose an option from below**\n${result.map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")}\n*Enter anything else or wait 60 seconds to cancel*`);
    })
    // DisTubeOptions.searchSongs = true
    .on("searchCancel", (message) => message.channel.send(`Searching canceled`))
    .on("error", (message, e) => {
        console.error(e)
        message.channel.send("An error encountered: " + e);
    });


const deleteMessages = function(count,message){
    let cnt = Number.parseInt(count)
    if(isNaN(cnt) || !cnt || cnt<1 ||cnt>100) return message.channel.send('Please enter a valid range')
    message.channel.bulkDelete(cnt);
    return message.channel.send(`Deleted ${cnt} messages`).then(async (msg)=>msg.delete())
}

const helpEmbed =function(message){
    const help= new Discord.MessageEmbed()
    .setTitle(`Commands List`)
    .setDescription(`Read All Carefully`)
    .setColor('RED')
    .addFields(
        {name:"prefix" ,value : '`!`'},
        {name :'Everyone Commands' , value : '`ping` , `rules`'},
        {name :'DJ commands' , value : '`play` , `pause` , `resume` ,`skip` `jump` , `queue` ,`dc`'},
        {name :"Admin Commands" , value : ' `clear` , `kick`, `ban`'}
    )
    message.channel.send(help)
}

const kickMember = function(message){
    let member = message.mentions.members.first();
    if(!member) return message.reply("Please mention a valid member of this server");
    member.kick(`Aise hi Sexy Lag raha tha`)
}



client.login(config.token);