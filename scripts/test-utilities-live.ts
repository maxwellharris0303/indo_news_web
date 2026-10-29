import { buildLiveUtilitySnapshot } from "../src/lib/utilities/build-snapshot";

async function main() {
  const snap = await buildLiveUtilitySnapshot();
  console.log("OK utilities live");
  console.log(
    JSON.stringify(
      {
        nextPrayer: snap.prayer.next,
        method: snap.prayer.method,
        schedule: snap.prayer.schedule,
        air: snap.air,
        updatedAt: snap.updatedAt,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error("Utilities live test failed:", e);
  process.exit(1);
});
