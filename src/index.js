const express = require("express");
const path = require('path');
const Contenedor = require("./class/contenedor");
const Mensajes = require('./class/mensajes');

const handlebars = require('express-handlebars');
const { Server: HttpServer } = require("http");
const { Server: IOServer } = require("socket.io");

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true})) 

const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

const dataDirPath = path.resolve(__dirname, '../data/productos.json');
const msgDirPath = path.resolve(__dirname, '../data/mensajes.json');

const productos = new Contenedor(dataDirPath);
const mensajes = new Mensajes(msgDirPath);

const partialDirPath = path.resolve(__dirname, '../views/partials');

const layoutDirPath = path.resolve(__dirname, '../views/layouts');

//Conseguimos el path absoluto del esqueleto de nuestro HTML (layouts/index.hbs)
const defaultLayerPth = path.resolve(__dirname, '../views/layouts/main.hbs');

app.set('views engine', 'hbs')

app.use(express.static('./public'));

app.engine(
    "hbs",
    handlebars.engine({
        extname: 'hbs', 
        partialsDir: partialDirPath,
        layoutsDir: layoutDirPath, 
        defaultLayout: defaultLayerPth, 
        
    })
)

app.get("/", (req, res) => {
    let content = productos.content;
    let boolean = content.length !== 0;
    return res.render("layouts/main.hbs", {
      list: content,
      showList: boolean,
    });
  });
  
  app.post("/", (req, res) => {
    productos.save(req.body);
    let content = productos.content;
    let boolean = content.length !== 0;
    return res.render("layouts/main.hbs", { list: content, showList: boolean });
  });


  /* CHAT 
  io.on("connection", (socket) => {
      socket.emit("messages", messages);
    
      socket.on("new-message", (data) => {
        data.time = new Date().toLocaleString();
        messages.push(data);
        io.sockets.emit("messages", [data]);
      });
    });
   */
    io.on('connection', socket => {
      console.log('New conection', socket.id);
    
      socket.on('disconnect', () => {
        console.log(socket.id, 'disconnected');
      });
    
      socket.on('add-product', product => {
        // console.log(product);
    
        productos.addProduct(product);
    
        io.emit('update-products', product);
      });
    
      socket.on('message', async message => {
        const data = {
          email: message.email,
          message: message.message,
          date: new Date().toLocaleString(),
        };
    
        await mensajes.save(data);
    
        io.emit('message', data);
      });
    });
    
    app.use((err, req, res, next) => {
      console.log(err);
      res.status(500).json({ err, message: 'Algo salió mal' });
    });
    
    const PORT = process.env.PORT || 8080;
    
    httpServer.listen(PORT, () => {
      console.log(`SERVER UP EN PORT http://localhost:${PORT}`);
    });
    
    httpServer.on('error', err => {
      console.log(`Algo salio mal: ${err}`);
    });
