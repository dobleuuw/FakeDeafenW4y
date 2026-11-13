#!/bin/bash
# copia el plugin a Vencord y compila
set -e
export PATH=~/.npm-global/bin:$PATH
rm -rf ~/vencord-src/src/userplugins/fakeDeafen
cp -r "$(dirname "$0")/fakeDeafen" ~/vencord-src/src/userplugins/fakeDeafen
cd ~/vencord-src && pnpm build
