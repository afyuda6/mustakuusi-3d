import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "mustakuusi-3d-content.vercel.app",
                pathname: "/assets/**",
            },
        ],
    },

    async redirects() {
        return [
            {
                source: '/r/:path*',
                destination: '/:path*',
                permanent: true,
            },
            {
                source: '/g/:path*',
                destination: '/:path*',
                permanent: true,
            },
            {
                source: '/b/:path*',
                destination: '/:path*',
                permanent: true,
            },
            {
                source: '/c/:path*',
                destination: '/:path*',
                permanent: true,
            },
            {
                source: '/m/:path*',
                destination: '/:path*',
                permanent: true,
            },
            {
                source: '/y/:path*',
                destination: '/:path*',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
