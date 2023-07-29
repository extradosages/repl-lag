import {
  MongoClient,
  ReadConcern,
  ReadPreference,
  WriteConcern,
} from "mongodb";
import {
  getAsyncId,
  getAsyncLocalSession,
  sessionDetails,
} from "./causalSessions";

import { getMongoDbUri } from "./config";
import createLogger from "./logging";

const logger = createLogger("backend");

export const client = new MongoClient(getMongoDbUri(), {
  connectTimeoutMS: 240000,
  serverSelectionTimeoutMS: 240000,
  socketTimeoutMS: 240000,
  waitQueueTimeoutMS: 240000,
  wtimeoutMS: 240000,
});
const db = client.db("test");
const collection = db.collection("test");

export const connect = () => client.connect();
export const disconnect = () => client.close();
export const reset = async () => {
  logger.info({}, "Resetting");
  await collection.insertOne({});
  await collection.deleteMany({});
};

export const nodeEnum = {
  Primary: "0",
  Secondary0: "1",
  Secondary1: "2",
} as const;

type Node = typeof nodeEnum[keyof typeof nodeEnum];

export const updateOnPrimary = async (caseId: string, value: string) => {
  const session = getAsyncLocalSession();
  const asyncId = getAsyncId();

  await collection.updateOne(
    { caseId },
    { $set: { value } },
    { session, upsert: true, writeConcern: new WriteConcern("majority") }
  );

  logger.trace(
    { asyncId, caseId, value, session: sessionDetails(session) },
    "Updating on primary"
  );
};

export const readFromNode = async (caseId: string, node: Node) => {
  const session = getAsyncLocalSession();
  const asyncId = getAsyncId();

  const result = await collection.findOne(
    { caseId },
    {
      readConcern: new ReadConcern("majority"),
      readPreference: new ReadPreference("nearest", [{ id: node }]),
      session,
    }
  );

  logger.trace(
    { asyncId, caseId, node, result, session: sessionDetails(session) },
    "Read from node"
  );

  if (!result) {
    throw new Error("no `result`");
  }
  return result.value as string;
};

export const readFromSecondaryPreferred = async (
  caseId: string,
  readConcern?: ReadConcern
) => {
  const session = getAsyncLocalSession();
  const asyncId = getAsyncId();

  const result = await collection.findOne(
    { caseId },
    {
      readConcern,
      readPreference: new ReadPreference("secondaryPreferred"),
      session,
    }
  );

  logger.trace(
    { asyncId, caseId, readConcern, result, session: sessionDetails(session) },
    "Read from secondary preferred"
  );

  if (!result) {
    throw new Error("no `result`");
  }
  return result.value as string;
};
