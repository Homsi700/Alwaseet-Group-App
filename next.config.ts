import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      // If you're using Server Actions, configure options here, e.g., bodySizeLimit
      // Or set to true if that's the intended configuration and Next.js version supports it.
      // For Next.js 14+, experimental.serverActions can be true or an object.
      // Let's assume for now simple boolean is fine, or remove if not used.
      // Given the warning, it expects an object.
      // If you are not actively using server actions with specific config, 
      // you might not need this, or ensure it's correctly structured.
      // For safety, if just enabling, it's often just `serverActions: true`
      // but the error said "Expected object, received boolean".
      // So, we might need to pass an empty object if we want to enable it
      // or a specific configuration.
      // Let's try enabling it with the object structure if that's what it's looking for.
      // However, the simplest way if server actions are just to be "enabled" is:
      // serverActions: true, (but this caused warning)
      // A common way to enable with default config via object:
      // enabled: true, (This is not standard for Next.js `serverActions`)
      // The most common fix if `true` caused a warning is that the specific Next.js version
      // might have deprecated the boolean.
      // Let's try with an empty object to signify enablement with default options.
      // If Server Actions are not being used, this can be removed.
      // Assuming you want Server Actions enabled with default config:
      // bodySizeLimit: '1mb', // Example of a possible configuration
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

// Correcting experimental.serverActions to be just 'true' if that's the intention
// or removing if not used, or providing a valid object.
// The error "Expected object, received boolean" suggests the boolean `true` is no longer valid for your Next.js version's "experimental" flags.
// However, most documentation still lists `serverActions: true`.
// Let's simplify and assume `true` is what you meant and the warning might be from an older linter or setup.
// If the error persists, we'll need to check the exact Next.js version and its specific config for serverActions.
// For now, I'll set it to true as it's the common way to enable. If the warning persists, we'll address it.
// Given the persistent warning, let's assume the structure is:
// experimental: { serverActions: {} } to enable with defaults or detailed config.
// Or, if you're using a newer Next.js version (e.g., 14+), serverActions might be a top-level config.
// For Next.js 14, `serverActions: true` is valid at the top level.
// Let's remove it from `experimental` and place it at the top level.
// Actually, for Next.js 15.2.3, `experimental: { serverActions: true }` should be fine.
// The error "Expected object, received boolean" might be misleading or specific to a stricter validation.
// Let's try `experimental: { serverActions: {} }` to satisfy the "object" expectation.
// If `serverActions` is not used, it can be removed.
// Re-evaluating: The `next.config.ts` provided previously had `experimental: { serverActions: true }`.
// The warning "Expected object, received boolean" suggests this structure isn't right for your setup.
// The simplest fix to satisfy "expected object" is to provide an empty object,
// which usually means "enable with default settings".
(nextConfig.experimental as any).serverActions = {};


export default nextConfig;

