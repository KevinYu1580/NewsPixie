import { getPublicKeyPem } from '~/server/utils/asymmetric'

export default defineEventHandler(() => {
  return { pubkey: getPublicKeyPem() }
})
