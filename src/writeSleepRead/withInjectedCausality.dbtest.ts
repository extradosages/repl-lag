import { connect, disconnect, reset } from "../backend";
import createLogger from "../logging";
import { wsrWithInjectedCausality } from "./withInjectedCausality";

afterAll(async () => {
  await disconnect();
});

beforeAll(async () => {
  await connect();
  await reset();
});

const logger = createLogger('with-injected-causality-test-suite');

describe("write-reads with causal session injection", () => {
  it("are causal", async () => {
    const caseId = "injected-causality-no-sleep";
    logger.info({ caseId }, 'Running test');

    // Repl-lag is unpredictable; we'll have a better chance of observing it if we do a bunch of write-reads
    const nOps = 10;
    const reportEvery = 3;
    const results = [];
    for (let i = 0; i < nOps; i += 1) {
      if (i % reportEvery === 0) {
        logger.info({ caseId, opIdx: i }, "Submitting write-read with injected causality");
      } else {
        logger.trace({ caseId, opIdx: i }, "Submitting write-read with injected causality");
      }

      results.push(await wsrWithInjectedCausality(caseId));
    }

    // Now let's filter out the write-reads that were causal
    const nonCausal = results.filter(
      ({ writtenToPrimary, readFromSecondaryPreferred: readFromSecondaryPreferred }) => writtenToPrimary !== readFromSecondaryPreferred
    );
    const nNonCausal = nonCausal.length;
    logger.info({ caseId, nNonCausal, nOps }, "Causality metrics");
    logger.trace({ caseId, nonCausal }, "Non-causal write-reads");

    expect(nNonCausal).toBe(0);
  });
});
