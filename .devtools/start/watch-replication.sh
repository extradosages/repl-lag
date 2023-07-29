CMD='docker exec -it xdsgs.repl-lag.db.primary mongo --eval "rs.printSecondaryReplicationInfo()"'
watch --interval 0.5 "$CMD"