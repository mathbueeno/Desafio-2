// importações
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()

// Models
const User = require('./models/User');

// JSON
app.use(express.json());


app.get('/', (req, res) => {
    res.status(200).json({ msg: 'Desafio 2' })
});



// Registro do Usuário

app.post("/auth/registro", async (req, res) => {

    const {nome, email, senha, confirmSenha, telefone} = req.body
    
    // Validações
    if(!nome) {
        return res.status(422).json({msg: 'O nome é obrigatório'})
    }

    if(!email) {
        return res.status(422).json({msg: 'O email é obrigatório'})
    }

    if(!senha) {
        return res.status(422).json({msg: 'A senha é obrigatória'})
    }

    
    if(senha !== confirmSenha){
        return res
        .status(422)
        .json({msg: 'Senhas não conferem'})
    }

    if(!telefone) {
        return res.status(422).json({msg: 'O telefone é obrigatório'})
    }


    
    // Checando através do banco de dados
    const usuarioExiste = await User.findOne({email: email})

    if(usuarioExiste){
        return res.status(422).json({msg: 'Email já existente!'})
    }

    // Criação de senha
    const salt = await bcrypt.genSalt(12);
    const senhaHash = await bcrypt.hash(senha, salt);

    // Criação de Usuário
    const usuario = new User({
        nome,
        email,
        senhaHash,
        telefone
    });


    try{

        await usuario.save();

        res.status(201).json({msg: 'Usuário criado com sucesso'});

    } catch(error){
        console.log(error)
        res
        .status(500).json({msg: error})
    }
});













// Credenciais do banco
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;


mongoose
.connect(
    `mongodb+srv://${dbUser}:${dbPassword}@cluster0.wa90p7m.mongodb.net/?retryWrites=true&w=majority`
    )
.then(() => {
    console.log('Conectou no banco');
    app.listen(3000);
})
.catch((err) => console.log(err));


