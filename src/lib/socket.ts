import { Server as NetServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { NextApiResponse } from 'next'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

export const initSocketServer = (res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server)
    res.socket.server.io = io

    io.on('connection', (socket) => {
      socket.on('join-channel', (channelId: string) => {
        socket.join(channelId)
      })

      socket.on('leave-channel', (channelId: string) => {
        socket.leave(channelId)
      })
    })
  }
  return res.socket.server.io
} 