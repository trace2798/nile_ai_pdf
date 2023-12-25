/** @type {import('next').NextConfig} */

module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  webpack: (config) => {
    // nextjs does not play nice with knex, which @theniledev/server uses under the hood
    config.externals.push({
      knex: "commonjs knex",
    });
    return config;
  },
};
