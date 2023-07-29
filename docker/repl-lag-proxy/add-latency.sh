if [ -z "$INTERFACE" ]
then
    echo 'INTERFACE not set'
    exit 1
fi

if [ -z "$LATENCY_MS" ]
then
    echo '`LATENCY_MS` not set'
    exit 1
fi

LATENCY="$LATENCY_MS"ms
echo "Adding $LATENCY of latency to interface $INTERFACE"
tc qdisc add dev $INTERFACE root netem delay $LATENCY

