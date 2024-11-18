import PageHeader from '@/components/PageHeader'
import EIP155Lib from '@/lib/EIP155Lib'
import { Button, Text } from '@nextui-org/react'
import { Fragment, useState } from 'react'

export default function HomePage() {
  const [passKeyName, setPassKeyName] = useState('')
  const [mnemonic, setMnemonic] = useState('')
  const [isCalculating, setIsCalculating] = useState(false)

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
      alert('Passkey created correctly!')
    }
  }

  const exportMnemonic = async () => {
    setIsCalculating(true)
    const exportedMnemonic = await EIP155Lib.prototype.exportMnemonic()
    setMnemonic(exportedMnemonic)
    setIsCalculating(false)
  }

  return (
    <Fragment>
      <PageHeader title="🔑 ETH Passkeys"></PageHeader>
      This is an{' '}
      <a href="https://github.com/turinglabsorg/eth-passkeys" target="_blank" rel="noreferrer">
        open-source
      </a>{' '}
      proof of concept that explores the idea of creating an Ethereum wallet using Passkeys. You can
      create a secure wallet and use it here using Wallet Connect, or, export it as a mnemonic and
      use it in any other wallet and use this website as a secure backup.
      <br />
      <br />
      <Text h4 css={{ marginBottom: '$5' }}>
        Create a wallet
      </Text>
      <input
        type="text"
        value={passKeyName}
        onChange={e => setPassKeyName(e.target.value)}
        placeholder="Enter wallet name"
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
      <hr></hr>
      <Text h4 css={{ marginBottom: '$5' }}>
        Export mnemonic
      </Text>
      <Button
        style={{ marginBottom: '20px', width: '100%' }}
        onClick={exportMnemonic}
        disabled={isCalculating}
      >
        Export Mnemonic
      </Button>
      {mnemonic && (
        <div>
          <div
            style={{
              marginBottom: '20px',
              width: '100%',
              overflow: 'auto',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              padding: '20px',
              border: '1px solid #ccc',
              borderRadius: '10px'
            }}
          >
            {mnemonic}
          </div>
          <Button
            style={{ marginBottom: '20px', width: '100%' }}
            onClick={() => navigator.clipboard.writeText(mnemonic)}
          >
            Copy to clipboard
          </Button>
        </div>
      )}
      {isCalculating && <Text>Calculating...</Text>}
    </Fragment>
  )
}
