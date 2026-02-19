// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.20;

import "./ERC20F.sol";

contract ERC20Fv2FeeExample is ERC20F {
    uint16 private _feeBps;
    address private _feeRecipient;
    mapping(address => bool) private _feeExempt;

    event FeeConfigUpdated(uint16 feeBps, address feeRecipient);
    event FeeExemptUpdated(address indexed account, bool exempt);

    function initializeV2Fee(uint16 feeBps_, address feeRecipient_) external reinitializer(2) {
        _setFeeConfig(feeBps_, feeRecipient_);
    }

    function setFeeConfig(uint16 feeBps_, address feeRecipient_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setFeeConfig(feeBps_, feeRecipient_);
    }

    function setFeeExempt(address account, bool exempt) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _feeExempt[account] = exempt;
        emit FeeExemptUpdated(account, exempt);
    }

    function feeConfig() external view returns (uint16 feeBps, address feeRecipient) {
        return (_feeBps, _feeRecipient);
    }

    function isFeeExempt(address account) external view returns (bool) {
        return _feeExempt[account];
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        _transferWithFee(_msgSender(), to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        _spendAllowance(from, _msgSender(), amount);
        _transferWithFee(from, to, amount);
        return true;
    }

    function _setFeeConfig(uint16 feeBps_, address feeRecipient_) internal {
        require(feeBps_ <= 1_000, "fee too high");
        require(feeRecipient_ != address(0), "fee recipient zero");

        _feeBps = feeBps_;
        _feeRecipient = feeRecipient_;

        emit FeeConfigUpdated(feeBps_, feeRecipient_);
    }

    function _transferWithFee(address from, address to, uint256 amount) internal {
        if (_feeBypassed(from, to) || _feeBps == 0) {
            super._transfer(from, to, amount);
            return;
        }

        uint256 feeAmount = (amount * _feeBps) / 10_000;
        if (feeAmount == 0) {
            super._transfer(from, to, amount);
            return;
        }

        uint256 netAmount = amount - feeAmount;
        super._transfer(from, _feeRecipient, feeAmount);
        super._transfer(from, to, netAmount);
    }

    function _feeBypassed(address from, address to) internal view returns (bool) {
        return _feeRecipient == address(0) || _feeExempt[from] || _feeExempt[to];
    }
}
