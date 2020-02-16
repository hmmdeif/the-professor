import { instrument, InstrumentOrder, conn, Direction } from '../state'
import chalk = require('chalk')

const add = (data: any) => {
  instrument.orders.push({ id: data.order.order_id, amount: data.order.amount, direction: data.order.direction, price: data.order.price, type: data.order.order_type })
  console.log('New order - ' + (data.order.direction === Direction.buy ? chalk.green('BUY') : chalk.red('SELL')) + ' @ $' + data.order.price + ' for ' + chalk.yellow(data.order.amount))
}

const edit = (order: InstrumentOrder, data: any) => {
  order.amount = data.order.amount
  order.price = data.order.price
  console.log('Modified order - ' + (order.direction === Direction.buy ? chalk.green('BUY') : chalk.red('SELL')) + ' @ $' + order.price + ' for ' + chalk.yellow(order.amount))
}

export const editOrder = (existingOrder: InstrumentOrder, amount: number, price: number) => {
  conn.sendData('private/edit', { order_id: existingOrder.id, amount: amount, price: price }, edit.bind(null, existingOrder))
}

export const addOrder = (amount: number, price: number, direction: string) => {
  conn.sendData(`private/${direction}`, { instrument_name: instrument.name, amount: amount, type: 'limit', post_only: true, price: price }, add)
}