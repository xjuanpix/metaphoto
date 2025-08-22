import {PhotoModel, PhotoFiltersModel} from "@/types";
import axios from "axios";

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://.com'
  : 'http://localhost:3001'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

export const api = {
  async getPhoto(id: number): Promise<PhotoModel> {
    const response = await apiClient.get(`/photos/${id}`)
    return response.data
  },

  async getPhotos(filters: PhotoFiltersModel = {}, signal?: AbortSignal): Promise<PhotoModel[]> {
    const response = await apiClient.get('/photos', {
      params: filters,
      signal
    })
    return response.data
  },
}