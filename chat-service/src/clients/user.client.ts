import { fetchHelper, fetchProps, Response } from '../helpers/fetch.helper';

export async function getFriendsDataByIds(ids: string[]) {
  const params: { path: string; options: fetchProps } = {
    path: `/user/usersData?ids=${ids.join(',')}`,
    options: {
      method: 'GET',
    },
  };

  const response: Response = await fetchHelper(params);
  return response;
}

export async function updateUserStatus(status: string, accessToken: string) {
  const params: { path: string; options: fetchProps } = {
    path: `/user/updateUserStatus`,
    options: {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      method: 'PATCH',
    },
  };

  const response: Response = await fetchHelper(params);
  return response;
}

const defaultExport = { getFriendsDataByIds, updateUserStatus };

export default defaultExport;
