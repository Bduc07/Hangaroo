// src/services/api.ts
export const api = async (
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any,
  token?: string,
) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  return res.json();
};
