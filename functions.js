const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { Buttons } = require('whatsapp-web.js');
const getMessageFromAI = require('./LLM_api_src/LLM_api.js')

const messages_obj = {
    '0': 'Olá, trabalho com a consultora feminina detox, tudo bem?',
    '1.0': 'Estou muito bem, obrigado por perguntar. Gostaria de saber seu nome',
    '1.1': 'Perfeito...Qual seu nome?',
    '2': 'Que legal, maneiro, quais informações você gostaria de saber sobre o lift detox?'
}
/* structure: {'date': [], 'chat_messages': [], 'last_messages_bot_ids': []}*/
var contacts_messages_obj_list // holds all the chats messages during a day, after that will be deleted
/* var chats_watchdog = setInterval(() => {
    call the function to verify if the chat is within the specified time or need to be deleted
3600000*})*/

function initClientServer(client) {
    client.on('qr', (qr) => {
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log('Client is ready!');
        contacts_messages_obj_list = {}
    });

    client.on('message', async (message) => {
        var messages_list_to_send, interval_between_msgs, i

        //console.log(message.body)
        if(message.body.includes('!')) {
            // console.log(messages_list) /////////////////// change the "!"    !!!!!
            /*await verifyChat(client, message)
            
            // selectMessageToSend now receives the id of the chat
            messages_list_to_send = selectMessageToSend(message.id.remote) // might need to change the structure of the function

            i = 0
            interval_between_msgs = setInterval(() => { // send the messages with a difference of 1 sec of each msg
                client.sendMessage(message.from, messages_list_to_send[i])
                i++
            }, 1000);
            while(i < messages_list_to_send.length);
            clear(interval_between_msgs) // need confirmation after
            /*var buttons = new Buttons('Msg before buttons...', [
                {id: 'x.1', body:'teste botao1'},
                {body:'testss botao teste'}
            ])
            await client.sendMessage(message.from, buttons)*/
            var message_to_send = await getMessageFromAI(message.body.split('!')[1])
            await client.sendMessage(message.from, message_to_send)
        }
    });

    client.on('authenticated', () => { // Save the session data for future use
        console.log('Session data loaded');
    });
}

async function getAllMessages(client, message) {
    const chats = await client.getChats();
    var chat, messages_list
    messages_list = []
    chats.forEach(single_chat => { // may be optimized
        if (single_chat.id._serialized == message.id.remote) {
            chat = single_chat
        }
    })
    if (chat != undefined) {
        const messages = await chat.fetchMessages({ limit: 10 }); // Adjust the limit as needed
        messages.forEach(message => {
            messages_list.push([message.id.fromMe, (new Date(message.timestamp * 1000)).toDateString(), (new Date(message.timestamp * 1000)).toTimeString(), message.body])
        });
        return messages_list
    }
    else {
        console.log("Couldn't find the chat related to the message...")
        console.log(message)
    }

}

async function verifyChat(client, message) {
    if(contacts_messages_obj_list[message.id.remote] == undefined) {
        var messages_list = await getAllMessages(client, message) 
        contacts_messages_obj_list[message.id.remote] = {'date': [new Date(message.timestamp * 1000), new Date(message.timestamp * 1000)]}
        contacts_messages_obj_list[message.id.remote]['chat_messages'] = messages_list
        searchMessages(message, messages_list, 1)
        // need to be called the function to verify the messages from the bot
    }
    else {
        contacts_messages_obj_list[message.id.remote]['date'][1] = new Date(message.timestamp * 1000) // maybe need to change
        contacts_messages_obj_list[message.id.remote]['chat_messages'].push([message.id.fromMe, (new Date(message.timestamp * 1000)).toDateString(), (new Date(message.timestamp * 1000)).toTimeString(), message.body])
    }
}

// Get the last message of the bot and the user or puts in the chat_msgs_obj the id of each message sent by the bot
function searchMessages(message, message_list, is_bot) {
    let bot_msg, user_msg
    if(is_bot)
        contacts_messages_obj_list[message.id.remote]['last_messages_bot_ids'] = []
    for (let i = 9; i >= 0; i--) { // get the last ones
        //console.log(i, message_list[i], message_list[i-1])
        //console.log('from me? ', message_list[i][0], 'bot: ', bot_msg, 'user: ', user_msg)
        if(!is_bot) {
            if(message_list[i][0] && bot_msg == undefined)
                bot_msg = message_list[i][3]
            else if(!message_list[i][0] && user_msg == undefined)
                user_msg = message_list[i][3]
            if(bot_msg != undefined && user_msg != undefined)
                return [user_msg.slice(-1), bot_msg] ////// Has to be changed to not contain the '!'
        }
        else if(message_list[i][0])
            contacts_messages_obj_list[message.id.remote]['last_messages_bot_ids'].unshift(getOriginMessage('', message_list[i][3], is_bot))
    }
    return is_bot ? null : [user_msg.slice(-1)]
}

// Gets the origin key of the message
function getOriginMessage(user_msg, bot_msg, is_bot) {
    let message_list = {}
    if(!is_bot) { // need to be changed when the user sends a message
        bot_msg.split('\n').forEach(line => {
            line = line.split('.')
            message_list[line[0]] = line[1]
        })
        for (key in messages_obj) {
            console.log('messages_obj[options][key]: ', messages_obj['options'][key], 'message_list[user_msg]: ', message_list[user_msg], messages_obj['options'][key] == message_list[user_msg])
            if(messages_obj['options'][key] == message_list[user_msg])
                return key
        }
        return undefined   
    }
    else {
        for (key in messages_obj) {
            console.log('messages_obj[key]: ', messages_obj[key], 'bot_msg ', bot_msg, messages_obj[key] == bot_msg)
            if(messages_obj[key] == bot_msg)
                return key
        }
        return '5656' // this code means that the owner had sent a message on this chat
    }
}

// Create the message that will be sent to the private chat
function createMessage(option_number) {
    let i = 1;
    if((option_number != '0' && messages_obj['options'][option_number + '.2'] != undefined) || option_number == '0') {
        var message_to_send = '' + messages_obj['select_option']
        if(option_number != '0')
            while(true) {
                if(messages_obj['options'][option_number + `.${i}`] == undefined)
                    break
                else 
                    message_to_send += `\n${i}.${messages_obj['options'][option_number + `.${i}`]}` 
                i++
            }
        else
            while(true) {
                if(messages_obj['options'][`${i}`] == undefined)
                    break
                else 
                    message_to_send += `\n${i}.${messages_obj['options'][`${i}`]}` 
                i++
            }
        return message_to_send
    }
    return `${messages_obj['options'][option_number + '.1']} !!!!!`
}


function selectMessageToSend(messages_list) {
    let user_msg, bot_msg, origin_key

    [user_msg, bot_msg] = searchMessages(messages_list)
    console.log(`user_msg: ${user_msg}, bot_msg: ${bot_msg}`)
    if(bot_msg == undefined) // if a welcome message was not sent
        return [messages_obj['start_message'], createMessage('0')]
    origin_key = getOriginMessage(user_msg, bot_msg)
    console.log('origin key: ', origin_key)
    if(origin_key == undefined) // If the user chose a wrong number
        return [messages_list['wrong_message'], bot_msg]
    else if(messages_obj['options'][origin_key] == 'Return to the last option') // In case to return to the last menu
        return [createMessage(origin_key.slice(0, -4))]
    return [createMessage(origin_key)]
}

// obsolute function, going to be deleted soon
async function printOptions(client, message, location_to_print) {
    var message_string = ''
    if(location_to_print != 'start_message' && location_to_print != 'last_message' && location_to_print != 'wrong_message') {
        message_string += messages_obj[location_to_print][0] + '\n'
        for (let i = 0; i < messages_obj[location_to_print][1].length; i++) 
            message_string += '' + (i + 1) + + messages_obj[location_to_print][1]['' + i] + '\n'
    }
    else 
        message_string += messages_obj[location_to_print][0]

    //message.reply(`${messages_obj[location_to_print]}`)
}

module.exports = { initClientServer }