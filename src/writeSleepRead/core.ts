import { ReadConcern } from "mongodb";

import {
  nodeEnum,
  readFromNode,
  readFromSecondaryPreferred,
  updateOnPrimary,
} from "../backend";
import { lilRando } from "../lilRando";
import createLogger from "../logging";
import { sleep } from "../sleep";

export type WriteSleepReadResult = {
  writtenToPrimary: string;
  readFromPrimary: string;
  readFromSecondary0: string;
  readFromSecondary1: string;
  readFromSecondaryPreferred: string;
};

const wrsLogger = createLogger("writeSleepRead");
export const writeSleepRead = async (
  caseId: string,
  sleepMs: number,
  readConcern: ReadConcern
): Promise<WriteSleepReadResult> => {
  wrsLogger.trace({ caseId, sleepMs }, "Write-sleep-reading");
  const writtenToPrimary = lilRando();

  await updateOnPrimary(caseId, writtenToPrimary);
  await sleep(sleepMs);
  const [
    readFromPrimary,
    readFromSecondary0,
    readFromSecondary1,
    readFromSecondaryPreferred_,
  ] = await Promise.all([
    readFromNode(caseId, nodeEnum.Primary),
    readFromNode(caseId, nodeEnum.Secondary0),
    readFromNode(caseId, nodeEnum.Secondary1),
    readFromSecondaryPreferred(caseId, readConcern),
  ]);

  const result: WriteSleepReadResult = {
    writtenToPrimary,
    readFromPrimary,
    readFromSecondary0,
    readFromSecondary1,
    readFromSecondaryPreferred: readFromSecondaryPreferred_,
  };
  wrsLogger.debug({ caseId, result }, "Write-sleep-read summary");

  return result;
};
