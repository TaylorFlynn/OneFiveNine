import React from 'react';

import Board from './Board';
import ServerMessage from './ServerMessage';


const BoardContainer = ({
    IsAdvanced,
    IsLocal,
    PlayerCount,
    WebSocket,
    clientId,
    GameState,
    setGameState,
    GameId,
    GameActive,
    setGameActive,
    turnCount,
    setturnCount,
    ActiveGroup,
    setActiveGroup,
    MyMarktype,
    ShowServerMessage,
    setShowServerMessage,
    ServerMsg
}) => {

    return (
        <>
            <ServerMessage ShowServerMessage={ShowServerMessage} setShowServerMessage={setShowServerMessage} ServerMsg={ServerMsg}/>
            <Board
                IsAdvanced={IsAdvanced}
                IsLocal={IsLocal}
                PlayerCount={PlayerCount}
                WebSocket={WebSocket}
                clientId={clientId}
                GameState={GameState}
                setGameState={setGameState}
                GameId={GameId}
                GameActive={GameActive}
                setGameActive={setGameActive}
                turnCount={turnCount}
                setturnCount={setturnCount}
                ActiveGroup={ActiveGroup}
                setActiveGroup={setActiveGroup}
                MyMarktype={MyMarktype}
            />
        </>
    )

}

export default BoardContainer;