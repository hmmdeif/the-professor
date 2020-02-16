import { instrument, InstrumentOrder, conn, Direction } from '../state'
import chalk = require('chalk')

const edit = (order: InstrumentOrder, data: any) => {
  order.amount = data.order.amount
  order.price = data.order.price
  console.log('Modified exit - ' + chalk.yellow(order.type) + (order.direction === Direction.buy ? chalk.green('BUY') : chalk.red('SELL')) + ' @ $' + order.price + ' for ' + chalk.yellow(order.amount))
}

const add = (data: any) => {
  instrument.position.exits.push({ id: data.order.order_id, amount: data.order.amount, direction: data.order.direction, price: data.order.price, type: data.order.order_type })
}

const removeExit = (order: any) => {
  instrument.position.exits = instrument.position.exits.filter((o: InstrumentOrder) => o.id !== order.order_id)
}

export const editExitOrder = (position: InstrumentOrder, amount: number, exitPrice: number) => {
  conn.sendData('private/edit', { order_id: position.id, amount: amount, price: exitPrice }, edit.bind(null, position))
}

export const addExitOrder = (direction: Direction, amount: number, exitPrice: number) => {
  conn.sendData(`private/${direction}`, { instrument_name: instrument.name, amount: amount, type: 'limit', label: 'exit', price: exitPrice, reduce_only: true }, add)
}

export const addStopOrder = (direction: Direction, amount: number, exitPrice: number) => {
  conn.sendData(`private/${direction}`, { instrument_name: instrument.name, amount: amount, type: 'stop_market', label: 'exit', stop_price: exitPrice, trigger: 'last_price', reduce_only: true }, add)
}

export const editStopOrder = (position: InstrumentOrder, amount: number, exitPrice: number) => {
  conn.sendData('private/edit', { order_id: position.id, amount: amount, stop_price: exitPrice }, edit.bind(null, position))
}

export const cancelAllExits = () => {
  for (const o of instrument.position.exits) {
    conn.sendData('private/cancel', { order_id: o.id }, removeExit)
  }
}