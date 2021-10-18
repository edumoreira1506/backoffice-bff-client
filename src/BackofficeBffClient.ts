import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import { IUser, IBreeder, IBreederImage, IPoultry } from '@cig-platform/types';
import { RequestErrorHandler } from '@cig-platform/decorators';

interface RequestSuccess {
  ok: true;
}

export interface PostUserRequestSuccess extends RequestSuccess {
  breeder: IBreeder;
  user: IUser;
}

export interface GetBreederRequestSuccess extends RequestSuccess {
  breeder: IBreeder & { images: IBreederImage[] }
}

export interface PostPoultryRequestSuccess extends RequestSuccess {
  poultry: IPoultry;
}

export interface GetPoultriesRequestSuccess extends RequestSuccess {
  poultries: IPoultry[];
}


export const FILE_KEYS = ['newImages', 'files'];

export const toFormData = (object: Record<string, any>) => {
  const formData = new FormData();

  Object.entries(object).forEach(([key, value]) => {
    if (FILE_KEYS.includes(key)) {
      value.forEach((file: any) => (
        formData.append(key, file)
      ));
    } else {
      formData.append(key, value);
    }
  });

  return formData;
};

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

  @RequestErrorHandler()
  async editBreeder(
    breederId: string,
    token: string,
    breeder: Partial<IBreeder>,
    newImages: File[],
    removedImageIds: string[] = []
  ) {
    const { data } = await this._axiosBackofficeBffInstance.patch<RequestSuccess>(
      `/v1/breeders/${breederId}`, 
      toFormData({
        ...breeder,
        newImages,
        deletedImages: removedImageIds.join(',')
      }),
      {
        headers: {
          'X-Cig-Token': token,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return data;
  }

  @RequestErrorHandler()
  async getBreeder(breederId: string, token: string) {
    const { data } = await this._axiosBackofficeBffInstance.get<GetBreederRequestSuccess>(
      `/v1/breeders/${breederId}`, 
      {
        headers: {
          'X-Cig-Token': token,
        }
      }
    );

    return data;
  }

  @RequestErrorHandler()
  async postPoultry(breederId: string, token: string, poultry: IPoultry) {
    const { data } = await this._axiosBackofficeBffInstance.post<PostPoultryRequestSuccess>(
      `/v1/breeders/${breederId}/poultries`,
      poultry,
      {
        headers: {
          'X-Cig-Token': token,
        }
      },
    );

    return data;
  }

  @RequestErrorHandler([])
  async getPoultries(breederId: string, token: string) {
    const { data } = await this._axiosBackofficeBffInstance.get<GetPoultriesRequestSuccess>(
      `/v1/breeders/${breederId}/poultries`,
      {
        headers: {
          'X-Cig-Token': token,
        }
      },
    );

    return data.poultries;
  }
}
