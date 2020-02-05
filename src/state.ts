import { Client } from './client'
import { env } from '../config'
import { BaseStrategy } from './strategy/base-strategy'
// import { OpenCloseCrossStrategy } from './strategy/occ'
import { BolingerBandStrategy } from './strategy/bb'

export let conn: Client = new Client()

// Change strategy type below with your implemented one
// export let strategy: BaseStrategy = new OpenCloseCrossStrategy(240)
export let strategy: BaseStrategy = new BolingerBandStrategy(3)

export enum Direction {
  buy = 'buy',
  sell = 'sell'
}

export interface InstrumentOrder {
  id: string
  price: number
  amount: number
  direction: Direction
}

interface Position {
  amount: number
  price: number
  direction: Direction
  exits: InstrumentOrder[]
}

interface Instrument {
  name: string
  bid: number
  ask: number
  indicators: any
  orders: InstrumentOrder[]
  position: Position
}

export let instrument: Instrument = {
  name: env.instrument,
  bid: 0,
  ask: 1000000000,
  indicators: {
    bb: {}
  },
  orders: [] as InstrumentOrder[],
  position: {
    amount: 0,
    price: 0,
    direction: Direction.buy,
    exits: [] as InstrumentOrder[]
  }
}