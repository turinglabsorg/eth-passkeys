import { providers, Wallet } from 'ethers'
import * as bip39 from 'bip39'

/**
 * Types
 */
export interface EIP155Wallet {
  getMnemonic(): string
  getPrivateKey(): string
  getAddress(): string
  exportMnemonic(): Promise<string>
  signMessage(message: string): Promise<string>
  _signTypedData(domain: any, types: any, data: any, _primaryType?: string): Promise<string>
  connect(provider: providers.JsonRpcProvider): Promise<Wallet | undefined>
  signTransaction(transaction: providers.TransactionRequest): Promise<string>
}

/**
 * Library
 */
export default class EIP155Lib implements EIP155Wallet {
  wallet: {
    address: string
    mnemonic?: string
  }

  constructor(wallet: { address: string; mnemonic?: string }) {
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
    const keyBytes = new Uint8Array(encryptionKey)

    // Generate mnemonic from the encryption key using all 32 bytes (256 bits) of entropy
    const mnemonic = bip39.entropyToMnemonic(Buffer.from(keyBytes))
    // Create wallet from mnemonic
    const wallet = Wallet.fromMnemonic(mnemonic)
    return { wallet, mnemonic }
  }

  static async init() {
    const result = await EIP155Lib.prototype.getWallet()
    if (!result) return ''
    return new EIP155Lib({
      address: result.wallet.address,
      mnemonic: result.mnemonic
    })
  }

  getMnemonic() {
    return this.wallet.mnemonic || 'NO MNEMONIC AVAILABLE'
  }

  async exportMnemonic() {
    const wallet = await this.getWallet()
    if (!wallet) return ''
    return wallet.mnemonic
  }

  getPrivateKey() {
    return 'NO PRIVATE KEY WITH PASSKEY'
  }

  getAddress() {
    return this.wallet.address
  }

  async signMessage(message: string) {
    const wallet = await this.getWallet()
    if (!wallet) return ''
    return wallet.wallet.signMessage(message)
  }

  async _signTypedData(domain: any, types: any, data: any, _primaryType?: string) {
    const wallet = await this.getWallet()
    if (!wallet) return ''
    return wallet.wallet._signTypedData(domain, types, data)
  }

  async connect(provider: providers.JsonRpcProvider) {
    const wallet = await this.getWallet()
    if (!wallet) return
    return wallet.wallet.connect(provider)
  }

  async signTransaction(transaction: providers.TransactionRequest) {
    const wallet = await this.getWallet()
    if (!wallet) return ''
    return wallet.wallet.signTransaction(transaction)
  }
}
