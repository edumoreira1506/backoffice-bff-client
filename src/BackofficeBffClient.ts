import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import {
  IUser,
  IBreeder,
  IBreederImage,
  IPoultry,
  IBreederContact,
  IPoultryImage,
  IPoultryRegister,
  IAdvertising,
  IAdvertisingQuestionAnswer
} from '@cig-platform/types';
import { RequestErrorHandler } from '@cig-platform/decorators';

interface RequestSuccess {
  ok: true;
}

export interface PostUserRequestSuccess extends RequestSuccess {
  breeder: IBreeder;
  user: IUser;
}

export interface GetBreederRequestSuccess extends RequestSuccess {
  breeder: IBreeder & { images: IBreederImage[] } & { contacts: IBreederContact[] }
}

export interface PostPoultryRequestSuccess extends RequestSuccess {
  poultry: IPoultry;
}

export interface PostAdvertisingRequestSuccess extends RequestSuccess {
  advertising: IAdvertising;
}

export interface GetPoultryRequestSuccess extends RequestSuccess {
  poultry: IPoultry & { images: IPoultryImage[]; registers: IPoultryRegister[] };
  advertisings: IAdvertising[];
}

interface Poultry extends IPoultry {
  mainImage?: string;
}

export interface GetPoultriesRequestSuccess extends RequestSuccess {
  reproductives: Poultry[];
  matrix: Poultry[];
  male: Poultry[];
  female: Poultry[];
}

export interface GetPoultryRegistersRequestSuccess extends RequestSuccess {
  registers: IPoultryRegister[];
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
  async updateBreeder(
    breederId: string,
    token: string,
    breeder: Partial<IBreeder>,
    newImages: File[],
    removedImageIds: string[] = [],
    removedContactIds: string[] = [],
    contacts: Partial<IBreederContact>[] = []
  ) {
    const { data } = await this._axiosBackofficeBffInstance.patch<RequestSuccess>(
      `/v1/breeders/${breederId}`, 
      toFormData({
        ...breeder,
        newImages,
        deletedImages: removedImageIds.join(','),
        deletedContacts: removedContactIds.join(','),
        contacts: JSON.stringify(contacts)
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
  async postPoultry(
    breederId: string,
    token: string,
    poultry: Partial<IPoultry>,
    images: File[] = [],
  ) {
    const { data } = await this._axiosBackofficeBffInstance.post<PostPoultryRequestSuccess>(
      `/v1/breeders/${breederId}/poultries`,
      toFormData({
        poultry: JSON.stringify(poultry),
        files: images
      }),
      {
        headers: {
          'X-Cig-Token': token,
          'Content-Type': 'multipart/form-data'
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

    return {
      male: data.male,
      matrix: data.matrix,
      female: data.female,
      reproductives: data.reproductives,
    };
  }

  @RequestErrorHandler()
  async getPoultry(breederId: string, poultryId: string, token: string) {
    const { data } = await this._axiosBackofficeBffInstance.get<GetPoultryRequestSuccess>(
      `/v1/breeders/${breederId}/poultries/${poultryId}`,
      {
        headers: {
          'X-Cig-Token': token,
        }
      },
    );

    return data;
  }

  @RequestErrorHandler()
  async updatePoultry(
    breederId: string,
    poultryId: string,
    token: string,
    poultry: Partial<IPoultry>,
    images: File[] = [],
    deletedImages: string[] = []
  ) {
    await this._axiosBackofficeBffInstance.patch(
      `/v1/breeders/${breederId}/poultries/${poultryId}`,
      toFormData({
        poultry: JSON.stringify(poultry),
        files: images,
        deletedImages: deletedImages.join(',')
      }),
      {
        headers: {
          'X-Cig-Token': token,
          'Content-Type': 'multipart/form-data'
        }
      },
    );
  }

  @RequestErrorHandler()
  async postRegister(
    breederId: string,
    poultryId: string,
    token: string,
    register: Partial<IPoultryRegister>,
    files: File[] = [],
  ) {
    await this._axiosBackofficeBffInstance.post(
      `/v1/breeders/${breederId}/poultries/${poultryId}/registers`,
      toFormData({
        register: JSON.stringify(register),
        files,
      }),
      {
        headers: {
          'X-Cig-Token': token,
          'Content-Type': 'multipart/form-data'
        }
      },
    );
  }

  @RequestErrorHandler()
  async getRegisters(
    breederId: string,
    poultryId: string,
    token: string,
    registerType = ''
  ) {
    return this._axiosBackofficeBffInstance.get<GetPoultryRegistersRequestSuccess>(
      `/v1/breeders/${breederId}/poultries/${poultryId}/registers`,
      {
        headers: {
          'X-Cig-Token': token,
        },
        params: {
          registerType
        }
      },
    );
  }

  @RequestErrorHandler()
  async transferPoultry(
    breederId: string,
    poultryId: string,
    targetBreederId: string,
    token: string,
  ) {
    await this._axiosBackofficeBffInstance.post(
      `/v1/breeders/${breederId}/poultries/${poultryId}/transfer`,
      {
        breederId: targetBreederId
      },
      {
        headers: {
          'X-Cig-Token': token,
        }
      },
    );
  }

  @RequestErrorHandler()
  async postAdvertising(
    breederId: string,
    poultryId: string,
    token: string,
    advertising: Partial<IAdvertising>,
  ) {
    const { data } = await this._axiosBackofficeBffInstance.post<PostAdvertisingRequestSuccess>(
      `/v1/breeders/${breederId}/poultries/${poultryId}/advertisings`,
      { advertising },
      {
        headers: {
          'X-Cig-Token': token,
        }
      },
    );

    return data.advertising;
  }

  @RequestErrorHandler()
  async removeAdvertising(
    breederId: string,
    poultryId: string,
    advertisingId: string,
    token: string,
  ) {
    await this._axiosBackofficeBffInstance.delete(
      `/v1/breeders/${breederId}/poultries/${poultryId}/advertisings/${advertisingId}`,
      {
        headers: {
          'X-Cig-Token': token,
        }
      },
    );
  }

  @RequestErrorHandler()
  async updateAdvertising(
    breederId: string,
    poultryId: string,
    advertisingId: string,
    token: string,
    price: number
  ) {
    await this._axiosBackofficeBffInstance.patch(
      `/v1/breeders/${breederId}/poultries/${poultryId}/advertisings/${advertisingId}`,
      { price },
      {
        headers: {
          'X-Cig-Token': token,
        }
      },
    );
  }

  @RequestErrorHandler()
  async postAdvertisingQuestionAnswer(
    breederId: string,
    poultryId: string,
    advertisingId: string,
    questionId: string,
    token: string,
    answer: IAdvertisingQuestionAnswer
  ) {
    return this._axiosBackofficeBffInstance.post(
      `/v1/breeders/${breederId}/poultries/${poultryId}/advertisings/${advertisingId}/questions/${questionId}/answers`,
      { answer },
      {
        headers: {
          'X-Cig-Token': token,
        }
      },
    );
  }
}
