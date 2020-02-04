import { instrument, conn, strategy } from '../state'
import { getPosition } from './get-position'

const addOpenOrders = (orders: any) => {
  for (const order of orders) {
    if (order.label === 'exit') {
      instrument.position.exits.push({ id: order.order_id, amount: order.amount, direction: order.direction, price: order.price })
    } else {
      let found = false
      for (const existingOrder of instrument.orders) {
        if (existingOrder.id === order.order_id) {
          found = true
          break
        }
      }
  
      if (!found) {
        instrument.orders.push({ id: order.order_id, amount: order.amount, direction: order.direction, price: order.price })
      }
    }
  }

  strategy.startCandleGrabLoop()
  getPosition()
}

export const getOpenOrders = () => {
  conn.sendData('private/get_open_orders_by_instrument', {
    instrument_name: instrument.name
  }, addOpenOrders.bind(null))
}