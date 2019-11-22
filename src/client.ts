import WebSocket = require('ws');
import EventEmitter from 'events'
import { env } from '../config'
import { DeribitResponse } from './models/deribit-response'

export class Client extends EventEmitter {
  private instance: WebSocket
  private pingTimeout: NodeJS.Timeout
  private pingInterval = 20
  private reconnectInterval = 10
  private accessToken = ''
  private refreshToken = ''
  private id = 0
  requests: any = {}

  open() {
    this.instance = new WebSocket(env.server)
    this.instance.on('open', () => {
      console.log('WS: Socket opened')
      this.reconnectInterval = 10
      this.sendData('public/hello', { client_name: 'hmmdeif trading bot <deif@pm.me>', client_version: '1.0.0' })
    })

    this.instance.on('error', (e: any) => {
      switch (e.code) {
        case 'ECONNREFUSED':
          this.tryReconnect()  
          break
        default:
          console.error('WS: Error received', e)
          break
      }
    })
    
    this.instance.on('message', (data: string) => {
      this.processMessage(data)
    })
    
    this.instance.on('close', () => {
      this.emit('closed')
      clearTimeout(this.pingTimeout)
      this.tryReconnect()
    })
  }

  private tryReconnect() {
    console.log('WS: Socket reconnecting...')
    this.instance.removeAllListeners();
    setTimeout(() => {
      this.open()
    }, this.reconnectInterval * 1000)
    this.reconnectInterval += 10
  }

  private heartbeat() {
    clearTimeout(this.pingTimeout)
    this.pingTimeout = setTimeout(() => {
      this.instance.terminate()
    }, (this.pingInterval * 1000) + 10000)
  }

  sendData(method: string, params?: any, callback?: any) {
    ++this.id
    let obj: any = {
      jsonrpc: '2.0',
      method: method,
      id: this.id
    }

    this.requests[this.id] = {
      method: method
    }

    if (params && typeof params === 'function') {
      callback = params
      params = null
    }
  
    if (params) {
      obj.params = params
      this.requests[this.id].params = params
    }

    if (callback) {
      this.requests[this.id].callback = callback
    }

    if (method.indexOf('private') > -1) {
      obj.access_token = this.accessToken
    }
  
    this.instance.send(JSON.stringify(obj))
  }

  private processMessage(str: string) {
    try {
      const data: DeribitResponse = JSON.parse(str)
      if (data.id) {
        this.heartbeat()
        this.handleResponse(data)
      } else {
        switch (data.method) {
          case 'heartbeat':
            this.respondToHeartBeat(data.params)
            break
          default:
            this.emit('message', data)
            break
        }
      }
  
    } catch (e) {
      console.error('Process message error', e)
    }
  }

  private respondToHeartBeat(params: any) {
    if (params.type === 'heartbeat') {
      this.heartbeat()
    }
    if (params.type === 'test_request') {
      this.sendData('public/test')
    }
  }

  private startHeatbeat() {
    this.sendData('public/set_heartbeat', { interval: this.pingInterval })
    this.heartbeat()
  }

  private auth() {
    if (env.client_id) {
      this.sendData('public/auth', {
        grant_type: 'client_credentials',
        client_id: env.client_id,
        client_secret: env.client_secret
      })
    }
  }

  private refreshAuth() {
    this.sendData('public/auth', {
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken
    })
  }

  private storeTokens(data: DeribitResponse) {
    console.log('Authed successfully')
    if (data.result) {
      this.accessToken = data.result.access_token
      this.refreshToken = data.result.refresh_token
      // Default expiry is 365 days so no real point refreshing
      // setTimeout(() => {
      //   this.refreshAuth()
      // }, (data.result.expires_in - 10000))
      this.emit('authed')
    } else {
      console.log(`Auth failure: ${data.error.message}`)
    }
  }

  private handleResponse(data: DeribitResponse) {
    if (this.requests[data.id]) {
      switch (this.requests[data.id].method) {
        case 'public/set_heartbeat':
          if (data.result !== 'ok') {
            this.instance.terminate()
          }
          break
        case 'public/hello':
          this.startHeatbeat()
          this.auth()
          break
        case 'public/test': // just used for heartbeat
          break
        case 'public/auth':
          this.storeTokens(data)
          break
        default:
          if (data.error) {
            console.log(data.error.message, data.error.data)
          } else if (this.requests[data.id].callback) {
            this.requests[data.id].callback(data.result, this.requests[data.id].method, this.requests[data.id].params)
          }
          break
      }
  
      delete this.requests[data.id]
    }
  }
}