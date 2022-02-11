import React, {useState} from 'react';
import Cookies from 'universal-cookie';

import LogoutIcon from '../assets/logout2.png';
// import home from '../assets/home.png'
const cookies = new Cookies();

const NavBar = ({setHideMenu,PlayerCount, IsLocal, UsernameList, GameId, turnCount, WebSocket}) => {
    const [ShowLeaveGame, setShowLeaveGame] = useState(false);
    const highlightClass = PlayerCount === 3 ? ["Top", "Center", "Bottom"] : ["Top", "Bottom"]

    const ShowLeaveConfirm = () => {
        setShowLeaveGame(prevShowLeaveGame => !prevShowLeaveGame)
    }

    const logout = () => {
        cookies.remove('GameId');
        cookies.remove('Username');
        cookies.remove('ClientId');
        setHideMenu(false);
        WebSocket.close()
        window.location.reload()
    }

    const playerDiv = []

    for (let i=0; i < PlayerCount; i++) {
        const div = 
        <div className="navBar__player__container" key={"player " + i}>
            <div className="navBar_player_container-inner">
                <h1 className='Player__Name__Header'>{!IsLocal ? UsernameList[i] || `Player ${i +1}` : `Player ${i +1}`}</h1>
                { i === 0 && <div className="cell X" id="Xnav"></div>}
                { i === 1 && <div className="cell Circle" id="Circlenav"></div>}
                { i === 2 && <div className="cell Triangle" id="Trianglenav"></div>}
            </div>
        </div>
        playerDiv.push(div)
    }

    return (
        <div className="navBar__wrapper">
            <div className="navBar">
                <div className="navBar__icon__container">
                    <div className="navBar_icon_container-inner">
                        <img src={LogoutIcon} alt="Logout"onClick={ShowLeaveConfirm} />
                        <h1> {!IsLocal && GameId ? `Room: ${GameId}`: "1-5-9"}</h1>
                    </div>
                </div>
                <div className="navBar__players__container">
                    {playerDiv}
                    <div className={`navBar__highlight ${highlightClass[turnCount]}`}></div>
                </div>
            </div>
            <div className={`Leave__Game__Message ${ShowLeaveGame && 'show'}`} id="LeaveGame_Container">
                <div className="Leave__Game__Message__inner">
                    <div>Leave Game? </div>
                    <div className="Leave__Game__Message__buttons">
                        <button id="Continue" onClick={ShowLeaveConfirm}>Continue</button>
                        <button id="LeaveGame" onClick={logout}>Leave</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NavBar;