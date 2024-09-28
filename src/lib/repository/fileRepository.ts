import { PUBLIC_BACKEND_ADDRESS } from "$env/static/public";
const apiUrl = `${PUBLIC_BACKEND_ADDRESS}`;

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${apiUrl}/uploadfile`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("File upload failed");
  }

  return response.json();
};

export async function fetchFile(id: string) {
  const response = await fetch(`${apiUrl}/fetchfile/${id}`);

  if (!response.ok) {
    throw new Error("File fetch failed");
  }

  return response.json();
}

export async function downloadFile(id: string) {
  const response = await fetch(`${apiUrl}/downloadfile/${id}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("File download failed");
  }

  return response.json();
}
