import { AsyncLocalStorage } from "async_hooks";

import { ClientSession } from "mongodb";

export const asyncLocalSessionStorage = new AsyncLocalStorage<{
  asyncId: string;
  session: ClientSession;
}>();

export const getAsyncLocalSession = () => {
  const store = asyncLocalSessionStorage.getStore();
  return store?.session;
};

export const getAsyncId = () => {
  const store = asyncLocalSessionStorage.getStore();
  return store?.asyncId;
};

export const sessionDetails = (session?: ClientSession) => ({
  id: session?.id,
  clusterTime: session?.clusterTime?.clusterTime,
  operationTime: session?.operationTime,
});
