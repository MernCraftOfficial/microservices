import env from '../config/env';

type Methods = 'POST' | 'GET' | 'PUT' | 'PATCH' | 'OPTIONS' | 'HEAD' | 'DELETE';
export interface Response {
  success: boolean;
  message: string;
  data: any;
}
export interface fetchProps {
  method: Methods;
  headers?: any;
  body?: any;
  credentials?: string;
}

export async function fetchHelper({
  path,
  options,
}: {
  path: string;
  options: fetchProps;
}) {
  //validate headers
  if (!options.headers) {
    options.headers = {
      'Content-Type': 'application/json',
    };
  }

  // validate body
  if (!options.body) {
    delete options.body;
  } else if (typeof options.body === 'object') {
    options.body = JSON.stringify(options.body);
  }

  //validate url
  let json_response = null;
  const url = env?.EMAIL_SERVICE + (path ?? '');

  let errorMessage = null;
  //fetch
  try {
    const response = await fetch(url, { ...options, credentials: 'include' });
    json_response = await response.json();
    if (response.status !== 200) {
      errorMessage = 'Something went wrong';
      if (typeof json_response?.data == 'string') {
        errorMessage = json_response?.data;
      }
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    console.error(error.message);
  } finally {
    if (errorMessage) {
      return { ...json_response, errorMessage };
    }

    console.table({ path, options, json_response });
    return json_response;
  }
}
