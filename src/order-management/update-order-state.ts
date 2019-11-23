import { removeOrderIfExists } from './remove-order'
import { Client } from '../client'
import { instruments } from '../state'
import { placeExitOrder } from './update-exit-position'

const updateOpenPosition = (conn: Client, order: any) => {
  if (order.filled_amount > 0) {
    if (order.direction === instruments[order.instrument_name].position.direction) {
      const newTotal = instruments[order.instrument_name].position.amount + order.filled_amount
      instruments[order.instrument_name].position.price = ((instruments[order.instrument_name].position.price * instruments[order.instrument_name].position.amount) + (order.filled_amount * order.price)) / newTotal
      instruments[order.instrument_name].position.amount = newTotal
    } else {
      const newTotal = instruments[order.instrument_name].position.amount - order.filled_amount
      if (newTotal < 0) {
        instruments[order.instrument_name].position.direction = order.direction
        instruments[order.instrument_name].position.price = order.price
        instruments[order.instrument_name].position.amount = Math.abs(newTotal)
      } else {
        instruments[order.instrument_name].position.amount = newTotal
      }
    }
  }

  if (instruments[order.instrument_name].position.amount > 0) {
    placeExitOrder(conn, order.instrument_name)
  }
  // console.log(instruments[order.instrument_name].position)
}

export const updateOrders = (conn: Client, data: any) => {
  for (const order of data) {
    if (order.label === 'exit') {
      if (order.order_state === 'filled') {
        delete instruments[order.instrument_name].position.exit
      }
      instruments[order.instrument_name].position.amount -= order.filled_amount
    } else if (order.order_state === 'filled' || order.order_state === 'cancelled') {
      removeOrderIfExists(order)
      updateOpenPosition(conn, order)
    }
  }
}