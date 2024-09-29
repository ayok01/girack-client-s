# Girak-S

Girack chatのモバイル対応を目指して

## 起動方法

`.env`を作成して、
`PUBLIC_BACKEND_ADDRESS={バックエンドのURL}`の中を表示してください

### npmで起動する

`npm install`
`npm run dev`

#### Dockerで起動する方法

`docker build -t sveltekit-app .`

`docker run -p 5173:4173 sveltekit-app`
