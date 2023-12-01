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
        senha: senhaHash,
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

// Rota do Hash
app.get("/user/:id", verificacaoToken, async (req, res) =>{
    const id = req.params.id

    // Checagem do usuário
    const usuario = await User.findById(id, "-senha")

    if(!usuario){
        return res.status(404).json({ msg: 'Usuário não foi encontrado'})
    }
    res.status(200).json({ usuario })
})

// Verificação de Token
function verificacaoToken(req, res, next){

    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ msg: "Acesso negado!" });
    }

    try {
        const secret = process.env.SECRET;    
        jwt.verify(token, secret);    
        next();

      } catch (error) {
        console.error(error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'Sessão inválida' });
        }

        res.status(400).json({ msg: "O Token é inválido" });
      } 
    }

// Output


//Login

app.post("/auth/login", async (req, res) =>{
    const {email, senha} = req.body

    //Validações
    if(!email) {
        return res.status(422).json({msg: 'O email é obrigatório'})
    }

    if(!senha) {
        return res.status(422).json({msg: 'A senha é obrigatória'})
    }

    // checagem do usuário
    const usuario = await User.findOne({email: email})

    if(!usuario){
        return res.status(401).json({msg: 'Usuário e / ou senha inválidos!'})
    }

    // Checagem de senha
    const checagemSenha = await bcrypt.compare(senha, usuario.senha)

    if(!checagemSenha){
        return res.status(422).json({msg: 'Usuário e / ou senha inválidos!'})
    }

    try {
        const secret = process.env.SECRET;
        
        const token = jwt.sign(
        {
            id: usuario._id,
        },

        
        
        secret, {
            expiresIn:'30m',
            
        }
    );

      res.status(200).json({ msg: 'Autenticação realizada com sucesso', token })

    } catch(err){
        console.log(error)
        res.
        status(500).json({msg: error})
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


