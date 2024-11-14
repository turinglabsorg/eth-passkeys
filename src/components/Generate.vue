<script setup lang="ts">
import { ref } from 'vue'
import { Wallet } from 'ethers'

const address = ref<string | null>(null);

const generatePasskey = async () => {
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userId = crypto.getRandomValues(new Uint8Array(16));

  const regCredential = await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: {
        name: "Ethereum Passkey",
        id: import.meta.env.VITE_RP_ID,
      },
      user: {
        id: userId,
        name: "ETH_PASSKEY",
        displayName: "ETH_PASSKEY",
      },
      pubKeyCredParams: [
        { alg: -8, type: "public-key" },   // Ed25519
        { alg: -7, type: "public-key" },   // ES256
        { alg: -257, type: "public-key" }, // RS256
      ],
      authenticatorSelection: {
        userVerification: "required",
      }
    },
  });
  if (!regCredential) return;
  createWallet();
}

const createWallet = async () => {
  const fixedChallenge = new Uint8Array([1, 2, 3, 4]).buffer;
  const signCredential = await navigator.credentials.get({
    publicKey: {
      rpId: import.meta.env.VITE_RP_ID,
      challenge: fixedChallenge,
      allowCredentials: [],
    },
  });
  if (!signCredential) return;
  // Combine multiple sources of authenticator data
  const authData = new Uint8Array((signCredential as any).response.authenticatorData);
  const publicKeyBytes = authData.slice(-65);
  const credentialId = new Uint8Array((signCredential as any).rawId);

  // Combine both sources into a single array
  const combinedData = new Uint8Array([...publicKeyBytes, ...credentialId]);

  // Derive the key from the combined data
  const encryptionKey = await crypto.subtle.digest('SHA-256', combinedData);
  const keyHex = Array.from(new Uint8Array(encryptionKey))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Create Ethereum wallet from the key
  const wallet = new Wallet('0x' + keyHex);
  console.log('Wallet address:', wallet.address);
  console.log('Private key:', wallet.privateKey);
  address.value = wallet.address;
}
</script>

<template>
  <p>Simple experiment to create a wallet from a passkey</p>
  <div class="card">
    <button type="button" @click="generatePasskey">Generate passkey</button>
    <button type="button" @click="createWallet">Calculate wallet</button>
    <p class="address" v-if="address">{{ address }}</p>
  </div>
</template>

<style scoped>
button {
  margin: 5px 10px;
  width: 200px;
}

.address {
  word-break: break-all;
  font-family: monospace;
}
</style>
