import { bsc } from '@reown/appkit/networks'

const projectId = '1febfd92481d4ea997711d2ac4a363c0'
    , networks = [bsc]

const contractAddress = '0x12a342968A15B44cde89202CFfbcF90D621Dc366'

const contractABI = [
  'function getAuthorByAddress(address _address) view returns (string)',
  'function getMessage(uint8 _index) view returns (string)',
  'function getMessageAuthorAddress(uint8 _index) view returns (address)',
  'function addMessage(string calldata _message) public',
  'function setAuthorname(string calldata name) public'
]

const metadata = {
  name: 'CryptoChatPaint',
  description: 'DApp',
  url: 'https://test.com',
  icons: ['https://test.com/icon.png']
}

export default {
  projectId,
  metadata,
  networks,
  contractAddress,
  contractABI
}
