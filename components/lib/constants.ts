export interface UserCredential {
  id: string
  username: string
  password: string
  email?: string
}

export const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin@2025",
  email: "admin@aerodatapro.com",
}