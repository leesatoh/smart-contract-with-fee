// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleStorage {
    uint256 private _value;

    event ValueChanged(uint256 oldValue, uint256 newValue);

    function setValue(uint256 newValue) external {
        uint256 oldValue = _value;
        _value = newValue;
        emit ValueChanged(oldValue, newValue);
    }

    function getValue() external view returns (uint256) {
        return _value;
    }
}
