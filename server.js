const functions = require('./functions.js');

const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth()
});

// changing somethin just to ignore something

functions.initClientServer(client)

client.initialize();
//console.log(client)