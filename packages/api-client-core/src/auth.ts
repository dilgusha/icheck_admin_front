import type { LoginPayload, TokenPair } from '@icheck/api-contracts'
import { readJsonResponse } from './http'

const BASE_URL = 'https://icheckapi.200soft.com'

export const authClient = {
  login: async (payload: LoginPayload): Promise<{ success: boolean }> => {
    const response = await fetch(`${BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return readJsonResponse(response, 'Login failed')
  },
}