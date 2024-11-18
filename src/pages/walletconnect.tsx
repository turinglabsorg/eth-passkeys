import { parseUri } from '@walletconnect/utils'
import PageHeader from '@/components/PageHeader'
import QrReader from '@/components/QrReader'
import { walletkit } from '@/utils/WalletConnectUtil'
import { createOrRestoreEIP155Wallet } from '@/utils/EIP155WalletUtil'
import { Button, Input, Loading, Text } from '@nextui-org/react'
import { Fragment, useCallback, useEffect, useState } from 'react'
import { styledToast } from '@/utils/HelperUtil'
import ModalStore from '@/store/ModalStore'
import SettingsStore from '@/store/SettingsStore'
import { useSnapshot } from 'valtio'

export default function WalletConnectPage(params: { deepLink?: string }) {
  const { deepLink } = params
  const [uri, setUri] = useState('')
  const [loading, setLoading] = useState(false)

  async function onConnect(uri: string) {
    const { topic: pairingTopic } = parseUri(uri)
    // if for some reason, the proposal is not received, we need to close the modal when the pairing expires (5mins)
    const pairingExpiredListener = ({ topic }: { topic: string }) => {
      if (pairingTopic === topic) {
        styledToast('Pairing expired. Please try again with new Connection URI', 'error')
        ModalStore.close()
        walletkit.core.pairing.events.removeListener('pairing_expire', pairingExpiredListener)
      }
    }
    walletkit.once('session_proposal', () => {
      walletkit.core.pairing.events.removeListener('pairing_expire', pairingExpiredListener)
    })
    try {
      setLoading(true)
      walletkit.core.pairing.events.on('pairing_expire', pairingExpiredListener)
      await walletkit.pair({ uri })
    } catch (error) {
      styledToast((error as Error).message, 'error')
      ModalStore.close()
    } finally {
      setLoading(false)
      setUri('')
    }
  }

  useEffect(() => {
    if (deepLink) {
      onConnect(deepLink)
    }
  }, [deepLink])

  const { eip155Address } = useSnapshot(SettingsStore.state)

  const handlePasskeyUse = useCallback(async () => {
    setLoading(true)
    localStorage.removeItem('lastEthPasskeyId')
    const restoredWallet = await createOrRestoreEIP155Wallet()
    if (!restoredWallet) {
      setLoading(false)
      return
    }
    setLoading(false)
    const eip155Addresses = restoredWallet.eip155Addresses
    SettingsStore.setEIP155Address(eip155Addresses[0])
  }, [])

  return (
    <Fragment>
      <PageHeader title="Connect to dApp" />
      {eip155Address && !loading ? (
        <>
          <Text css={{ textAlign: 'center', marginTop: '$10' }}>Using wallet:</Text>
          <Text size={13} css={{ textAlign: 'center', marginBottom: '$10' }}>
            {eip155Address}
          </Text>
          <Button
            style={{ marginTop: '20px', width: '100%', marginBottom: '20px' }}
            onClick={handlePasskeyUse}
          >
            Change wallet
          </Button>
          <QrReader onConnect={onConnect} />
          <Text size={13} css={{ textAlign: 'center', marginTop: '$10', marginBottom: '$10' }}>
            or use walletconnect uri
          </Text>

          <Input
            css={{ width: '100%' }}
            bordered
            aria-label="wc url connect input"
            placeholder="e.g. wc:a281567bb3e4..."
            onChange={e => setUri(e.target.value)}
            value={uri}
            data-testid="uri-input"
            contentRight={
              <Button
                size="xs"
                disabled={!uri}
                css={{ marginLeft: -60 }}
                onClick={() => onConnect(uri)}
                color="gradient"
                data-testid="uri-connect-button"
              >
                {loading ? <Loading size="md" type="points" color={'white'} /> : 'Connect'}
              </Button>
            }
          />
        </>
      ) : !loading ? (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          You need to connect a wallet first.
          <Button style={{ marginTop: '20px', width: '100%' }} onClick={handlePasskeyUse}>
            Use an existing Passkey
          </Button>
        </div>
      ) : (
        <Text>Loading key...</Text>
      )}
    </Fragment>
  )
}
