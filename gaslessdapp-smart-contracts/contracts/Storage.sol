// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract Storage is ERC2771Context {
    mapping(address => uint256) public valueOf;
    address public trustedForwarder;

    event Stored(address indexed account, uint256 value);

    constructor(address _trustedForwarder) ERC2771Context(_trustedForwarder) {
        trustedForwarder = _trustedForwarder;
    }

    function store(uint256 value) public {
        valueOf[_msgSender()] = value;

        emit Stored(_msgSender(), value);
    }

    function getValue(address account) public view returns (uint256) {
        return valueOf[account];
    }
}
