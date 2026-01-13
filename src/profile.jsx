/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from 'react'
import { useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { BrowserProvider, Contract } from 'ethers'
import { styled } from 'styled-components'
import { motion } from 'framer-motion'
import sleep from 'sleep-promise'
import config from './config'

const Body = styled(motion.div)`
  position: absolute;
  right: 15px;
  bottom: 300px;
  background: #21ff4a1c;
  border: 1px solid #32ff6fd4;
  border-radius: 4px;
`

const Input = styled.input`
  background: #ffffff;
  color: #000;
  border: none;
  outline: none;
  max-width: 100%;
  width: 100%;
  height: 30px;
  border-radius: 4px;
  padding: 6px 8px;
  box-sizing: border-box;
  font-family: "SUSE Mono", sans-serif;
  font-size: 13px;
  margin-right: 10px;
`

const Button = styled.button`
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

const Navigation = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
`

const Profile = () => {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount({ namespace: 'eip155' })
  const { walletProvider } = useAppKitProvider('eip155')

  const [name, setName] = useState('')
      , [isWriteNewName, setWriteNewName] = useState(false)

  const createCallContract = async (isNotConnected = false) => {
    if ((!walletProvider || !address) && !isNotConnected) {
      open()
      return
    }
    const provider = new BrowserProvider(walletProvider)
    const signer = await provider.getSigner() 
    return new Contract(config.contractAddress, config.contractABI, signer)
  }

  const getAuthorByAddress = async (address, isNotConnected) => {
    const contract = await createCallContract(isNotConnected)
    if (!contract) return
    const author = await contract.getAuthorByAddress(address)
    return author.toString()
  }

  const setAuthor = async name => {
     try {
      const contract = await createCallContract()
      if (!contract) return
      await contract.setAuthorname(name)
    } catch (e) {
      console.log(e)
     }
  }

  useEffect(() => {
    if (isConnected && !isWriteNewName) {
      const intervalId = setInterval(async () => {
        const author = await getAuthorByAddress(address, true)
        setName(author)
      }, 1000)

      return () => clearInterval(intervalId)
    }
  }, [isConnected, getAuthorByAddress, isWriteNewName, address])

  return (
    <Body drag>
      <Navigation>
        <Input 
          placeholder='Your name...'
          value={name} 
          onChange={({ target: { value } }) => {
            setWriteNewName(true)
            setName(value)
          }}  
        />
        <Button 
          onClick={async () => {
            await setAuthor(name)
            await sleep(3000)
            setWriteNewName(false)
          }}
        >save</Button>
      </Navigation>
    </Body>
  )
}

export default Profile