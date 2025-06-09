"use client"

import { useEffect, useRef, useState } from "react"

export function EffectivenessChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Dados simulados
    const acceptedPercentage = 78
    const rejectedPercentage = 22

    // Configurações do gráfico
    const centerX = canvasRef.current.width / 2
    const centerY = canvasRef.current.height / 2
    const radius = Math.min(centerX, centerY) - 40
    const innerRadius = radius * 0.6

    // Função para desenhar o gráfico
    const drawChart = (hoverEffect = false) => {
      // Limpar o canvas
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)

      // Desenhar o gráfico
      const drawPieSlice = (
        ctx: CanvasRenderingContext2D,
        centerX: number,
        centerY: number,
        radius: number,
        startAngle: number,
        endAngle: number,
        color: string,
        innerRadius = 0,
      ) => {
        ctx.fillStyle = color
        ctx.beginPath()

        // Arco externo
        ctx.arc(centerX, centerY, radius, startAngle, endAngle)

        // Se tiver raio interno, desenhar como donut
        if (innerRadius > 0) {
          // Arco interno (sentido anti-horário)
          ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true)
        } else {
          // Se não for donut, conectar ao centro
          ctx.lineTo(centerX, centerY)
        }

        ctx.closePath()
        ctx.fill()

        // Adicionar brilho na borda
        ctx.save()
        ctx.globalCompositeOperation = "source-atop"
        const gradient = ctx.createLinearGradient(
          centerX - radius,
          centerY - radius,
          centerX + radius,
          centerY + radius,
        )
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.2)")
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)")
        ctx.fillStyle = gradient
        ctx.fill()
        ctx.restore()
      }

      // Desenhar as fatias
      const startAngle = 0
      const acceptedEndAngle = startAngle + (acceptedPercentage / 100) * Math.PI * 2

      // Cores com efeito de hover
      const acceptedColor = hoverEffect ? "#1D9A4F" : "#27AE60"
      const rejectedColor = hoverEffect ? "#D44333" : "#E74C3C"

      // Desenhar as fatias como donut
      drawPieSlice(ctx, centerX, centerY, radius, startAngle, acceptedEndAngle, acceptedColor, innerRadius)
      drawPieSlice(ctx, centerX, centerY, radius, acceptedEndAngle, Math.PI * 2, rejectedColor, innerRadius)

      // Adicionar texto no centro
      ctx.fillStyle = "#2E2E2E"
      ctx.font = "bold 24px Inter"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(`${acceptedPercentage}%`, centerX, centerY - 10)

      ctx.fillStyle = "#6B7280"
      ctx.font = "14px Inter"
      ctx.fillText("Efetividade", centerX, centerY + 15)

      // Adicionar legenda
      const legendY = canvasRef.current!.height - 30

      // Legenda para aceitas
      ctx.fillStyle = acceptedColor
      ctx.fillRect(centerX - 90, legendY, 12, 12)
      ctx.fillStyle = "#2E2E2E"
      ctx.font = "12px Inter"
      ctx.textAlign = "left"
      ctx.fillText("Aceitas", centerX - 70, legendY + 10)

      // Legenda para rejeitadas
      ctx.fillStyle = rejectedColor
      ctx.fillRect(centerX + 10, legendY, 12, 12)
      ctx.fillStyle = "#2E2E2E"
      ctx.fillText("Rejeitadas", centerX + 30, legendY + 10)
    }

    // Desenhar o gráfico inicial
    drawChart(false)

    // Adicionar eventos de mouse
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Verificar se o mouse está sobre o gráfico
      const centerX = canvasRef.current.width / 2
      const centerY = canvasRef.current.height / 2
      const radius = Math.min(centerX, centerY) - 40

      const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
      const isHovering = distance <= radius && distance >= radius * 0.6

      setIsHovering(isHovering)
      drawChart(isHovering)
    }

    const canvas = canvasRef.current
    canvas.addEventListener("mousemove", handleMouseMove)

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <div className="flex justify-center items-center h-[300px]">
      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        className={`max-w-full transition-transform duration-300 ${isHovering ? "scale-105" : "scale-100"}`}
      />
    </div>
  )
}
