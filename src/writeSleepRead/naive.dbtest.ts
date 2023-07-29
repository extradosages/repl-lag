import { ReadConcern } from "mongodb";
import { connect, disconnect, reset } from "../backend";
import createLogger from "../logging";
import { wsrNaive } from "./naive";

afterAll(async () => {
  await disconnect();
});

beforeAll(async () => {
  await connect();
  await reset();
});

const logger = createLogger("naive-test-suite");

describe("naive write-sleep-reads", () => {
  it("without sleep are not causal", async () => {
    const caseId = "naive-no-sleep";
    logger.info({ caseId }, "Running test");

    // Repl-lag is unpredictable; we'll have a better chance of observing it if we do a bunch of write-reads
    const nOps = 10;
    const reportEvery = 3;
    const results = [];
    for (let i = 0; i < nOps; i += 1) {
      if (i % reportEvery === 0) {
        logger.info({ caseId, opIdx: i }, "Submitting write-read");
      } else {
        logger.trace({ caseId, opIdx: i }, "Submitting write-read");
      }

      results.push(await wsrNaive(caseId, 0));
    }

    // Now let's filter out the write-reads that were causal
    const nonCausal = results.filter(
      ({ writtenToPrimary, readFromSecondaryPreferred: readFromSecondaryPreferred }) =>
        writtenToPrimary !== readFromSecondaryPreferred
    );
    const nNonCausal = nonCausal.length;
    logger.info({ caseId, nNonCausal, nOps }, "Causality metrics");
    logger.trace({ caseId, nonCausal }, "Non-causal write-reads");

    expect(nNonCausal).toBeGreaterThan(0);
  });

  it("with enough sleep are causal", async () => {
    const caseId = "naive-sleep";
    logger.info({ caseId }, "Running test");

    // Repl-lag is unpredictable; we'll have a better chance of observing it if we do a bunch of write-reads
    const nOps = 10;
    const reportEvery = 3;
    const results = [];
    for (let i = 0; i < nOps; i += 1) {
      if (i % reportEvery === 0) {
        logger.info({ caseId, opIdx: i }, "Submitting write-sleep-read");
      } else {
        logger.trace({ caseId, opIdx: i }, "Submitting write-sleep-read");
      }

      results.push(
        await wsrNaive(caseId, 2000)
      );
    }

    // Now let's filter out the write-reads that were causal
    const nonCausal = results.filter(
      ({ writtenToPrimary, readFromSecondaryPreferred: readFromSecondaryPreferred }) =>
        writtenToPrimary !== readFromSecondaryPreferred
    );
    const nNonCausal = nonCausal.length;
    logger.info({ caseId, nNonCausal, nOps }, "Causality metrics");
    logger.trace({ caseId, nonCausal }, "Non-causal write-reads");

    expect(nNonCausal).toBe(0);
  });
});
