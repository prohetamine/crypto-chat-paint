/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useRef, useState } from 'react'
import { useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { BrowserProvider, Contract } from 'ethers'
import { styled } from 'styled-components'
import config from './config'

const Canvas = styled.canvas`
  background: #21ff4a1c;
  border: 1px solid #32ff6fd4;
  background:#676;
`

const MiniCanvas = ({ address: _address, index }) => {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount({ namespace: 'eip155' })
  const { walletProvider } = useAppKitProvider('eip155')

  const refCanvas = useRef()

  const [draw, setDraw] = useState({
    data: []
  })

  const createCallContract = async (isNotConnected = false) => {
    if ((!walletProvider || !address) && !isNotConnected) {
      open()
      return
    }
    const provider = new BrowserProvider(walletProvider)
    const signer = await provider.getSigner() 
    return new Contract(config.contractAddress, config.contractABI, signer)
  }


  const getDraw = async index => {
    try {
      const contract = await createCallContract()
      const ts = Date.now()
      const draw = await contract.getDraw(index)
      const data = draw.toString()
      return {
        ts,
        index,
        data
      }
    } catch (e) {}
  }

  const getDrawAuthorAddress = async index => {
    const contract = await createCallContract()
    if (!contract) return
    const authorAddress = await contract.getDrawAuthorAddress(index)
    return authorAddress.toString()
  }

  useEffect(() => {
    if (isConnected) {
      const timeId = setTimeout(async () => {
        const draw = await getDraw(index)
        const authorAddress = await getDrawAuthorAddress(index)
        
        const dd = draw.data.split(',').reduce((ctx, elem) => {
          if (parseInt(elem) !== elem-0) {
            ctx.push({ color: elem })
            return ctx
          }

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

        setDraw({ ...draw, data: dd, authorAddress })
      }, 1000)

      return () => clearInterval(timeId)
    }
  }, [isConnected, setDraw, index])
  
  useEffect(() => {
    window.isConnected = isConnected
  }, [isConnected])

  useEffect(() => {
    const node = refCanvas.current

    if (node) {
      node.width = 100
      node.height = 100

      const blockHeight = node.height / 20
          , blockWidth = node.height / 20

      const origWidth = 400
          , origHeight = 400

      const origblockHeight = origHeight / 20
          , origblockWidth = origWidth / 20

      const ctx = node.getContext('2d')
      const render = () => {
        ctx.clearRect(0, 0, node.width, node.height)

        const { color } = draw.data[draw.data.length - 1] || ({ color: '#fff' })
        const _color = ['#fff', '#000', 'red', 'blue', 'green', 'pink', '#f3dc1d'].find(_color => _color === color) || '#fff'
        ctx.fillStyle = _color
        draw.data.forEach(draw => 
          _color === '#000'
            ? ctx.clearRect((draw.x / origblockWidth) * blockHeight, (draw.y / origblockHeight) * blockWidth, blockWidth, blockHeight)  
            : ctx.fillRect((draw.x / origblockWidth) * blockHeight, (draw.y / origblockHeight) * blockWidth, blockWidth, blockHeight)
        )
      }

      render()
    }
  }, [refCanvas, draw])

  return (    
    <Canvas ref={refCanvas}></Canvas>
  )
}

export default MiniCanvas