#!/bin/sh
set -eu
cd "$(dirname "$0")"
node scripts/uninstall.mjs
printf '\n卸载流程已完成，按回车键关闭窗口。'
read -r _answer
