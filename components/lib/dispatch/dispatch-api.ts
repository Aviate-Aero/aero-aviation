import { DISPATCH_API_BASE } from "@/components/constants/dispatch/dispatch"

export interface MetarResponse {
  full: string
  provider: string
}

export interface NotamResponse {
  text: string
}

export class DispatchAPI {
  private baseUrl: string

  constructor(baseUrl: string = DISPATCH_API_BASE) {
    this.baseUrl = baseUrl
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, { cache: "no-store" })
      return response.ok
    } catch {
      return false
    }
  }

  async getMetar(icao: string): Promise<MetarResponse> {
    const response = await fetch(`${this.baseUrl}/api/metar/${icao}`, { cache: "no-store" })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return response.json()
  }

  async getNotam(icao: string): Promise<NotamResponse> {
    const response = await fetch(`${this.baseUrl}/api/notam/${icao}`, { cache: "no-store" })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return response.json()
  }

  async getMultipleMetars(icaos: string[]): Promise<MetarResponse[]> {
    return Promise.all(icaos.map((icao) => this.getMetar(icao)))
  }
}

export const dispatchAPI = new DispatchAPI()
