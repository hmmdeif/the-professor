import { instrument, conn, Direction, strategy } from '../state'
import chalk = require('chalk')

const getOrderHistory = () => {
  conn.sendData('private/orderhistory', {
    instrument: instrument.name,
    offset: 0,
    count: 20
  }, strategy.placeExits)
}

const updatePositionState = (position: any) => {
  instrument.position.amount = Math.abs(position.size)
  instrument.position.price = position.average_price
  instrument.position.direction = position.direction

  if (instrument.position.amount > 0) {
    console.log('Current position - ' + (position.direction === Direction.buy ? chalk.green('LONG') : chalk.red('SHORT')) + ' @ $' + position.average_price + ' for ' + chalk.yellow(instrument.position.amount))
    getOrderHistory()
  }
}

export const getPosition = () => {
  conn.sendData('private/get_position', {
    instrument_name: instrument.name
  }, updatePositionState)
}