/**
 * Phase 0 seed entrypoint.
 * Phase 1A replaces this shell with the deterministic synthetic dataset.
 */
async function main() {
  console.info("No synthetic records yet; Phase 1A owns deterministic seeding.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
