import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Middleware adicional pode ser adicionado aqui
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/emails/:path*",
    "/chat/:path*",
    "/tickets/:path*",
    "/ia/:path*",
    "/base-conhecimento/:path*",
    "/configuracoes/:path*",
    "/relatorios/:path*",
    "/teste-ia/:path*",
    "/teste-base-conhecimento/:path*",
    "/widget-config/:path*",
    "/atendimento/:path*",
  ]
}
