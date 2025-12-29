// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract CreditToken is ERC721, Ownable, ERC721Burnable {
    uint256 private _nextTokenId;

    constructor()
        ERC721("CarbonTrust Credit", "CTC")
        Ownable(msg.sender)
    {
        _nextTokenId = 1;
    }

    function safeMint(address to) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        return tokenId;
    }
}