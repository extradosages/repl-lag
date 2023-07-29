import { ReadConcern } from "mongodb";
import { client } from "../backend";
import { asyncLocalSessionStorage } from "../causalSessions";
import { lilRando } from "../lilRando";
import { writeSleepRead, WriteSleepReadResult } from "./core";

export const wsrWithInjectedCausality = async (caseId: string) => {
  const session = client.startSession({ causalConsistency: true });

  let result: WriteSleepReadResult;
  try {
    const asyncId = lilRando();
    let promise: Promise<WriteSleepReadResult> | undefined;
    asyncLocalSessionStorage.run({ asyncId, session }, () => {
      promise = writeSleepRead(caseId, 0, new ReadConcern("majority"));
    });

    if (!promise) {
      throw new Error("No promise");
    }
    result = await promise;
  } finally {
    await session.endSession();
  }

  return result;
};
