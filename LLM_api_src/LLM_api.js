const axios = require("axios")

async function getMessageFromAI(user_question) {
    var context = `
        Change everything here to implement your AI
    `
    const client = axios.create({
        baseURL: "http://localhost:25501/v1",
        headers: {"Authorization": "Bearer not-needed"}
    })
    
    const completion = {
        model: "local-model",
        messages: [
            {"role": "system", "content": context},
            {"role": "user", "content": user_question}
        ],
        temperature: 0.7
    }
   return client.post('/chat/completions', completion)
        .then(response => {
            return response.data.choices[0].message.content
        })
        .catch(err => {
            return "Não foi possível responder sua pergunta devido a um erro interno"
        })
}

module.exports = { getMessageFromAI }