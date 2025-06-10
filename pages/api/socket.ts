import { NextApiRequest } from "next"
import SocketHandler, { NextApiResponseServerIO } from "@/lib/socket"

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  return SocketHandler(req, res)
}

export const config = {
  api: {
    bodyParser: false,
  },
}
