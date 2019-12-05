import { Client } from '../client'
import { instruments, InstrumentOrder } from '../state'
import { env } from '../../config'
import chalk = require('chalk')

const addOrder = (data: any) => {
  instruments[data.order.instrument_name].orders.push({ id: data.order.order_id, amount: data.order.amount, direction: data.order.direction, price: data.order.price })
  console.log('New order - ' + (data.order.direction === 'buy' ? chalk.green('BUY') : chalk.red('SELL')) + ' @ $' + data.order.price + ' for ' + chalk.yellow(data.order.amount))
}

const editOrder = (order: InstrumentOrder, data: any) => {
  order.amount = data.order.amount
  order.price = data.order.price
  console.log('Modified order - ' + (order.direction === 'buy' ? chalk.green('BUY') : chalk.red('SELL')) + ' @ $' + order.price + ' for ' + chalk.yellow(order.amount))
}

const findOrder = (instrument: string, amount: number, direction: string): InstrumentOrder => {
  let order = null
  for (const o of instruments[instrument].orders) {
    if (o.amount === amount && o.direction === direction) {
      order = o
    }
  }
  return order
}

const calcPrice = (multiplier: number, instrument: string, bbradius: number) => {
  return (bbradius * multiplier * (1000 / (instruments[instrument].indicators.adx * instruments[instrument].indicators.adx)) )
}

const calcSellPrice = (multiplier: number, instrument: string, bbradius: number) => {
  return instruments[instrument].indicators.bb.upper + calcPrice(multiplier, instrument, bbradius)
}

const calcBuyPrice = (multiplier: number, instrument: string, bbradius: number) => {
  return instruments[instrument].indicators.bb.lower - calcPrice(multiplier, instrument, bbradius)
}

const placeOrder = (conn: Client, price: number, instrument: string, amount: number, direction: string) => {
  if ((direction === 'sell' && instruments[instrument].ask < price) || (direction === 'buy' && instruments[instrument].bid > price)) {
    const existingOrder = findOrder(instrument, amount, direction)
    if (existingOrder) {
      conn.sendData('private/edit', { order_id: existingOrder.id, amount: amount, price: price }, editOrder.bind(null, existingOrder))
    } else {
      conn.sendData(`private/${direction}`, { instrument_name: instrument, amount: amount, type: 'limit', post_only: true, price: price }, addOrder)
    }
  }
}

export const adjustOrders = (conn: Client, instrument: string) => {
  const bbradius = instruments[instrument].indicators.bb.upper - instruments[instrument].indicators.bb.middle
  placeOrder(conn, calcSellPrice(1, instrument, bbradius), instrument, env.size, 'sell')
  placeOrder(conn, calcSellPrice(1.5, instrument, bbradius), instrument, env.size * 2, 'sell')
  placeOrder(conn, calcSellPrice(2, instrument, bbradius), instrument, env.size * 5, 'sell')

  placeOrder(conn, calcBuyPrice(1, instrument, bbradius), instrument, env.size, 'buy')
  placeOrder(conn, calcBuyPrice(1.5, instrument, bbradius), instrument, env.size * 2, 'buy')
  placeOrder(conn, calcBuyPrice(2, instrument, bbradius), instrument, env.size * 5, 'buy')
}