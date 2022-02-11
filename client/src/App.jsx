import React, { useState, useEffect} from 'react';
import { Board, Menu, NavBar} from './components';
import Cookies from 'universal-cookie';
import './App.css'
const cookies = new Cookies();
const WS = new WebSocket("ws://one-five-nine.herokuapp.com");

const App = () => {
    const [IsCreate, setIsCreate] = useState(true);
    const [PlayerCount, setPlayerCount] = useState(3);
    const [IsAdvanced, setIsAdvanced] = useState(true);
    const [HideMenu, setHideMenu] = useState(false);
    const [IsLocal, setIsLocal] = useState(true);
    const [WebSocket, setWebsocket] = useState(null);
    const [clientId, setclientId] = useState(cookies.get("ClientId") || null);
    const [GameId, setGameId] = useState(null);
    const [GameState, setGameState] = useState({});
    const [turnCount, setturnCount] = useState(0);
    const [ActiveGroup, setActiveGroup] = useState([0,1,2,3,4,5,6,7,8]);
    const [GameActive, setGameActive] = useState(true);
    const [UsernameList, setUsernameList] = useState(["Player 1", "Player 2", "Player 3"]);
    const [MyMarktype, setMyMarktype] = useState("X");
    const [ServerMsg, setServerMsg] = useState("Please Try Again");
    const [ShowServerMessage, setShowServerMessage] = useState(false);
    const [MenuUpdate, setMenuUpdate] = useState(null);

    function startGame() {
        setGameState({})
        setGameActive(true)
        setturnCount(0)
    }

    useEffect(() => {
        function handleResponse(response) {
            switch (response.method) {
                case 'connect':
                    const UserId = response.clientId;
                    console.log("Connected, Client id Set successfully " + UserId);
                    cookies.set("ClientId", UserId, {"maxAge": 3600})
                    console.log(UserId)
                    setclientId(UserId);
                    break;
                case 'create':
                    const gameId = response.game._id;
                    cookies.set("GameId", gameId, {"maxAge": 3600})
                    console.log(`Game ${gameId} Created`);
                    setGameId(gameId);
                    setIsLocal(false);
                    break;
                case 'join':
                    cookies.set("GameId", response.game._id, {"maxAge": 3600})
                    setIsAdvanced(response.game.IsAdvanced);
                    setPlayerCount(response.game.playerCount);
                    setIsLocal(false);
                    setGameId(response.game._id);
                    setActiveGroup(response.game.ActiveGroup);
                    if (response.game.clients.length === response.game.playerCount) {
                        const newUsernamelist= []
                        response.game.clients.forEach((client)=> newUsernamelist.push(client.Username))
                        setUsernameList(newUsernamelist)
                        setMyMarktype(response.markType)
                        startGame();
                    }
                    break;
                case 'play':
                    setActiveGroup(response.game.ActiveGroup)
                    setGameState(response.game.state);
                    break;
                case 'restart':
                    setIsLocal(false);
                    startGame()
                    setActiveGroup(response.game.ActiveGroup);
                    break;
                case 'uniqueMessage':
                    setShowServerMessage(true);
                    setServerMsg(response.Msg);
                    break;
                default:
                    console.log('message Received: '+ response);
            }
        }
        WS.onmessage = (message) => {
            const response = JSON.parse(message.data);
            handleResponse(response);
        }
        setWebsocket(WS);
    }, [])

    return (
        <div className="app__wrapper">
            {HideMenu && <NavBar 
                setHideMenu={setHideMenu} 
                PlayerCount={PlayerCount} 
                IsLocal={IsLocal}
                UsernameList={UsernameList}
                GameId={GameId}
                turnCount={turnCount}
                WebSocket={WebSocket}
                />
            }
            {!HideMenu && <Menu
                IsAdvanced = {IsAdvanced}
                setIsAdvanced = {setIsAdvanced}
                IsLocal = {IsLocal}
                setIsLocal = {setIsLocal}
                IsCreate={IsCreate}
                setIsCreate={setIsCreate}
                setPlayerCount={setPlayerCount}
                setturnCount={setturnCount}
                setHideMenu={setHideMenu}
                clientId={clientId}
                WebSocket={WebSocket}
                setUsernameList={setUsernameList}
                setGameState={setGameState}
                setActiveGroup={setActiveGroup}
                setGameActive={setGameActive}
                setMenuUpdate={setMenuUpdate}
                />
            }
            <Board
                IsAdvanced = {IsAdvanced}
                IsLocal = {IsLocal}
                PlayerCount={PlayerCount}
                setHideMenu={setHideMenu}
                HideMenu={HideMenu}
                WebSocket={WebSocket}
                clientId={clientId}
                GameState={GameState}
                setGameState={setGameState}
                setGameActive={setGameActive}
                GameId={GameId}
                GameActive={GameActive}
                turnCount={turnCount}
                setturnCount={setturnCount}
                ActiveGroup={ActiveGroup}
                setActiveGroup={setActiveGroup}
                MyMarktype={MyMarktype}
                ShowServerMessage={ShowServerMessage} 
                setShowServerMessage={setShowServerMessage} 
                ServerMsg={ServerMsg}
                MenuUpdate={MenuUpdate}
            />
        </div>
    )
}

export default App

