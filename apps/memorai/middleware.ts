// DISABLED DURING DASHBOARD DEVELOPMENT
// import { withAuth } from "next-auth/middleware";

// export default withAuth(
//     function middleware(req) {
//         // Add custom middleware logic here if needed
//     },
//     {
//         callbacks: {
//             authorized: ({ token, req }) => {
//                 // Check if user is authenticated for protected routes
//                 if (req.nextUrl.pathname.startsWith("/dashboard")) {
//                     return !!token;
//                 }
//                 // DO NOT PROTECT API ROUTES FOR NOW
//                 if (req.nextUrl.pathname.startsWith("/api/")) {
//                     return true; // Allow all API routes without auth
//                 }
//                 return true;
//             },
//         },
//     }
// );

// export const config = {
//     matcher: [
//         "/dashboard/:path*",
//         "/settings/:path*",
//         "/profile/:path*"
//         // REMOVED /api/:path* from matcher to disable auth on API routes
//     ]
// };

// Temporary: Disable all middleware for dashboard development
export default function middleware() {
    // Allow all requests during development
    return;
}

export const config = {
    matcher: [] // Empty matcher = no routes protected
};
