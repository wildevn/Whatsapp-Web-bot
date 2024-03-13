const messages_obj = {
    'start_message': 'Olá, bem vindo a nossa loja',
    'options': {
                    '0': 'null',
                    '1': 'Create a new branch',
                    '2': 'Edit an existing branch',
                    '1.1': 'Test to create',
                    '1.2': 'Copy and paste an existing branch',
                    '1.3': 'return to the last option',
                    '2.1': 'vb 1',
                    '2.2': 'shift it to the next one',
                    '2.3': 'Return to the last option',
                    '1.1.1': 'Create with name 54',
                    '1.1.2': 'Create a no nAme',
                    '1.1.3': 'Return to the last option',
                    '1.2.1': 'Name Gfk',
                    '1.2.2': 'Name GLX',
                    '1.2.3': 'Return to the last option',
                    '2.1.1': 'Concluido com sucesso: vb 1',
                    '2.2.1': 'name 1',
                    '2.2.2': 'Return to the last option',
                    '1.1.1.1': 'Concluido com sucesso: Create with name 54',
                    '1.1.2.1': 'Concluido com sucesso: Create a no nAme',
                    '1.2.1.1': 'Concluido com sucesso: Name Gfk',
                    '1.2.2.1': 'Concluido com sucesso: Name GLX',
                    '2.2.1.1': 'Concluido com sucesso: name 1',
                },
    'select_option': 'Please, select one of the following options: ',
    'last_message': 'Aguardamos ansiosamente pela sua volta!',
    'wrong_message': 'Opção inexistente, as opções disponíveis são:'
}

// Get the last message of the bot and the user
function searchMessages(message_list) {
    let bot_msg, user_msg
    for (let i = 9; i <= 0; i--) {
        if(message_list[i][0] && bot_msg == undefined)
            bot_msg = message_list[i][3]
        else if(!message_list[i][0] && user_msg == undefined)
            user_msg = message_list[i][3]
        if(bot_msg != undefined && user_msg != undefined)
            return [user_msg, bot_msg]
    }
    return [user_msg]
}

// Gets the origin key of the message
function getOriginMessage(user_msg, bot_msg) {
    let message_list = {}
    bot_msg.split('\n').forEach(line => {
        line = line.split('.')
        message_list[line[0]] = line[1]
    })
    for (key in messages_obj['options']) {
        if(messages_obj['options'][key] == message_list[user_msg])
            return key
    }
    return undefined   
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
    console.log(`user_msg: ${user_msg}, bot_msg: ${user_msg}`)
    if(bot_msg == undefined) // if a welcome message was not sent
        return [messages_obj['start_message'], createMessage('0')]
    origin_key = getOriginMessage(user_msg, bot_msg)
    if(origin_key == undefined) // If the user chose a wrong number
        return [messages_list['wrong_message'], bot_msg]
    else if(messages_obj['options'][origin_key] == 'Return to the last option') // In case to return to the last menu
        return [createMessage(origin_key.slice(0, -4))]
    return [createMessage(origin_key)]
}

//console.log(getOriginMessage('1', createMessage('1.1')))
//console.log(createMessage('0'))
//console.log(createMessage('1.2'))

//console.log('1.1.2'.slice(0, -2))
//console.log('!1'.slice)
var x, y
y = 5
console.log(x == undefined, y == undefined)
for (key in messages_obj['options'])
    console.log('messages_obj[options][key]: ', messages_obj['options'][key])