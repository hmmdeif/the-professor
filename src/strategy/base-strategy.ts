import { getTradingViewData } from '../candle-management/trading-view-data'
import { editOrder, addOrder } from '../order-management/adjust-orders';
import { editExitOrder, addExitOrder, cancelAllExits, addStopOrder, editStopOrder } from '../order-management/update-exit-position';
import { InstrumentOrder, Direction } from '../state';
import chalk = require('chalk');

export abstract class BaseStrategy {
  constructor(protected resolution: number) {}

  protected intervals: NodeJS.Timeout[] = []

  public async startCandleGrabLoop() {
    await this.waitForNextMinute()

    let startDate = new Date()
    startDate.setUTCMinutes(startDate.getUTCMinutes() - (this.resolution * 60))
    let endDate = new Date()
    getTradingViewData(startDate, endDate, this.resolution)
  
    let interval = setInterval(() =>  {
      let startDate = new Date()
      startDate.setUTCMinutes(startDate.getUTCMinutes() - (this.resolution * 60))
      let endDate = new Date()
      getTradingViewData(startDate, endDate, this.resolution)
    }, 1 * 60 * 1000)
    this.intervals.push(interval)
  }

  public stopRequesting() {
    for (const i of this.intervals) {
      clearInterval(i)
    }
  }

  public abstract async candleDataReceived (resolution: number, multiplier: number, orderHistoryCall: boolean, data: any): Promise<void>

  public abstract placeExits(orderHistory?: any): void

  protected roundPrice(amount: number) {
    return Math.round(amount * 100) / 100
  }

  protected async waitForNextMinute() {
    const now = new Date().getUTCSeconds()
    await this.sleep(now <= 5 ? (5 - now) * 1000 : (65 - now) * 1000)
  }

  private sleep(ms: number) {
    console.log(`Waiting ${chalk.yellow(ms / 1000)} seconds for next minute`)
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  protected editOrder(existingOrder: InstrumentOrder, amount: number, price: number) {
    editOrder(existingOrder, amount, this.roundPrice(price))
  }

  protected addOrder(amount: number, price: number, direction: Direction) {
    addOrder(amount, this.roundPrice(price), direction)
  }

  protected editExitOrder(exitPosition: InstrumentOrder, amount: number, price: number) {
    editExitOrder(exitPosition, amount, this.roundPrice(price))
  }

  protected addExitOrder(direction: Direction, amount: number, price: number) {
    addExitOrder(direction, amount, this.roundPrice(price))
  }

  protected addStopOrder(direction: Direction, amount: number, price: number) {
    addStopOrder(direction, amount, this.roundPrice(price))
  }

  protected editStopOrder(exitPosition: InstrumentOrder, amount: number, price: number) {
    editStopOrder(exitPosition, amount, this.roundPrice(price))
  }

  protected cancelAllExits() {
    cancelAllExits()
  }
}