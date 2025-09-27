/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  output: 'export',
  // Required for GitHub Pages under repository subpath
  basePath: '/rbwang',
  assetPrefix: '/rbwang/',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;


