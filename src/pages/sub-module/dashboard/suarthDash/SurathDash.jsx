import React from 'react'
import Surath from './games/Surath'
import DragonTiger from './games/DragonTiger'
import AndarBahar from './games/AndarBahar'

function SurathDash() {
  return (
    <div>
      <div className="row">
        {/* <div className="col-sm-4">
          Surath Session
          <Surath />
        </div> */}
        <div className="col-sm-6">
          Dragon Tiger session
          <DragonTiger />
        </div>
        <div className="col-sm-6">
          Andar Bahar Session
          <AndarBahar />
        </div>
      </div>
    </div>
  )
}

export default SurathDash