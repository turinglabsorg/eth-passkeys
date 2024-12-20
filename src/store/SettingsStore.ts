import { Verify, SessionTypes } from '@walletconnect/types'
import { proxy } from 'valtio'

const TEST_NETS_ENABLED_KEY = 'TEST_NETS'
const CA_ENABLED_KEY = 'CHAIN_ABSTRACTION'
const SMART_ACCOUNTS_ENABLED_KEY = 'SMART_ACCOUNTS'
const ZERO_DEV_SMART_ACCOUNTS_ENABLED_KEY = 'ZERO_DEV_SMART_ACCOUNTS'
const SAFE_SMART_ACCOUNTS_ENABLED_KEY = 'SAFE_SMART_ACCOUNTS'
const BICONOMY_SMART_ACCOUNTS_ENABLED_KEY = 'BICONOMY_SMART_ACCOUNTS'
const MODULE_MANAGEMENT_ENABLED_KEY = 'MODULE_MANAGEMENT'

/**
 * Types
 */
interface State {
  testNets: boolean
  account: number
  eip155Address: string
  cosmosAddress: string
  solanaAddress: string
  polkadotAddress: string
  nearAddress: string
  multiversxAddress: string
  tronAddress: string
  tezosAddress: string
  kadenaAddress: string
  bip122Address: string
  kernelSmartAccountAddress: string
  safeSmartAccountAddress: string
  biconomySmartAccountAddress: string
  relayerRegionURL: string
  activeChainId: string
  currentRequestVerifyContext?: Verify.Context
  sessions: SessionTypes.Struct[]
  smartAccountSponsorshipEnabled: boolean
  smartAccountEnabled: boolean
  kernelSmartAccountEnabled: boolean
  safeSmartAccountEnabled: boolean
  biconomySmartAccountEnabled: boolean
  moduleManagementEnabled: boolean
  chainAbstractionEnabled: boolean
}

/**
 * State
 */
const state = proxy<State>({
  testNets:
    typeof localStorage !== 'undefined'
      ? Boolean(localStorage.getItem(TEST_NETS_ENABLED_KEY))
      : true,
  account: 0,
  activeChainId: '1',
  eip155Address:
    typeof localStorage !== 'undefined' ? localStorage.getItem('lastEthPasskey') || '' : '',
  cosmosAddress: '',
  solanaAddress: '',
  polkadotAddress: '',
  nearAddress: '',
  multiversxAddress: '',
  tronAddress: '',
  tezosAddress: '',
  kadenaAddress: '',
  bip122Address: '',
  kernelSmartAccountAddress: '',
  safeSmartAccountAddress: '',
  biconomySmartAccountAddress: '',
  relayerRegionURL: '',
  sessions: [],
  smartAccountSponsorshipEnabled: false,
  smartAccountEnabled:
    typeof localStorage !== 'undefined'
      ? Boolean(localStorage.getItem(SMART_ACCOUNTS_ENABLED_KEY))
      : false,
  kernelSmartAccountEnabled:
    typeof localStorage !== 'undefined'
      ? Boolean(localStorage.getItem(ZERO_DEV_SMART_ACCOUNTS_ENABLED_KEY))
      : false,
  safeSmartAccountEnabled:
    typeof localStorage !== 'undefined'
      ? Boolean(localStorage.getItem(SAFE_SMART_ACCOUNTS_ENABLED_KEY))
      : false,
  biconomySmartAccountEnabled:
    typeof localStorage !== 'undefined'
      ? Boolean(localStorage.getItem(BICONOMY_SMART_ACCOUNTS_ENABLED_KEY))
      : false,
  moduleManagementEnabled:
    typeof localStorage !== 'undefined'
      ? Boolean(localStorage.getItem(MODULE_MANAGEMENT_ENABLED_KEY))
      : false,
  chainAbstractionEnabled:
    typeof localStorage !== 'undefined' ? Boolean(localStorage.getItem(CA_ENABLED_KEY)) : false
})

/**
 * Store / Actions
 */
const SettingsStore = {
  state,

  setAccount(value: number) {
    state.account = value
  },

  setRelayerRegionURL(url: string) {
    state.relayerRegionURL = url
  },

  setEIP155Address(eip155Address: string) {
    state.eip155Address = eip155Address
    localStorage.setItem('lastEthPasskey', eip155Address)
  },

  setActiveChainId(value: string) {
    state.activeChainId = value
  },

  setCurrentRequestVerifyContext(context: Verify.Context) {
    state.currentRequestVerifyContext = context
  },
  setSessions(sessions: SessionTypes.Struct[]) {
    state.sessions = sessions
  },

  toggleTestNets() {
    state.testNets = !state.testNets
    if (state.testNets) {
      state.smartAccountSponsorshipEnabled = true
      localStorage.setItem(TEST_NETS_ENABLED_KEY, 'YES')
    } else {
      state.smartAccountSponsorshipEnabled = false
      localStorage.removeItem(TEST_NETS_ENABLED_KEY)
    }
  },

  toggleSmartAccountSponsorship() {
    if (!state.testNets) return
    state.smartAccountSponsorshipEnabled = !state.smartAccountSponsorshipEnabled
  },

  toggleSmartAccountEnabled() {
    state.smartAccountEnabled = !state.smartAccountEnabled
    if (state.smartAccountEnabled) {
      localStorage.setItem(SMART_ACCOUNTS_ENABLED_KEY, 'YES')
    } else {
      localStorage.removeItem(SMART_ACCOUNTS_ENABLED_KEY)
    }
  },
  toggleModuleManagement() {
    state.moduleManagementEnabled = !state.moduleManagementEnabled
    if (state.moduleManagementEnabled) {
      localStorage.setItem(MODULE_MANAGEMENT_ENABLED_KEY, 'YES')
    } else {
      localStorage.removeItem(MODULE_MANAGEMENT_ENABLED_KEY)
    }
  },

  toggleChainAbstractionEnabled() {
    state.chainAbstractionEnabled = !state.chainAbstractionEnabled
    if (state.chainAbstractionEnabled) {
      localStorage.setItem(CA_ENABLED_KEY, 'YES')
    } else {
      localStorage.removeItem(CA_ENABLED_KEY)
    }
  },

  async toggleKernelSmartAccountsEnabled() {},

  async toggleSafeSmartAccountsEnabled() {},

  async toggleBiconomySmartAccountsEnabled() {}
}

export default SettingsStore
