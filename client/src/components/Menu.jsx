import React, { useState } from 'react'
import Cookies from 'universal-cookie'
const cookies = new Cookies();

const FormData = {
    connection: '',
    network: '',
    mode: '',
    playerCount: '2',
    username: 'Player',
    lobby: '',
}

const Menu = ({IsAdvanced, setIsAdvanced, setIsLocal, IsCreate, setIsCreate, setPlayerCount, setHideMenu, WebSocket, clientId, setUsernameList, setGameState, setActiveGroup, setMenuUpdate}) => {
    const [form, setForm] = useState(FormData);
    const [MenuLocal, setMenuLocal] = useState(true);

    const sendConnectionRequest = (form) => {
        const payLoad = IsCreate ? {
            method: "create",
            clientId: clientId,
            IsAdvanced: IsAdvanced ? true : false,
            playerCount: form.playerCount,
            Username: form.username
        } : {
            method: "join",
            clientId: clientId,
            gameId: form.lobby,
            Username: form.username
        }
        WebSocket.send(JSON.stringify(payLoad));
        cookies.set("Username", form.username, {"maxAge": 3600})
        setUsernameList([form.username, "Player 2", "Player 3"])
    }
    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
        if(e.target.id === 'Create') setIsCreate(true);
        if(e.target.id === 'Join'){
            setIsCreate(false)
            setMenuLocal(false)};
        if(e.target.id === 'Advanced' && !IsAdvanced) {
            setIsAdvanced(true);
            setActiveGroup([0,1,2,3,4,5,6,7,8])
            setGameState({})
            setMenuUpdate(preMenuUpdate => !preMenuUpdate)
        } 
        if(e.target.id === 'Classic' && IsAdvanced) {
            setIsAdvanced(false);
            setPlayerCount(2)
            setActiveGroup([0])
            setGameState({})
            setMenuUpdate(preMenuUpdate => !preMenuUpdate)
        }
        if(e.target.id === 'Online') setMenuLocal(false);
        if(e.target.id === 'Local') setMenuLocal(true);
        if(e.target.id === 'TwoPlayer') {
            setPlayerCount(2);
            setActiveGroup([0,1,2,3,4,5,6,7,8])
            setGameState({})
            setMenuUpdate(preMenuUpdate => !preMenuUpdate)
        }
        if(e.target.id === 'ThreePlayer') {
            setPlayerCount(3);
            setActiveGroup([0,1,2,3,4,5,6,7,8])
            setGameState({})
            setMenuUpdate(preMenuUpdate => !preMenuUpdate)
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLocal(MenuLocal);
        setHideMenu(true);
        if(!MenuLocal) {
            sendConnectionRequest(form);
        }
        if(MenuLocal) {
            setGameState({})
            setMenuUpdate(preMenuUpdate => !preMenuUpdate)
        }
    }
    return (
        <div className="menu__form-container">
            <div className="menu__form-container__inner">
                <form className="menu__form-container__inner_form" onSubmit={handleSubmit}>
                    <h1 className='menu__header'>Welcome to One-Five-Nine</h1>
                    <div className="menu__form-container__inner_button">
                        <input 
                            name="connection"
                            value="Create" 
                            type="radio"
                            id="Create"
                            onChange={handleChange}
                            required
                        />
                        <label htmlFor="Create"> Create</label>
                        <input 
                            name="connection" 
                            value="Join"
                            type="radio"
                            id="Join"
                            onChange={handleChange}
                        />
                        <label htmlFor="Join"> Join </label>
                    </div>
                    {IsCreate && (
                        <div className="menu__form-container__inner_button">
                            <input 
                                name="network"
                                value="Online" 
                                type="radio"
                                id="Online"
                                onChange={handleChange}
                                required
                            />
                            <label htmlFor="Online"> Online</label>
                            <input 
                                name="network" 
                                value="Local"
                                type="radio"
                                id="Local"
                                onChange={handleChange}
                            />
                            <label htmlFor="Local"> Local </label>
                        </div>
                    )}
                    {IsCreate && (
                        <div className="menu__form-container__inner_button">
                            <input 
                                name="mode"
                                value="Advanced" 
                                type="radio"
                                id="Advanced"
                                onChange={handleChange}
                            />
                            <label htmlFor="Advanced"> Advanced</label>
                            <input 
                                name="mode" 
                                value="Classic"
                                type="radio"
                                id="Classic"
                                onChange={handleChange}
                            />
                            <label htmlFor="Classic"> Classic </label>
                        </div>
                    )}
                    {IsCreate && IsAdvanced && (
                        <div className="menu__form-container__inner_button">
                            <input 
                                name="playerCount"
                                value="2" 
                                type="radio"
                                id="TwoPlayer"
                                onChange={handleChange}
                                required
                            />
                            <label htmlFor="TwoPlayer"> Two Player</label>
                            <input 
                                name="playerCount" 
                                value="3"
                                type="radio"
                                id="ThreePlayer"
                                onChange={handleChange}
                                required
                            />
                            <label htmlFor="ThreePlayer"> Three Player</label>
                        </div>
                    )}
                    {!MenuLocal && 
                        <div className="menu__form-container__inner_input">
                            <label htmlFor="username"> Please Enter A Username</label>
                            <input 
                                name="username" 
                                type="text"
                                placeholder="Player 1"
                                onChange={handleChange}
                                required
                            />
                        </div>
                    }
                    {(!MenuLocal && !IsCreate)  &&
                        <div className="menu__form-container__inner_input">
                            <label htmlFor="lobby"> Please Enter A Room Code</label>
                            <input 
                                name="lobby" 
                                type="text"
                                placeholder="Lobby"
                                onChange={handleChange}
                            />
                        </div>
                    }
                    <div className="menu__form-container__inner_button">
                        <button>{IsCreate ? "Create Game": "Join Game"}</button>
                    </div>
                </form>
                <div className="menu__form-container_copyright">
                    <p>Copyright &copy; Taylor Flynn. All Rights Reserved
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Menu
