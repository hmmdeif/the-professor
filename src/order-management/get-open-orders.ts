import { Client } from '../client'
import { instruments } from '../state'
import { startCandleGrabLoop } from '../candle-management/trading-view-data'
import { getPosition } from './get-position'

const addOpenOrders = (conn: Client, instrument: string, orders: any) => {
  for (const order of orders) {
    if (order.label === 'exit') {
      instruments[order.instrument_name].position.exit = { id: order.order_id, amount: order.amount, direction: order.direction, price: order.price }
    } else {
      let found = false
      for (const existingOrder of instruments[order.instrument_name].orders) {
        if (existingOrder.id === order.order_id) {
          found = true
          break
        }
      }
  
      if (!found) {
        instruments[order.instrument_name].orders.push({ id: order.order_id, amount: order.amount, direction: order.direction })
      }
    }
  }

  startCandleGrabLoop(conn, instrument)
  getPosition(conn, instrument)
}

export const getOpenOrders = (conn: Client, instrument: string) => {
  conn.sendData('private/get_open_orders_by_instrument', {
    instrument_name: instrument
  }, addOpenOrders.bind(null, conn, instrument))
}