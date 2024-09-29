import { PUBLIC_BACKEND_ADDRESS } from "$env/static/public";
import { userStore, sessionIdStore } from "$lib/store/userInfoStore";
import { get } from "svelte/store";

const apiUrl = `${PUBLIC_BACKEND_ADDRESS}`;

export const blobUrlCache = new Map<
  string, //ファイルId
  {
    fileName: string;
    status: "DONE" | "FETCHING" | "FAILED";
    blobUrl: string;
  }
>();

/**
 * blobURLをキャッシュへ登録する
 * @param fileId
 * @param blobUrl
 */
export function registerBlobUrl(
  fileId: string,
  args: {
    fileName: string;
    status: "DONE" | "FETCHING" | "FAILED";
    blobUrl: string;
  },
) {
  //キャッシュへ登録
  blobUrlCache.set(fileId, args);

  //もしキャッシュが30以上になっているなら削る
  if (blobUrlCache.size > 30) {
    //順番を取り出すためのハンドラを作る
    const firstObjectHandler = blobUrlCache.entries();
    //ファイルIdにあたるものを取得
    const firstObject: [string, string] = firstObjectHandler.next().value;
    //ファイルIDとURLに分ける
    const firstFileId = firstObject[0];
    const firstBlobUrl = firstObject[1];

    //blobURLを無効化
    URL.revokeObjectURL(firstBlobUrl);
    //キャッシュから削除
    blobUrlCache.delete(firstFileId);
  }
}

/**
 * blobURLキャッシュからURLを取得
 * @param fileId
 * @returns
 */
export function getBlobUrl(fileId: string):
  | {
      fileName: string;
      status: "DONE" | "FETCHING" | "FAILED";
      blobUrl: string;
    }
  | undefined {
  return blobUrlCache.get(fileId);
}

/**
 * BlobUrl削除
 * @param fileId
 */
export function deleteBlobUrl(fileId: string) {
  const fileBlobData = blobUrlCache.get(fileId);
  if (fileBlobData === undefined) return;

  //blobURLを無効化
  URL.revokeObjectURL(fileBlobData.blobUrl);
  //キャッシュから削除
  blobUrlCache.delete(fileId);
}

/**
 * ファイルダウンロード用のURLを生成する
 * @param fileId プレビューしたい画像のファイルId
 */
const prepareFile = async (fileId: string) => {
  const getMyUserinfo = get(userStore);
  const sessionId = get(sessionIdStore);
  if (getBlobUrl(fileId) !== undefined) return;

  //取得中と登録
  registerBlobUrl(fileId, {
    fileName: "",
    status: "FETCHING",
    blobUrl: "/loading.svg",
  });

  //console.log("FileDataPreview :: prepareFile : 準備します->", fileId);

  const formData = new FormData();

  // JSONデータを文字列に変換して追加
  formData.append(
    "metadata",
    JSON.stringify({
      RequestSender: {
        userId: getMyUserinfo.userId,
        sessionId: sessionId,
      },
    }),
  );

  //ファイル取得
  const response = await fetch(`/downloadfile/${fileId}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    //blobキャッシュへ保存
    registerBlobUrl(fileId, { fileName: "", status: "FAILED", blobUrl: "" });
    return;
  }

  // Content-Dispositionヘッダーからファイル名を取得
  const contentDisposition = response.headers.get("Content-Disposition");
  let fileName = "download"; // デフォルトのファイル名
  if (contentDisposition) {
    const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/i);
    if (fileNameMatch) {
      fileName = fileNameMatch[1];
    }
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  //blobキャッシュへ保存
  registerBlobUrl(fileId, { fileName: fileName, status: "DONE", blobUrl: url });

  //ファイルデータ用JSONへ格納
  const fileBlobArr = {
    fileName: fileName,
    blobUrl: url,
  };

  return fileBlobArr;
};

/**
 * ファイルのavater Urlを取得する
 * @param userId
 */
export const getAvatarUrl = (userId: string) => {
  const url = `${apiUrl}/icon/${userId}`;
  return url;
};
