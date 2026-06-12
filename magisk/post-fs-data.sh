#!/system/bin/sh

DATA_DIR=/data/local/dashscope-proxy

mkdir -p "$DATA_DIR"

if [ ! -f "$DATA_DIR/config.json" ]; then
  cp "$MODDIR/files/default-config.json" "$DATA_DIR/config.json"
  chmod 600 "$DATA_DIR/config.json"
fi

mkdir -p "$DATA_DIR/state"
