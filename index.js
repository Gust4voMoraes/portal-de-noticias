const express = require("express");
const mongoose = require("mongoose")
const { path } = require("express/lib/application");
const pathh = require("path");
var bodyParser = require("body-parser");
const { type } = require("os");

const app = express();

const Posts = require("./Posts.js")

mongoose.connect("mongodb+srv://root:Gustavo_3002@cluster0.eg8go0d.mongodb.net/gmnews?retryWrites=true&w=majority",{useNewUrlParser: true, useUnifiedTopology: true}).then(function(){
    console.log("Conectado com sucesso");
}).catch(function(err){
    console.log(err.message);
})

// support parsing of application/json type post data
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");
app.use("/public", express.static(pathh.join(__dirname,"public")));
app.set("views", pathh.join(__dirname, "/pages"));


app.get("/",(req,res)=>{

    if (req.query.busca == null){
        Posts.find({}).sort({"_id": -1}).exec(function(err,posts){
            posts = posts.map(function(val){
                    return {
                        titulo: val.titulo,
                        conteudo: val.conteudo,
                        descricaoCurta: val.conteudo.substr(0,100),
                        imagem: val.imagem,
                        slug: val.slug,
                        categoria: val.categoria
                    }
            })

            Posts.find({}).sort({'views': -1}).limit(3).exec(function(err,postsTop){

                // console.log(posts[0]);
                postsTop = postsTop.map(function(val){
                        return {
                            titulo: val.titulo,
                            conteudo: val.conteudo,
                            descricaoCurta: val.conteudo.substr(0,100),
                            imagem: val.imagem,
                            slug: val.slug,
                            categoria: val.categoria,
                            views: val.views
                        }
                })
                res.render('home',{posts:posts,postsTop:postsTop});
            })

            
        })
        
    }else{

        Posts.find({titulo: {$regex: req.query.busca, $options:"i"}},function(err,posts){
            console.log(posts);
            posts = posts.map(function(val){
                return {
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricaoCurta: val.conteudo.substr(0,100),
                    imagem: val.imagem,
                    slug: val.slug,
                    categoria: val.categoria,
                    views: val.views
                }
        })
            res.render("busca",{posts:posts, contagem:posts.length});
        })

        
    }
})

app.get("/:slug", (req,res)=>{
    //res.send(req.params.slug);
    Posts.findOneAndUpdate({slug: req.params.slug}, {$inc : {views: 1}}, {new: true},function(err,resposta){
        //console.log(resposta);
        if(resposta != null){
            Posts.find({}).sort({'views': -1}).limit(3).exec(function(err,postsTop){

                // console.log(posts[0]);
                postsTop = postsTop.map(function(val){
                        return {
                            titulo: val.titulo,
                            conteudo: val.conteudo,
                            descricaoCurta: val.conteudo.substr(0,100),
                            imagem: val.imagem,
                            slug: val.slug,
                            categoria: val.categoria,
                            views: val.views
                        }
                })
                res.render('single',{noticia:resposta,postsTop:postsTop});
            })
        }else{
            res.redirect("/");
        }
        
    })    
})

app.listen(5000,()=>{
    console.log("server rodando");
})