import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Verificações básicas de saúde
    const checks = {
      timestamp: new Date().toISOString(),
      status: "healthy",
      version: process.env.npm_package_version || "unknown",
      environment: process.env.NODE_ENV || "unknown",
      openai: {
        configured: !!process.env.OPENAI_API_KEY,
        keyLength: process.env.OPENAI_API_KEY?.length || 0,
      },
    }

    return NextResponse.json(checks)
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
