import http from "k6/http"
import { check, sleep } from "k6"
import { __ENV } from "k6/env"

export const options = {
  stages: [
    { duration: "2m", target: 10 }, // Ramp up
    { duration: "5m", target: 10 }, // Stay at 10 users
    { duration: "2m", target: 20 }, // Ramp up to 20 users
    { duration: "5m", target: 20 }, // Stay at 20 users
    { duration: "2m", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% das requisições devem ser < 2s
    http_req_failed: ["rate<0.1"], // Taxa de erro < 10%
  },
}

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000"

export default function () {
  // Teste da API de análise de email
  const emailData = {
    subject: "Teste de Performance",
    content: "Este é um email de teste para verificar a performance da API.",
    sender: "teste@exemplo.com",
  }

  const response = http.post(`${BASE_URL}/api/email-analysis`, JSON.stringify(emailData), {
    headers: {
      "Content-Type": "application/json",
    },
  })

  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 2000ms": (r) => r.timings.duration < 2000,
    "has analysis data": (r) => {
      const body = JSON.parse(r.body)
      return body.analysis && body.suggestedResponse
    },
  })

  sleep(1)
}
