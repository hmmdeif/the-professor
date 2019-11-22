import { instruments, InstrumentOrder } from '../state'
import { Client } from '../client'

const editOrder = (order: InstrumentOrder, data: any) => {
  order.amount = data.order.amount
  order.price = data.order.price
}

const addExitOrder = (data: any) => {
  instruments[data.order.instrument_name].position.exit ={ id: data.order.order_id, amount: data.order.amount, direction: data.order.direction, price: data.order.price }
}

export const placeExitOrder = (conn: Client, instrument: string) => {
  let exitDirection = instruments[instrument].position.direction === 'buy' ? 'sell': 'buy'
  let exitPrice = instruments[instrument].position.price + 10
  if (exitDirection === 'buy') {
    exitPrice = instruments[instrument].position.price - 10
  }

  if ('exit' in instruments[instrument].position) {
    conn.sendData('private/edit', { order_id: instruments[instrument].position.exit.id, amount: instruments[instrument].position.amount, price: exitPrice }, editOrder.bind(null, instruments[instrument].position.exit))
  } else {
    conn.sendData(`private/${exitDirection}`, { instrument_name: instrument, amount: instruments[instrument].position.amount, type: 'limit', post_only: true, label: 'exit', price: exitPrice }, addExitOrder)
  }
}