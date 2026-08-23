#!/bin/sh
set -eu
cd "$(dirname "$0")"
node scripts/install.mjs
printf '\n安装流程已完成，按回车键关闭窗口。'
read -r _answer
