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
          <div className='d-flex justify-content-center mb-2'>
            <b className='text-danger'>Dragon Tiger session</b>
          </div>
          <DragonTiger />
        </div>
        <div className="col-sm-6">
          <div className='d-flex justify-content-center mb-2'>
            <b className='text-danger'>Andar Bahar Session</b>
          </div>
          <AndarBahar />
        </div>
      </div>
    </div>
  )
}

export default SurathDash