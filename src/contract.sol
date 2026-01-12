// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.9 <0.9.0;

contract Authors {
    mapping(string => address) private authornames;
    mapping(address => string) private revAuthornames;
    
    function setAuthorname(string calldata name, address _address) public {
        if (authornames[name] == address(0)) {
            authornames[name] = _address;
            if (bytes(revAuthornames[_address]).length > 0) {
                authornames[revAuthornames[_address]] = address(0);
            }
            revAuthornames[_address] = name;
        } else {
            require(false, "Author name is not free");
        }
    }

    function getAuthorByAddress(address _address) view public returns (string memory) {
        if (bytes(revAuthornames[_address]).length != 0) {
            return revAuthornames[_address];
        } else {
            return "";
        }
    }

    function getAddressByAuthor(string calldata name) view public returns (address) {
        if (authornames[name] != address(0)) {
            return authornames[name];
        } else {
            return address(0);
        }
    }
}

contract Chat {
    uint8 index = 0;
    mapping(uint8 => string) private messages;
    mapping(uint8 => address) private addressAuthors;

    function addMessage(string calldata _message, address _address) public {
        messages[index] = _message;
        addressAuthors[index] = _address;
        index++;
        if (index > 100) {
            index = 0;
        }
    }

    function getMessage(uint8 _index) public view returns (string memory) {
        return messages[_index];
    }

    function getMessageAuthorAddress(uint8 _index) public view returns (address) {
        return addressAuthors[_index];
    }
}

contract Canvas {
    uint256 index = 0;
    mapping(uint256 => string) private draws;
    mapping(uint256 => address) private addressAuthors;

    function addDraw(string calldata draw, address _address) public returns (uint256) {
        index++;
        draws[index] = draw;
        addressAuthors[index] = _address;
        return index;
    }

    function getDraw(uint256 _index) public view returns (string memory) {
        return draws[_index];
    }

    function getDrawAuthorAddress(uint256 _index) public view returns (address) {
        return addressAuthors[_index];
    }
}

contract Text {
    function uintToString(uint256 value) public pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function toAsciiString(address x) public pure returns (string memory) {
        bytes memory s = new bytes(42);
        s[0] = '0';
        s[1] = 'x';
        for (uint i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint(uint160(x)) / (2**(8*(19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2*i + 2] = char(hi);
            s[2*i + 3] = char(lo);            
        }
        return string(s);
    }

    function char(bytes1 b) public pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
}

contract Main {
    Authors private authors;
    Chat private chat;
    Canvas private canvas;
    Text private text;

    constructor() {
        authors = new Authors();
        chat = new Chat();
        canvas = new Canvas();
        text = new Text();
    }

    function setAuthorname(string calldata name) public {
        authors.setAuthorname(name, msg.sender);
    }

    function getAuthorByAddress(address _address) view public returns (string memory) {
        return authors.getAuthorByAddress(_address);
    }

    function getAddressByAuthor(string calldata name) view public returns (address) {
        return authors.getAddressByAuthor(name);
    }

    function addMessage(string calldata _message) public {
        address sender = msg.sender;
        require(bytes(_message).length != 0, "Message is empty");
        require(bytes(authors.getAuthorByAddress(sender)).length != 0, "Author is not name");
        chat.addMessage(_message, sender);
    }

    function getMessage(uint8 _index) public view returns (string memory) {
        return chat.getMessage(_index);
    }

    function getMessageAuthorAddress(uint8 _index) public view returns (address) {
        return chat.getMessageAuthorAddress(_index);
    }

    function addDraw(string calldata draw) public {
        address sender = msg.sender;
        require(bytes(draw).length != 0, "Draw is empty");
        require(bytes(authors.getAuthorByAddress(sender)).length != 0, "Author is not name");
        uint256 index = canvas.addDraw(draw, sender);
        string memory message = string.concat(
            "Draw in canvas ",
            text.toAsciiString(sender), 
            " ", 
            text.uintToString(index)
        );
        chat.addMessage(message, sender);   
    }

    function getDraw(uint256 _index) public view returns (string memory) {
        return canvas.getDraw(_index);
    }

    function getDrawAuthorAddress(uint256 _index) public view returns (address) {
        return canvas.getDrawAuthorAddress(_index);
    }

    function getMyAddress() public view returns (address) {
        return msg.sender;
    }
}