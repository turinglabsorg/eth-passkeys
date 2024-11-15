import { providers, Wallet } from 'ethers'

/**
 * Types
 */
export interface EIP155Wallet {
  getMnemonic(): string
  getPrivateKey(): string
  getAddress(): string
  signMessage(message: string): Promise<string>
  _signTypedData(domain: any, types: any, data: any, _primaryType?: string): Promise<string>
  connect(provider: providers.JsonRpcProvider): Wallet
  signTransaction(transaction: providers.TransactionRequest): Promise<string>
}

/**
 * Library
 */
export default class EIP155Lib implements EIP155Wallet {
  wallet: {
    address: string
  }

  constructor(wallet: { address: string }) {
    this.wallet = wallet
  }

  async getWallet() {
    const fixedChallenge = new Uint8Array([1, 2, 3, 4]).buffer
    const signCredential = await navigator.credentials.get({
      publicKey: {
        rpId: process.env.NEXT_PUBLIC_PASSKEY_RP_ID,
        challenge: fixedChallenge,
        allowCredentials: []
      }
    })
    if (!signCredential) return
    // Combine multiple sources of authenticator data
    const authData = new Uint8Array((signCredential as any).response.authenticatorData)
    const publicKeyBytes = authData.slice(-65)
    const credentialId = new Uint8Array((signCredential as any).rawId)

    // Combine both sources into a single array
    const combinedData = new Uint8Array([...publicKeyBytes, ...credentialId])

    // Derive the key from the combined data
    const encryptionKey = await crypto.subtle.digest('SHA-256', combinedData)
    const keyHex = Array.from(new Uint8Array(encryptionKey))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Create Ethereum wallet from the key
    const wallet = new Wallet('0x' + keyHex)
    console.log('Wallet address:', wallet.address)
    return wallet
  }

  static async init() {
    const wallet = await EIP155Lib.prototype.getWallet()
    return new EIP155Lib({ address: wallet.address })
  }

  getMnemonic() {
    return 'NO MNEMONIC WITH PASSKEY'
  }

  getPrivateKey() {
    return 'NO PRIVATE KEY WITH PASSKEY'
  }

  getAddress() {
    return this.wallet.address
  }

  async signMessage(message: string) {
    const wallet = await this.getWallet()
    return wallet.signMessage(message)
  }

  async _signTypedData(domain: any, types: any, data: any, _primaryType?: string) {
    const wallet = await this.getWallet()
    return wallet._signTypedData(domain, types, data)
  }

  async connect(provider: providers.JsonRpcProvider) {
    const wallet = await this.getWallet()
    return wallet.connect(provider)
  }

  async signTransaction(transaction: providers.TransactionRequest) {
    const wallet = await this.getWallet()
    return wallet.signTransaction(transaction)
  }
}
