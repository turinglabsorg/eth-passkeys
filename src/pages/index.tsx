import PageHeader from '@/components/PageHeader'
import SettingsStore from '@/store/SettingsStore'
import { createOrRestoreEIP155Wallet } from '@/utils/EIP155WalletUtil'
import { Button, Text } from '@nextui-org/react'
import { Fragment, useCallback, useState } from 'react'
import { useSnapshot } from 'valtio'

export default function HomePage() {
  const { eip155Address } = useSnapshot(SettingsStore.state)
  const [passKeyName, setPassKeyName] = useState('')

  const createPasskey = async () => {
    const challenge = crypto.getRandomValues(new Uint8Array(32))
    const userId = crypto.getRandomValues(new Uint8Array(16))
    const regCredential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'Ethereum Passkey',
          id: process.env.NEXT_PUBLIC_PASSKEY_RP_ID
        },
        user: {
          id: userId,
          name: passKeyName || 'ETH_PASSKEY',
          displayName: passKeyName || 'ETH_PASSKEY'
        },
        pubKeyCredParams: [
          { alg: -8, type: 'public-key' }, // Ed25519
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' } // RS256
        ],
        authenticatorSelection: {
          userVerification: 'required'
        }
      }
    })
    if (regCredential) {
      console.log('regCredential', regCredential)
      handlePasskeyUse()
    }
  }

  const handlePasskeyUse = useCallback(async () => {
    const { eip155Addresses } = await createOrRestoreEIP155Wallet()
    SettingsStore.setEIP155Address(eip155Addresses[0])
  }, [])

  return (
    <Fragment>
      <PageHeader title="Passkeys"></PageHeader>
      <Text h4 css={{ marginBottom: '$5' }}>
        Create passkeys
      </Text>
      <input 
        type="text" 
        value={passKeyName}
        onChange={(e) => setPassKeyName(e.target.value)}
        placeholder="Enter passkey name"
        style={{ 
          marginBottom: '10px',
          width: '100%',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          color: 'black'
        }}
      />
      <Button style={{ marginBottom: '20px', width: '100%' }} onClick={createPasskey}>
        Create Passkey
      </Button>
    </Fragment>
  )
}
