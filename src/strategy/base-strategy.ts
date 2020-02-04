import { getTradingViewData } from '../candle-management/trading-view-data'
import { editOrder, addOrder } from '../order-management/adjust-orders';
import { editExitOrder, addExitOrder } from '../order-management/update-exit-position';
import { InstrumentOrder, Direction } from '../state';

export abstract class BaseStrategy {
  constructor(protected resolution: number) {}

  protected intervals: NodeJS.Timeout[] = []

  public startCandleGrabLoop() {
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

  public abstract async candleDataReceived (resolution: number, data: any): Promise<void>

  public abstract placeExits(orderHistory?: any): void

  protected editOrder(existingOrder: InstrumentOrder, amount: number, price: number) {
    editOrder(existingOrder, amount, price)
  }

  protected addOrder(amount: number, price: number, direction: Direction) {
    addOrder(amount, price, direction)
  }

  protected editExitOrder(exitPosition: InstrumentOrder, amount: number, price: number) {
    editExitOrder(exitPosition, amount, price)
  }

  protected addExitOrder(direction: Direction, amount: number, price: number) {
    addExitOrder(direction, amount, price)
  }
}