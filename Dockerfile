# ベースイメージとしてNode.jsを使用
FROM node:18

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# アプリケーションのソースコードをコピー
COPY . .
COPY .env .env
# ビルドコマンドを実行
RUN npm run build

# ポートを公開
EXPOSE 4173

# サーバーを起動するコマンドを設定
CMD ["npm", "run", "preview"]