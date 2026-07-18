#!/bin/bash
set -e

# 前回の強制終了などで残ってしまった「サーバー起動中フラグ（server.pid）」を削除する
rm -f /app/tmp/pids/server.pid

# 本来起動したかったプロセス（Railsサーバーなど）を実行する
exec "$@"