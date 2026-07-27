export const sanitizeSearch = (str: string): string => {
  return str.replace(/[*+?^${}()|[\]\\]/g, "\\$&");
};

export const retrieveJwtToken = (token: string | undefined) => {
  if (!token) {
    return null;
  }

  const firstSpaceIndex = token.indexOf(" ");

  if (token.startsWith("Bearer") && firstSpaceIndex) {
    return token.split(" ")[1];
  }

  return token;
};
