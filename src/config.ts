export const getMongoDbUri = () => {
  const value = process.env["MONGODB_URI"];
  if (!value) {
    throw new Error("no `MONGODB_URI`");
  }

  return value;
};

export const getLogLevel = () => process.env["LOG_LEVEL"] || "info";

export const getLogShouldPrettyPrint = () =>
  process.env["LOG_SHOULD_PRETTY_PRINT"] === "true";
