import { EIP155Chain } from '@/data/EIP155Data'
import SettingsStore from '@/store/SettingsStore'
import {
  createOrRestoreBiconomySmartAccount,
  createOrRestoreKernelSmartAccount,
  createOrRestoreSafeSmartAccount,
  smartAccountWallets
} from '@/utils/SmartAccountUtil'

import { useSnapshot } from 'valtio'

export default function useSmartAccounts() {
  const {
    smartAccountEnabled,
    kernelSmartAccountEnabled,
    safeSmartAccountEnabled,
    biconomySmartAccountEnabled
  } = useSnapshot(SettingsStore.state)

  const initializeSmartAccounts = async (privateKey: string) => {}

  const getAvailableSmartAccounts = () => {
    if (!smartAccountEnabled) {
      return []
    }
    const accounts = []
    for (const [key, lib] of Object.entries(smartAccountWallets)) {
      accounts.push({
        address: key.split(':')[1],
        type: lib.type,
        chain: lib.chain
      })
    }

    return accounts
  }

  const getAvailableSmartAccountsOnNamespaceChains = (chains: string[] | undefined) => {
    if (!smartAccountEnabled || chains === undefined) {
      return []
    }
    const accounts = []
    for (const [key, lib] of Object.entries(smartAccountWallets)) {
      accounts.push({
        address: key.split(':')[1],
        type: lib.type,
        chain: lib.chain
      })
    }

    const filteredAccounts = accounts.filter(account =>
      chains.some(chain => chain && parseInt(chain.split(':')[1]) === account.chain.id)
    )
    return filteredAccounts
  }

  return {
    initializeSmartAccounts,
    getAvailableSmartAccounts,
    getAvailableSmartAccountsOnNamespaceChains
  }
}
