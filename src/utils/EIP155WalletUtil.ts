import EIP155Lib from '@/lib/EIP155Lib'
import { smartAccountWallets } from './SmartAccountUtil'
import { getWalletAddressFromParams } from './HelperUtil'

export let wallet1: EIP155Lib
export let wallet2: EIP155Lib
export let eip155Wallets: Record<string, EIP155Lib>
export let eip155Addresses: string[]

let address1: string
let address2: string

/**
 * Utilities
 */
export async function createOrRestoreEIP155Wallet() {
  const wallet1 = await EIP155Lib.init()
  const address1 = wallet1.getAddress()
  eip155Wallets = {
    [address1]: wallet1
  }
  eip155Addresses = Object.keys(eip155Wallets)

  return {
    eip155Wallets,
    eip155Addresses
  }
}

/**
 * Get wallet for the address in params
 */
export const getWallet = async (params: any) => {
  const eoaWallet = eip155Wallets[getWalletAddressFromParams(eip155Addresses, params)]
  if (eoaWallet) {
    return eoaWallet
  }

  /**
   * Smart accounts
   */
  const chainId = params?.chainId?.split(':')[1]
  console.log('Chain ID', { chainId })
  console.log('PARAMS', { params })

  const address = getWalletAddressFromParams(
    Object.keys(smartAccountWallets)
      .filter(key => {
        const parts = key.split(':')
        return parts[0] === chainId
      })
      .map(key => {
        return key.split(':')[1]
      }),
    params
  )
  if (!address) {
    console.log('Library not initialized for requested address', {
      address,
      values: Object.keys(smartAccountWallets)
    })
    throw new Error('Library not initialized for requested address')
  }
  const lib = smartAccountWallets[`${chainId}:${address}`]
  if (lib) {
    return lib
  }
  console.log('Library not found', {
    target: `${chainId}:address`,
    values: Object.keys(smartAccountWallets)
  })
  throw new Error('Cannot find wallet for requested address')
}
