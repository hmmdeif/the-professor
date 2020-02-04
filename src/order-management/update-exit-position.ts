import { instrument, InstrumentOrder, conn, Direction } from '../state'

const edit = (order: InstrumentOrder, data: any) => {
  order.amount = data.order.amount
  order.price = data.order.price
}

const add = (data: any) => {
  instrument.position.exits.push({ id: data.order.order_id, amount: data.order.amount, direction: data.order.direction, price: data.order.price })
}

export const editExitOrder = (position: InstrumentOrder, amount: number, exitPrice: number) => {
  conn.sendData('private/edit', { order_id: position.id, amount: amount, price: exitPrice }, edit.bind(null, position))
}

export const addExitOrder = (direction: Direction, amount: number, exitPrice: number) => {
  conn.sendData(`private/${direction}`, { instrument_name: instrument.name, amount: instrument.position.amount, type: 'limit', label: 'exit', price: exitPrice }, add)
}