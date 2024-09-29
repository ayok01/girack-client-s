# ベースイメージとしてNode.jsを使用
FROM node:20.11-bullseye AS builder

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./

RUN npm ci

COPY . .
COPY .env ./

RUN npm run build

# 実行用
FROM node:20.11-bullseye

WORKDIR /app

## ビルド用のレイヤからコピーする
COPY --from=builder /app ./

# ポートを公開
EXPOSE 6173

# サーバーを起動するコマンドを設定
CMD ["npm", "run", "preview", "--", "--host"]