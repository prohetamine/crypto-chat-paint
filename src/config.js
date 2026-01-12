import { bsc } from '@reown/appkit/networks'

const projectId = '1febfd92481d4ea997711d2ac4a363c0'
    , networks = [bsc]

const contractAddress = '0xE536175586278c91BA7AA03D11703009E099c691'

const contractABI = [
  'function getAuthorByAddress(address _address) view returns (string)',
  'function getMessage(uint8 _index) view returns (string)',
  'function getMessageAuthorAddress(uint8 _index) view returns (address)',
  'function addMessage(string calldata _message) public',
  'function setAuthorname(string calldata name) public'
]

const metadata = {
  name: 'test',
  description: 'test',
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
