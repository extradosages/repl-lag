import { ReadConcern } from "mongodb";
import { writeSleepRead } from "./core";

export const wsrNaive = (caseId: string, sleepMs: number) =>
  writeSleepRead(caseId, sleepMs, new ReadConcern("local"));
