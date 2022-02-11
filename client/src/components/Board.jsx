import React, {useState, useEffect, useRef} from 'react'
import { ServerMessage } from '.';
import Cell from './Cell'

const Board = ({
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
    ServerMsg,
    MenuUpdate
}) => {
    // function TestBoard() {
    //     Boards.current = []
    //     Cells.current = []
    //     for (let i = 0, k = 0 ; i < NumberOfBoards; i++) {
    //         const cells = []
    //         for (let j = 0; j < 9; j++) {
    //             const cell = <Cell
    //             ActiveGroup={ActiveGroup}
    //             IsAdvanced={IsAdvanced}
    //             GameState={GameState}
    //             CellGroup={i}
    //             CellType={j}
    //             Index={k}
    //             key={'cell '+k}
    //             onClick={(e)=> handleClick(e)}
    //             />
    //             Cells.current[k] = cell
    //             cells.push(cell)
    //             k++
    //         }
    //         const board =<div className={`board ${i} ${markTypes[turnCount]} active`} id={`board ${i}`} key={'board'} tag={i}>{cells}</div>
    //         Boards.current[i]=board
    //     }
    // }
    // TestBoard()
    function MakeBoard () {
        Boards.current = []
        Cells.current = []
        for (let i = 0, k = 0 ; i < NumberOfBoards; i++) {
            const cells = []
            for (let j = 0; j < 9; j++) {
                const cell = <div 
                        className={`cell ${k} ${ActiveGroup.includes(i) ? 'active':'inactive' } ${IsAdvanced ? '': 'node'} ${GameState[`cell ${k}`] || ''} ${Object.keys(GameState).at(-1) === `cell ${k}` && 'last'}`} 
                        id={k} 
                        key={'cell '+k}
                        data_tag={i}
                        type={j}
                        onClick={(e) => handleClick(e)}
                    >
                    </div>
                Cells.current[k] = cell
                cells.push(cell)
                k++
            }
            const board = IsAdvanced ? 
            <div className="node" key={`node ${i}`}>
                    <div 
                        className={`board ${i} ${ActiveGroup.includes(i) ? `${IsLocal ? markTypes[turnCount]: MyMarktype} active`: 'inactive' }`}
                        id={`board ${i}`} key={`board ${i}`} 
                        tag={i}
                    >
                        {cells}
                    </div>
            </div>
            : <div className={`board ${i} ${IsLocal ? markTypes[turnCount]: MyMarktype} active`} id={`board ${i}`} key={'board'} tag={i}>{cells}</div>
            Boards.current[i]=board
        }
    }
    const NumberOfBoards = IsAdvanced ? 9 : 1;
    const markTypes = ['X', 'Circle', 'Triangle'];
    const Cells = useRef([])
    const Boards = useRef([])
    const EndGameMessage = useRef("Game Over")
    const [WINNING_COMBINATIONS, setWINNING_COMBINATIONS] = useState([])

    MakeBoard()

    function checkWin() {
        return WINNING_COMBINATIONS.some(combination => {
          return combination.every(index => {
            return Cells.current[index].props.className.includes(markTypes[turnCount])
          })
        })
    }

    function isDraw() {
        return Cells.current.every(cell => {
          return !isEmpty(cell)
        })
    }

    function isStalemate() {
        if(!IsAdvanced) return false;
        const activeCells = Cells.current.filter((cell) => ActiveGroup.includes(cell.props.data_tag))
        return activeCells.every(cell => {
          return !isEmpty(cell)
        })
    }

    function isEmpty(cell){
        return !markTypes.some(mark => cell.props.className.includes(mark))
    }

    useEffect (() => {
        try{
        setturnCount(prevturnCount => prevturnCount += 1);
        if(turnCount >= PlayerCount-1) setturnCount(prevturnCount => prevturnCount = 0);
            if(checkWin() || isDraw() || isStalemate()) setGameActive(false);
            if(isStalemate()) EndGameMessage.current = ('Stalemate');
            if(isDraw()) EndGameMessage.current = ('Draw');
            if(checkWin()) EndGameMessage.current = (`${markTypes[turnCount]}'s Win!`);

        }
        catch(err){console.log(err)}

    }, [GameState]);

    useEffect (() => {
        setturnCount(0);
    }, [GameActive]);

    useEffect (() => {
        setturnCount(0);
    }, [MenuUpdate]);

    useEffect (() => {
        const WinCons = []
        let Win_Pattern = [[0, 1, 2],[3, 4, 5],[6, 7, 8],[0, 3, 6],[1, 4, 7],[2, 5, 8],[0, 4, 8],[2, 4, 6],]
        for (let i = 0; i < NumberOfBoards; i++) {
            Win_Pattern.forEach(e => WinCons.push(e));
            Win_Pattern = Win_Pattern.map(item => item.map(item1 => item1 + 9));
        }
        setWINNING_COMBINATIONS(WinCons)
    }, [IsAdvanced]);

    function restartGame() {
        if(!IsLocal) {
        sendRestartRequest();
        return;
        }
        setActiveGroup([0,1,2,3,4,5,6,7,8]);
        setGameState({});
        setGameActive(true);
    }
    
    function handleClick (e) {
        e.preventDefault();
        if(!GameActive) return;
        const cell = Cells.current[e.target.id]
        const cellId = cell.props.id
        const group = cell.props.data_tag
        const type = cell.props.type
        if(!ActiveGroup.includes(group)) return;
        if (GameState['cell '+cellId]) return;

        if(!IsLocal) {
            sendPlayRequest(e.target.id, type);
            return;
        } else {
            setGameState({...GameState, ['cell '+cellId]: markTypes[turnCount]})
            IsAdvanced && setActiveGroup([type])
            !IsAdvanced && setActiveGroup([0])
        }
    }

    function sendPlayRequest(cellId, type) {
        const payLoad = {
            method: "play",
            'clientId': clientId,
            "gameId": GameId,
            "cellId": 'cell '+cellId,
            "markType": markTypes[turnCount],
            "ActiveGroup": IsAdvanced ? type : 0
        }
        WebSocket.send(JSON.stringify(payLoad));
    }

    function sendRestartRequest(){
        const payLoad = {
            method: "restart",
            'clientId': clientId,
            "gameId": GameId,
        }
        WebSocket.send(JSON.stringify(payLoad));
    }
    
    // function TestFn() {
    //     console.log(clientId)
    // }
   return (
        <div className="board__container">
            <ServerMessage ShowServerMessage={ShowServerMessage} setShowServerMessage={setShowServerMessage} ServerMsg={ServerMsg}/>
           {/* <div className="TestFn">
               <button onClick={TestFn}>Test Button</button><br/>
            </div> */}
            <div className="Main">
                {IsAdvanced?
                <div className="nest">
                    {Boards.current}
                </div>:
                Boards.current
                }
            </div>
            <div className={`winning-message ${!GameActive && 'show'}`} id="winningMessage">
                {<div>{EndGameMessage.current}</div>}
                <button id="restartButton" onClick={restartGame}>Restart</button>
            </div>
        </div>
        
   )
}

export default Board
