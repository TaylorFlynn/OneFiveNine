import React from 'react';

const ServerMessage = ({ShowServerMessage, setShowServerMessage, ServerMsg}) => {

    const HideServerMsg = () => {
        setShowServerMessage(prevShowServerMessage => !prevShowServerMessage)
    }
    
  return (
    <div className={`server__message__container ${ShowServerMessage && 'show'}`} id="server__message__container">
        <div className="server__message__inner">
            {ServerMsg}
            <button id="HideServerMessage" onClick={HideServerMsg}>X</button>
        </div>
    </div>
  )
};

export default ServerMessage;
