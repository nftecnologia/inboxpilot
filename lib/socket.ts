import { Server as NetServer } from "http"
import { NextApiRequest, NextApiResponse } from "next"
import { Server as ServerIO } from "socket.io"

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    console.log("Socket já está rodando")
  } else {
    console.log("Socket iniciando...")
    const io = new ServerIO(res.socket.server)
    res.socket.server.io = io

    io.on("connection", (socket) => {
      console.log(`Cliente conectado: ${socket.id}`)

      // Join user to their own room for personalized notifications
      socket.on("join-user", (userId: string) => {
        socket.join(`user-${userId}`)
        console.log(`Usuário ${userId} entrou na sala`)
      })

      // Leave user room
      socket.on("leave-user", (userId: string) => {
        socket.leave(`user-${userId}`)
        console.log(`Usuário ${userId} saiu da sala`)
      })

      socket.on("disconnect", () => {
        console.log(`Cliente desconectado: ${socket.id}`)
      })
    })
  }
  res.end()
}

export default SocketHandler
