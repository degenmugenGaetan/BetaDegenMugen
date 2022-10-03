// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("Metaverse", "METT") {
        _owner = payable(msg.sender);
    }

    function createToken(string memory tokenURI) public returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        return newItemId;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }

    address payable public _owner;
    mapping(uint256 => bool) public sold;
    mapping(uint256 => uint256) public price;

    event Purchase(address owner, uint256 price, uint256 id, string uri);

    function mint(string memory _tokenURI, uint256 _price)
        public
        returns (bool)
    {
        uint256 _tokenId = _tokenIds.current() + 1;
        price[_tokenId] = _price;

        _mint(address(this), _tokenId);
        _setTokenURI(_tokenId, _tokenURI);
        _tokenIds.increment();

        return true;
    }

    function getNFTOwner(uint256 id) external view returns (address) {
        return ownerOf(id);
    }

    function buy(uint256 _id) external payable {
        _validate(_id); //check req. for trade
        _trade(_id); //swap nft for eth

        emit Purchase(msg.sender, price[_id], _id, tokenURI(_id));
    }

    function _validate(uint256 _id) internal {
        require(_exists(_id), "Error, wrong Token id"); //not exists
        require(!sold[_id], "Error, Token is sold"); //already sold
        require(msg.value >= price[_id], "Error, Token costs more"); //costs more
    }

    function _trade(uint256 _id) internal {
        _transfer(address(this), msg.sender, _id); //nft to user
        _owner.transfer(msg.value); //eth to owner
        sold[_id] = true; //nft is sold
    }

    receive() external payable {
        console.log("APPEL RECEIVE NFT \n");
    }

    fallback() external payable {
        console.log("APPEL FALLBACK NFT\n");
    }
}
