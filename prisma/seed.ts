/**
 * Phase 0 seed entrypoint.
 * Phase 1 replaces this shell with the deterministic Ask India dataset.
 */
async function main() {
  console.info("No synthetic records yet; Phase 1A owns deterministic seeding.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
