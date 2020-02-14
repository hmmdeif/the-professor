import { instrument, InstrumentOrder, Direction } from '../state'
import { BaseStrategy } from './base-strategy';
const tulind = require('tulind');

export class BolingerBandStrategy extends BaseStrategy {
  constructor(resolution: number) {
    super(resolution)
  }

  private async calculateBB(data: any) {
    const bb = await tulind.indicators.bbands.indicator([data.close], [20, 2])
  
    instrument.indicators.bb.lower = bb[0][bb[0].length - 1]
    instrument.indicators.bb.middle = bb[1][bb[1].length - 1]
    instrument.indicators.bb.upper = bb[2][bb[2].length - 1]
  }
  
  private async calculateADX(data: any) {
    const adx = await tulind.indicators.adx.indicator([data.high, data.low, data.close], [14])
    instrument.indicators.adx = adx[0][adx[0].length - 1]
  }
  
  private calcSellPrice(multiplier: number, bbradius: number): number {
    return instrument.indicators.bb.upper + this.calcPrice(multiplier, bbradius)
  }
  
  private calcBuyPrice(multiplier: number, bbradius: number): number {
    return instrument.indicators.bb.lower - this.calcPrice(multiplier, bbradius)
  }
  
  private calcPrice(multiplier: number, bbradius: number): number {
    return (bbradius * multiplier) - bbradius - 5
    // return (bbradius * multiplier * (1000 / (instrument.indicators.adx * instrument.indicators.adx)) )
  }
  
  private findOrder(amount: number, direction: Direction): InstrumentOrder {
    let order = null
    for (const o of instrument.orders) {
      if (o.amount === amount && o.direction === direction) {
        order = o
      }
    }
    return order
  }
  
  private placeOrder(price: number, amount: number, direction: Direction) {
    if ((direction === Direction.sell && instrument.ask < price) || (direction === Direction.buy && instrument.bid > price)) {
      const existingOrder = this.findOrder(amount, direction)
      if (existingOrder) {
        this.editOrder(existingOrder, amount, price)
      } else {
        this.addOrder(amount, price, direction)
      }
    }
  }
  
  public async candleDataReceived(resolution: number, multiplier: number, data: any) {
    await this.calculateBB(data)
    await this.calculateADX(data)
  
    const bbradius = instrument.indicators.bb.upper - instrument.indicators.bb.middle
    this.placeOrder(this.calcSellPrice(1, bbradius), 10, Direction.sell)
    this.placeOrder(this.calcSellPrice(1.5, bbradius), 20, Direction.sell)
    this.placeOrder(this.calcSellPrice(2, bbradius), 50, Direction.sell)
  
    this.placeOrder(this.calcBuyPrice(1, bbradius), 10, Direction.buy)
    this.placeOrder(this.calcBuyPrice(1.5, bbradius), 20, Direction.buy)
    this.placeOrder(this.calcBuyPrice(2, bbradius), 50, Direction.buy)
  }
  
  public placeExits = (orderHistory?: any) => {
    let exitDirection = instrument.position.direction === Direction.buy ? Direction.sell: Direction.buy
    let exitPrice = instrument.position.price + 10
    if (exitDirection === 'buy') {
      exitPrice = instrument.position.price - 10
    }
  
    if (instrument.position.exits.length > 0) {
      this.editExitOrder(instrument.position.exits[0], instrument.position.amount, exitPrice)
    } else {
      this.addExitOrder(exitDirection, instrument.position.amount, exitPrice)
    }
  }
}
