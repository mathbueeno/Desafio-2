const mongoose = require('mongoose');

const User = mongoose.model('User', {
    nome: String,
    email: String,
    senha: String,
    telefone: [
        {
            numero: {
                type: String,
                required: true,
            },
            ddd: {
                type: String,
                required: true,
            },
        },

    ],
})

module.exports = User
