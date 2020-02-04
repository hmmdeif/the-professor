import { removeOrderIfExists } from './remove-order'
import { instrument, strategy } from '../state'

const updateOpenPosition = (order: any) => {
  if (order.filled_amount > 0) {
    if (order.direction === instrument.position.direction) {
      const newTotal = instrument.position.amount + order.filled_amount
      instrument.position.price = ((instrument.position.price * instrument.position.amount) + (order.filled_amount * order.price)) / newTotal
      instrument.position.amount = newTotal
    } else {
      const newTotal = instrument.position.amount - order.filled_amount
      if (newTotal < 0) {
        instrument.position.direction = order.direction
        instrument.position.price = order.price
        instrument.position.amount = Math.abs(newTotal)
      } else {
        instrument.position.amount = newTotal
      }
    }
  }

  if (instrument.position.amount > 0) {
    strategy.placeExits()
  }
  // console.log(instrument.position)
}

export const updateOrders = (data: any) => {
  for (const order of data) {
    if (order.label === 'exit') {
      if (order.order_state === 'filled') {
        instrument.position.exits = instrument.position.exits.filter(e => e.id !== order.order_id)
      }
      instrument.position.amount -= order.filled_amount
    } else if (order.order_state === 'filled' || order.order_state === 'cancelled') {
      removeOrderIfExists(order)
      updateOpenPosition(order)
    }
  }
}