/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useRef, useState } from 'react'
import { useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { BrowserProvider, Contract } from 'ethers'
import { styled } from 'styled-components'
import sleep from 'sleep-promise'
import config from './config'

const Body = styled.div`
  background: #21ff4a1c;
  position: absolute;
  left: 15px;
  top: 15px;
  display: flex;
  flex-direction: column;
  border-radius: 10px 0px 0px 0px;
`

const Canvas = styled.canvas`
  background: #21ff4a1c;
  border: 1px solid #32ff6fd4;
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
  margin-top: 10px;
`

const CanvasComponent = () => {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount({ namespace: 'eip155' })
  const { walletProvider } = useAppKitProvider('eip155')

  const refCanvas = useRef()

  const [names, setNames] = useState([])
      , [draw, setDraw] = useState([])
      , [draws, setDraws] = useState([])

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

  const getDraw = async index => {
    for (;window.isConnected;) {
      try {
        const contract = await createCallContract()
        if (!contract) {
          return {
            ts: Date.now(),
            index,
            data: ''
          }
        }
        const ts = Date.now()
        const draw = await contract.getDraw(index)
        const data = draw.toString()

        if (data) {
          return {
            ts,
            index,
            data
          }
        }

        await sleep(5000)
      } catch (e) {}
    }

    return {
      ts: Date.now(),
      index,
      data: ''
    }
  }

  const getDrawAuthorAddress = async index => {
    const contract = await createCallContract()
    if (!contract) return
    const authorAddress = await contract.getDrawAuthorAddress(index)
    return authorAddress.toString()
  }

  const addDraw = async drawData => {
    try {
      const contract = await createCallContract()
      if (!contract) return
      await contract.addDraw(drawData)
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
      setDraws([])
      
      let i = 1
        , f = 1

      const intervalId = setInterval(async () => {
        if (f === i) {
          f++
          const draw = await getDraw(i)
          const authorAddress = await getDrawAuthorAddress(i)
          if (draw.data !== '') {
            i++
            if (i === 100) {
              i = 1
              f = 1
            }
            setNames(names => names.find(name => name.authorAddress === authorAddress) ? names : [...names, { authorAddress, author: undefined }])
            setDraws(draws => {
              const dd = draw.data.split(',').reduce((ctx, elem) => {
                if (ctx[ctx.length - 1].x === undefined) {
                  ctx[ctx.length - 1] = { ...ctx[ctx.length - 1], x: parseInt(elem) }
                  return ctx
                } 

                if (ctx[ctx.length - 1].y === undefined) {
                  ctx[ctx.length - 1] = { ...ctx[ctx.length - 1], y: parseInt(elem) }
                  return ctx
                }
                
                
                ctx.push({ x: parseInt(elem) })

                return ctx
              }, [[]])
              return [...draws, { ...draw, data: dd, authorAddress }].sort((a, b) => a.ts - b.ts)
            })
          }
        }
      }, 10)

      return () => clearInterval(intervalId)
    }
  }, [isConnected, setNames, setDraws])

  
  useEffect(() => {
    window.isConnected = isConnected
  }, [isConnected])

  useEffect(() => {
    const node = refCanvas.current

    if (node) {
      let isDown = false
        , offsetX = 0
        , offsetY = 0

      node.width = 400
      node.height = 400

      const blockHeight = node.height / 20
          , blockWidth = node.height / 20

      const ctx = node.getContext('2d')

      let drawData = []

      const render = () => {
        ctx.clearRect(0, 0, node.width, node.height)

        ctx.fillStyle = '#ccc'

        for (let x = blockWidth; x < node.width; x += blockWidth) {
          ctx.fillRect(x, 0, 1, node.width)
        }

        for (let y = blockHeight; y <  node.height; y += blockHeight) {
          ctx.fillRect(0, y, node.height, 1)
        }

        ctx.fillStyle = '#fff'

        ;[...draws.map(draw => draw.data).flat(), ...draw, ...drawData].forEach(draw => {
          ctx.fillRect(draw.x, draw.y, blockWidth, blockHeight)
        })

        for (let x = blockWidth; x < node.width; x += blockWidth) {
          for (let y = blockHeight; y < node.height; y += blockHeight) {
            if (
              offsetX > x && offsetX < x + blockWidth &&
              offsetY > y && offsetY < y + blockHeight
            ) {
              ctx.fillRect(x, y, blockWidth, blockHeight)
              drawData.push({ x, y })
            }
          }
        }
      }

      render()

      const handleMouseDown = () => {
        isDown = true
      }
      
      const handleMouseUp = () => {
        setDraw(draws => [...draws, ...drawData])
        isDown = false
      }
      
      const handleMouseMove = e => {
        if (isDown) {
          offsetX = e.offsetX
          offsetY = e.offsetY
          render()
        }
      }

      node.addEventListener('mousedown', handleMouseDown)
      node.addEventListener('mouseup', handleMouseUp)
      node.addEventListener('mousemove', handleMouseMove)

      return () => {
        node.removeEventListener('mousedown', handleMouseDown)
        node.removeEventListener('mouseup', handleMouseUp)
        node.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [refCanvas, draws, draw])

  return (
    <Body>      
      <Canvas ref={refCanvas}></Canvas>
      <Button 
        onClick={async () => {  
          const drawData = draw.map(d => d.x+','+d.y).join(',')
          addDraw(drawData)
        }}
      >Draw BlockChain</Button>
    </Body>
  )
}

export default CanvasComponent