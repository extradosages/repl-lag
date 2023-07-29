import pino from 'pino';
import callsites from 'callsites';
import { getLogLevel, getLogShouldPrettyPrint } from './config';

const rootLogger = pino({
  level: getLogLevel(),
  prettyPrint: getLogShouldPrettyPrint(),
});

/**
 * Construct a logger which tracks the module containing the callsite,
 * qualified by an arbitrary namespace
 *
 * This makes a call to `callsites` which may be slow; recommended usage is
 * to initialize logger once at the beginning of the module
 */
const createLogger = (namespace: string): pino.Logger => {
  const sites = callsites();

  return rootLogger.child({
    module: sites[1].getFileName(),
    namespace,
  });
};

export default createLogger;
