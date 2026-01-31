import BASE_URL from '../config/baseUrl';

export const api = async (
  endpoint: string,
  method: string,
  body?: any,
  token?: string,
) => {
  let headers: any = {};

  if (token) headers['Authorization'] = `Bearer ${token}`;

  // For JSON body
  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body,
  });

  return response.json();
};
