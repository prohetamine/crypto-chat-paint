/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { styled } from 'styled-components'
import { motion } from 'framer-motion'
import Chat from './chat.jsx'
import Profile from './profile.jsx'

const Body = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
`

const WalletButton = styled(motion.button)`
  position: absolute;
  right: 15px;
  top: 15px;
  background: #ffffff;
  color: #000;
  border: none;
  outline: none;
  height: 30px;
  border-radius: 4px;
  padding: 6px 8px;
  box-sizing: border-box;
  font-family: "SUSE Mono", sans-serif;
  font-size: 13px;
`

const App = () => {
  const { open } = useAppKit()
  const { isConnected } = useAppKitAccount({ namespace: 'eip155' })

  return (
    <Body>
      <WalletButton onClick={() => open()}>{isConnected ? 'Wallet' : 'Connect wallet'}</WalletButton>
      <Profile />
      <Chat />
    </Body>
  )
}

export default App