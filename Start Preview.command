#!/bin/zsh
cd -- "${0:A:h}"
python3 -m http.server 8040 --bind 127.0.0.1
