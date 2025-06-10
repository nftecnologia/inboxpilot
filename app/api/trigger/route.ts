import type { TriggerConfig } from "@trigger.dev/sdk/v3"
import { processEmailJob } from "@/src/trigger/processEmail"
import { checkSLAJob } from "@/src/trigger/checkSLA"
import { firstScheduledTask } from "@/src/trigger/example"

export const dynamic = "force-dynamic"

export const { GET, POST } = createTriggerRoute({
  // Registrar todos os jobs aqui
  jobs: [
    processEmailJob,
    checkSLAJob,
    firstScheduledTask, // Exemplo, pode ser removido depois
  ],
})

// Importar função helper do Trigger.dev
function createTriggerRoute(config: { jobs: Array<any> }) {
  // Esta função será fornecida pelo Trigger.dev SDK
  return {
    GET: async () => {
      return new Response("Trigger.dev endpoint", { status: 200 })
    },
    POST: async (request: Request) => {
      // O Trigger.dev irá processar as requisições aqui
      return new Response("OK", { status: 200 })
    }
  }
}
