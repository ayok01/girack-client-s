import { PUBLIC_BACKEND_ADDRESS } from "$env/static/public";

const apiUrl = `${PUBLIC_BACKEND_ADDRESS}`;

/**
 * ファイルのavater Urlを作成する
 * @param userId
 */
export const getAvatarUrl = (userId: string) => {
  const url = `${apiUrl}/icon/${userId}`;
  return url;
};
