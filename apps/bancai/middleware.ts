import { withAuth } from "next-auth/middleware";

export default withAuth(
    function middleware(req) {
        // Add custom middleware logic here if needed
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // Always allow test endpoints for development
                if (req.nextUrl.pathname.startsWith("/api/test/")) {
                    return true;
                }

                // Check if user is authenticated for protected routes
                if (req.nextUrl.pathname.startsWith("/dashboard")) {
                    return !!token;
                }

                // Allow other API access for demo
                if (req.nextUrl.pathname.startsWith("/api/")) {
                    return true;
                }

                return true;
            },
        },
    }
);

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/settings/:path*",
        "/profile/:path*",
        "/api/:path*"
    ]
};
