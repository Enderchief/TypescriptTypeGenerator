/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public: { url: "/", static: true },
    "src": { url: "/dist" },
  },
  plugins: ["@snowpack/plugin-typescript"],
  optimize: {
    /* Example: Bundle your final build: */
    bundle: true,
    minify: true,
    treeshake: true,
    manifest: true,
    splitting: true,
  },
  packageOptions: {
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    sourcemap: true,

    /* ... */
  },
};
