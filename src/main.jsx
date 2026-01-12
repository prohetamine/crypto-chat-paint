import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createAppKit, AppKitProvider } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import './index.css'
import App from './App.jsx'
import config from './config.js'

createAppKit({
  projectId: config.projectId,
  adapters: [new EthersAdapter()],
  networks: config.networks,
  metadata: config.metadata
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppKitProvider projectId={config.projectId} networks={config.networks}>
      <App />
    </AppKitProvider>
  </StrictMode>
)
