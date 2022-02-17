const dotenv = require('dotenv');
dotenv.config();
const http = require("http");
const mongoose = require('mongoose');
const websocketServer = require("websocket").server;
const Game = require('./DatabaseModels/GameState');

const httpServer = http.createServer();
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Http Listening on port: ${PORT}`));

const DB_URL = process.env.MONGO__URL || 'mongodb://localhost:27017/159';
mongoose.connect(DB_URL);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

//Hashmap Clients
const connections = new Map();

//  Unique ID Functions
function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}
const guid = () => (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();

//  WebSocket Server
const wsServer = new websocketServer({
    "httpServer": httpServer
});

wsServer.on("request", request => {
    const connection = request.accept(null, request.origin);
    try{
        let ClientId = null;
        let GameId = null;
        let Username = null;
        request.cookies.forEach((cookie)=> {
            if(cookie.name === "Username"){
                Username = cookie.value;
                console.log("UserName Cookie: " + Username);
            }
            if(cookie.name === "GameId"){
                GameId = cookie.value;
                console.log("GameId Cookie: " + GameId);
            }
            if(cookie.name === "ClientId"){
                ClientId = cookie.value;
                console.log( "ClientId Cookie: " +ClientId);
            }

        });
        const clientId = ClientId || guid()
        connection.clientId = clientId
        connections.set(clientId, connection)
        const payLoad = {
            "method": "connect",
            "clientId" : clientId
        }
        connection.send(JSON.stringify(payLoad))
        // console.log(wsServer.connections)
    } catch(error){
        console.log(error)
    }


    connection.on("open", () => console.log("opened!"))
    connection.on("close", async function () {
        try{
            const leaver = connection.clientId
            const lobby = connection.gameId
            if(lobby) {
                const game = await Game.findById(lobby);
                game.clients = game.clients.filter(c => c.clientId !== leaver);
                console.log(`${leaver} Closed Connection`);
                const payLoad = {
                    "method": "uniqueMessage",
                    "Msg": "A Player Has Left The Game"
                }
                game.clients.forEach(c =>{
                    connections.get(c.clientId).send(JSON.stringify(payLoad))
                })
                await game.save();
                if (game.clients.length === 0) {
                    await Game.findByIdAndDelete(lobby);
                    console.log(`Closed Lobby ${lobby}`);
                } 
            } else console.log(`${leaver} Closed Connection`);
            
        }catch(err){console.error(err)}
    })
    connection.on("message", message => {
        const result  = JSON.parse(message.utf8Data)

        switch (result.method) {
            case 'create':
                const clientId = result.clientId
                const gameId = S4().toUpperCase()
                connection.gameId = gameId

            generate = async () => {
                const game = new Game()
                game._id = gameId
                game.clients = [
                    {"clientId": clientId,
                    "Username": result.Username,
                    "markType": "X"}
                ] 
                game.IsAdvanced = result.IsAdvanced
                game.playerCount = result.playerCount
                game.ActiveGroup = result.IsAdvanced ? [0,1,2,3,4,5,6,7,8] : [0]
                game.state = {}
                game.activePlayer = 0
                await game.save()

                const payLoad = {
                    "method": "create",
                    "game": game
                }

                const recipients = connections.get(clientId);
                recipients.send(JSON.stringify(payLoad))
            }
            try{
                generate();
            }catch(err){console.error(err)}
                break;
            case 'join':
                console.log("A User Wants to Join")
                join = async () => {
                    const clientId = result.clientId;
                    const gameId = result.gameId;
                    const game = await Game.findById(gameId)
                    if (game.clients.length >= game.playerCount) {
                        const payLoad = {
                            "method": "uniqueMessage",
                            "Msg": "Sorry That Game Is Full!"
                        }
                        connection.send(JSON.stringify(payLoad))
                        return;
                    }
                    connection.gameId = gameId
                    const markType = {"0": "X", "1": "Circle", "2": "Triangle"}[game.clients.length]
    
                    game.clients.push({
                        "clientId": clientId,
                        "Username": result.Username,
                        "markType": markType
                    })

                    //Loop through all clients, inform Join
                    game.clients.forEach(con =>{
                        console.log(con.markType)
                        const payLoad = {
                            "method": "join",
                            "game": game,
                            "markType": con.markType
                        }
                        const recipient = connections.get(con.clientId);
                        recipient.send(JSON.stringify(payLoad))
                    })
                    game.save()
                }
                try{
                    join();
                }catch(err){console.error(err)}
                break;
            case 'play':
                console.log('play request :')
                play = async () => {
                    const gameId = result.gameId
                    const clientId = result.clientId
                    const cellId = result.cellId
                    const markType = result.markType
                    const game = await Game.findById(gameId)
                    if (game.playerCount !== game.clients.length) {
                        const payLoad = {
                            "method": "uniqueMessage",
                            "Msg": "Please Wait For All Players"
                        }
                        connection.send(JSON.stringify(payLoad))
                        return;
                    }
                    if(clientId !== game.clients[game.activePlayer].clientId) {
                        const payLoad = {
                            "method": "uniqueMessage",
                            "Msg": "Please Wait Your Turn :)"
                        }
                        connection.send(JSON.stringify(payLoad))
                        return;
                    }
                    game.ActiveGroup = result.ActiveGroup
                    game.state[cellId] = markType
                    game.markModified('state')
                    game.activePlayer++
                    if (game.activePlayer >= game.clients.length) game.activePlayer = 0

                    const payLoad = {
                        "method": "play",
                        "game": game,
                        "lastMark": cellId
                    }

                    game.clients.forEach(c =>{
                        connections.get(c.clientId).send(JSON.stringify(payLoad))
                    })

                    game.save()
                }
                try{
                    play();
                }catch(err){console.error(err)}
                break;
            case 'restart':
                restart = async () => {
                    const gameId = result.gameId
                    const clientId = result.clientId
                    const game = await Game.findById(gameId)
                    game.ActiveGroup = game.IsAdvanced ? [0,1,2,3,4,5,6,7,8] : [0]
                    game.state = {}
                    game.activePlayer = 0
                    const payLoad = {
                        "method": "restart",
                        "game": game
                    }
                    game.clients.forEach(c =>{
                        connections.get(c.clientId).send(JSON.stringify(payLoad))
                    })
                    game.save()
                }
                try{
                    restart();
                }catch(err){console.error(err)}
                break;
            default:
                console.log(result);
        }

    })
})