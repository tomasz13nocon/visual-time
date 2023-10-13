#!/bin/sh

pm2 stop visual-time
git pull
pnpm i
pnpm run build
pnpm exec prisma migrate deploy
pnpm exec prisma generate
pm2 start visual-time
