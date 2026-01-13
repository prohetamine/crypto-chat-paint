/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useRef, useState } from 'react'
import { useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { BrowserProvider, Contract } from 'ethers'
import { styled } from 'styled-components'
import { motion } from 'framer-motion'
import sleep from 'sleep-promise'
import config from './config'
import MiniCanvas from './mini-canvas.jsx'

const Body = styled(motion.div)`
  position: absolute;
  bottom: 15px;
  right: 15px;
  background: #21ff4a1c;
  border: 1px solid #32ff6fd4;
  border-radius: 4px;
`

const MessagesOverflow = styled.div`
  width: 300px;
  height: 200px;
  padding: 10px;
  padding-bottom: 0px;
  overflow-y: scroll;
  overflow-x: hidden;
  border-bottom: 1px solid #32ff6fd4;
`

const Message = styled.div`
  background-color: #e2e2e2ff;
  border-radius: 4px;
  padding: 6px 8px;
  margin: 0px 0px 10px 0px;
  max-width: 300px;
  width: fit-content;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  word-break: break-all;
`

const Author = styled.span`
  color: #666;
  font-size: 12px;
  font-weight: 700;
  font-family: "SUSE Mono", sans-serif;
`

const Text = styled.span`
  color: #000;
  font-size: 13px;
  font-weight: 400;
  font-family: "SUSE Mono", sans-serif;
  margin-left: 3px;
`

const Navigation = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
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

const Chat = () => {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount({ namespace: 'eip155' })
  const { walletProvider } = useAppKitProvider('eip155')

  const refChat = useRef()

  const [names, setNames] = useState([])
      , [message, setMessage] = useState('')
      , [messages, setMessages] = useState([])

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

  const getMessage = async index => {
    for (;window.isConnected;) {
      try {
        const contract = await createCallContract()
        if (!contract) {
          return {
            ts: Date.now(),
            index,
            text: ''
          }
        }
        const ts = Date.now()
        const message = await contract.getMessage(index)
        const text = message.toString()
        if (text) {
          return {
            ts,
            index,
            text
          }
        }

        await sleep(5000)
      } catch (e) {}
    }

    return {
      ts: Date.now(),
      index,
      text: ''
    }
  }

  const getMessageAuthorAddress = async index => {
    const contract = await createCallContract()
    if (!contract) return
    const authorAddress = await contract.getMessageAuthorAddress(index)
    return authorAddress.toString()
  }

  const addMessage = async text => {
    try {
      const contract = await createCallContract()
      if (!contract) return
      await contract.addMessage(text)
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    const authorAddress = names.find(name => !name.author)?.authorAddress
    if (isConnected && authorAddress) {
      const timeId = setTimeout(async () => {
        const author = await getAuthorByAddress(authorAddress)
        setNames(names => names.map(name => name.authorAddress === authorAddress ? ({ ...name, author }) : name))
      }, 1000)

      return () => clearTimeout(timeId)
    }
  }, [isConnected, getAuthorByAddress, names])

  useEffect(() => {
    if (isConnected) {
      setMessages([])
      
      let i = 0
        , f = 0

      const intervalId = setInterval(async () => {
        if (f === i) {
          f++
          const message = await getMessage(i)
          const authorAddress = await getMessageAuthorAddress(i)
          if (message.text !== '') {
            i++
            if (i === 100) {
              i = 0
              f = 0
            }
            setNames(names => names.find(name => name.authorAddress === authorAddress) ? names : [...names, { authorAddress, author: undefined }])
            setMessages(messages => [...messages, { ...message, authorAddress }].sort((a, b) => a.ts - b.ts))
          }
        }
      }, 10)

      return () => clearInterval(intervalId)
    }
  }, [isConnected, setNames])

  useEffect(() => {
    const node = refChat.current

    if (node) {
      const timeId = setTimeout(() => {
        node.scrollTo(0, 100000000)
      }, 100)

      return () => clearTimeout(timeId)
    }
  }, [refChat, messages.length])

  useEffect(() => {
    window.isConnected = isConnected
  }, [isConnected])

  return (
    <Body drag>      
      <MessagesOverflow ref={refChat}>
        {
          messages.map(message => {
            const color = `hsl(${parseInt(message.authorAddress.slice(2),16)%360},70%,50%)`;

            let $address = null
              , index = null
            
            if (message.text.match(/Draw in canvas/)) {
              const [_address, _index] = message.text.replace(/Draw in canvas /, '').split(' ')
              $address = _address
              index = _index
            }

            return (
              <Message key={message.ts} style={message.authorAddress === address ? { marginLeft: 'auto', background: '#ffffffff' } : {}}>
                <Author style={{ color: color }}>
                  {message.authorAddress === address ? '' : `${(names.find(names => names.authorAddress === message.authorAddress)?.author || 'load...')}:`}
                  {
                    $address 
                      ? (
                        <MiniCanvas address={$address} index={index} onRemove={() => setMessages(messages => messages.filter(m => m.ts !== message.ts))} />
                      )
                      : (
                        <Text style={message.authorAddress === address ? { marginLeft: '0px' } : {}}>{message.text}</Text>
                      )
                  }
                </Author>
              </Message>
            )
          })
        }
      </MessagesOverflow>
      <Navigation>
        <Input 
          value={message} 
          placeholder='Your message...'
          onChange={({ target: { value } }) => setMessage(value)}  
        />
        <Button 
          onClick={async () => {
            await addMessage(message)
            setMessage('')
          }}
        >SEND</Button>
      </Navigation>
    </Body>
  )
}

export default Chat