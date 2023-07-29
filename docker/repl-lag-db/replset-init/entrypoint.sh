#!/bin/bash
if [ -z "$PRIMARY_URL" ]
then
    echo 'PRIMARY_URL not set'
    exit 1
fi

if [ -z "$REPLSET_NAME" ]
then
  echo 'REPLSET_NAME not set'
  exit 1
fi

if [ -z "$PRIMARY_NODE_URL" ]
then
  echo 'PRIMARY_NODE_URL not set'
  exit 1
fi

if [ -z "$SECONDARY_NODE_0_URL" ]
then
    echo 'SECONDARY_NODE_0_URL not set'
    exit 1
fi

if [ -z "$SECONDARY_NODE_1_URL" ]
then
    echo 'SECONDARY_NODE_1_URL not set'
    exit 1
fi

SCRIPT=$(cat <<-END
rs.initiate(
  {
    _id: "$REPLSET_NAME",

    members: [
      { _id: 0, host: "$PRIMARY_NODE_URL", tags: { id: "0" }, priority: 1 },
      { _id: 1, host: "$SECONDARY_NODE_0_URL", tags: { id: "1" }, priority: 0 },
      { _id: 2, host: "$SECONDARY_NODE_1_URL", tags: { id: "2" }, priority: 0 },
    ],

    settings: {
      heartbeatTimeoutSecs: 10,
      electionTimeoutMillis: 10000,
      catchUpTimeoutMillis: 10000,
    }
  }
);
END
)

echo "Executing the following script:"
echo "$SCRIPT"

mongo \
  --host $PRIMARY_URL \
  --port 27017 \
  --eval "$SCRIPT"

# Wait until the first member is primary
# This should always eventually happen because the first member priority is 1
# and the second member priority is 0
until [ "$(mongo --host $PRIMARY_URL --eval 'rs.status()' | grep state | head -n 1 | grep -Po '(\d)')" = "1" ]
do
  echo "Waiting for primary"
  sleep 2
done

echo "Replica set initialization complete"
exit 0