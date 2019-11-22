import { Client } from '../client'
import { instruments } from '../state'
import { placeExitOrder } from './update-exit-position'

const updatePositionState = (conn: Client, instrument: string, position: any) => {
  instruments[instrument].position.amount = Math.abs(position.size)
  instruments[instrument].position.price = position.average_price
  instruments[instrument].position.direction = position.direction

  if (instruments[instrument].position.amount > 0) {
    placeExitOrder(conn, instrument)
  }
}

export const getPosition = (conn: Client, instrument: string) => {
  conn.sendData('private/get_position', {
    instrument_name: instrument
  }, updatePositionState.bind(null, conn, instrument))
}