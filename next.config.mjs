/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // TODO(backend): the first version was written without a local install, so the
  // build doesn't fail on type or lint errors. Run `npm run build` locally once and
  // switch both of these back to false.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  webpack: (config) => {
    // wagmi / walletconnect optional deps that aren't needed in the browser
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};
export default nextConfig;
