const isVercel = process.env.VERCEL === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standard serverless deployment on Vercel, static export otherwise (e.g. for Electron)
  output: isVercel ? undefined : "export",
  basePath: isVercel ? "" : "/20260526-mindfulness-meditation",
  env: {
    NEXT_PUBLIC_BASE_PATH: isVercel ? "" : "/20260526-mindfulness-meditation",
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig

