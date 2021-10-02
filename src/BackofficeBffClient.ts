import axios, { AxiosInstance } from 'axios';
import { IUser, IBreeder, ErrorRequest } from '@cig-platform/types';

export interface PostUserRequestSuccess {
  ok: true;
  breeder: IBreeder;
  user: IUser;
}

export interface RequestSuccess {
  ok: true;
  token: string;
}

export default class BackofficeBffClient {
  private _axiosBackofficeBffInstance: AxiosInstance;

  constructor(backofficeBffUrl: string) {
    this._axiosBackofficeBffInstance = axios.create({
      baseURL: backofficeBffUrl,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH',
      }
    });
  }

  async editBreeder(breederId: string, token: string, breeder: Partial<IBreeder>) {
    try {
      const { data } = await this._axiosBackofficeBffInstance.patch<RequestSuccess>(`/v1/breeders/${breederId}`, { breeder }, {
        headers: {
          'X-Cig-Token': token
        }
      });

      return data;
    } catch (error) {
      if (!axios.isAxiosError(error)) return null;

      const bodyData = error.response?.data as unknown as ErrorRequest;

      return bodyData;
    }
  }
}
