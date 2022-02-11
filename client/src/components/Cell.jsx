import React from 'react'

const Cell = ({ActiveGroup, IsAdvanced, GameState, CellGroup, CellType, Index}) => {


    return (
        <div
        className={`test cell ${Index} ${ActiveGroup.includes(CellGroup) ? 'active':'inactive' } ${IsAdvanced ? '': 'node'} ${GameState[`cell ${Index}`] || ''} ${Object.keys(GameState).at(-1) === `cell ${Index}` && 'last'}`} 
        id={Index} 
        data_tag={CellGroup}
        type={CellType}
    >
    </div>
    )
}

export default Cell
