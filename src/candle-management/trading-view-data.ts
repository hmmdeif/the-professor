import { Client } from "../client"
import { updateIndicators } from "./update-indicator-data"
import { env } from '../../config'

let interval: NodeJS.Timeout

export const startCandleGrabLoop = (conn: Client, instrument: string) => {
  getTradingViewData(conn, instrument)
  interval = setInterval(() =>  {
    getTradingViewData(conn, instrument)
  }, 1 * 60 * 1000)
}

const getTradingViewData = (conn: Client, instrument: string) => {
  let startDate = new Date()
  let endDate = new Date()
  startDate.setUTCMinutes(startDate.getUTCMinutes() - (env.resolution * 20)) // 20 * config.resolution minute candles away
  conn.sendData('public/get_tradingview_chart_data', {
    instrument_name: instrument,
    start_timestamp: startDate.valueOf(),
    end_timestamp: endDate.valueOf(),
    resolution: env.resolution
  }, updateIndicators.bind(null, conn, env.resolution))
}

export const stopRequesting = () => {
  clearInterval(interval)
}