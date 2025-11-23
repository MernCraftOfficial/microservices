import { fetchHelper, fetchProps, Response } from '../helper/fetchHelper';

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

export default { getFriendsDataByIds };
