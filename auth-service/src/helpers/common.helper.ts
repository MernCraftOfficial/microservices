import { Username } from '../models/user.model';

export function extractUsername(username: string): Username {
  const firstSpaceIndex = username.indexOf(' ');
  let firstname = '',
    lastname = '';

  // If space exists
  if (firstSpaceIndex !== -1) {
    firstname = username.slice(0, firstSpaceIndex);
    lastname = username.slice(firstSpaceIndex + 1);
  } else {
    firstname = username;
  }

  return { firstname, lastname };
}

export const removeKey = function (this: any, ...keys: any) {
  return Object.keys(this)
    .filter((objKey) => !keys.includes(objKey))
    .reduce((newObj: any, key) => {
      newObj[key] = this[key];
      return newObj;
    }, {});
};

export const sanitizeSearch = (str: string): string => {
  return str.replace(/[*+?^${}()|[\]\\]/g, '\\$&');
};

export const retrieveJwtToken = (token: string | undefined) => {
  if (!token) {
    return null;
  }

  const firstSpaceIndex = token.indexOf(' ');

  if (token.startsWith('Bearer') && firstSpaceIndex) {
    return token.split(' ')[1];
  }

  return token;
};
