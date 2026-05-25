/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/20260526-mindfulness-meditation",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
