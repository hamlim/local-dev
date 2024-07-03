await Bun.build({
  entrypoints: ["./cli.ts"],
  outdir: "./bin",
});
