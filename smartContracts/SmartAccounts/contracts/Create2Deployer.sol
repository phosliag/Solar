// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Create2Deployer
 * @notice Allows deploying deterministic contracts using CREATE2.
 * @dev The contract must be deployed from the same address on each network to ensure that the deployed contracts have the same address.
 */
contract Create2Deployer {
    /**
     * @notice Emits an event after a successful deployment.
     * @param deployed Final address of the deployed contract.
     */
    event Deployed(address indexed deployed);

    /**
     * @notice Deploys a contract using CREATE2 with the specified salt and bytecode.
     * @param salt Arbitrary value used to calculate the deterministic address.
     * @param bytecode Code of the contract to be deployed.
     * @return deployed Address of the deployed contract.
     */
    function _deployCreate2(bytes32 salt, bytes memory bytecode) internal returns (address deployed) {
        require(bytecode.length != 0, "Bytecode empty");

        /// @solidity memory-safe-assembly
        assembly {
            deployed := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }

        require(deployed != address(0), "CREATE2 failed");
        emit Deployed(deployed);
    }

    /**
     * @notice Computes the address of the contract before deploying it.
     * @param salt Arbitrary salt.
     * @param bytecode Code of the contract to deploy.
     * @return Computed address.
     */
    function computeAddress(bytes32 salt, bytes memory bytecode) external view returns (address) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                keccak256(bytecode)
            )
        );
        return address(uint160(uint256(hash)));
    }

    function testBytecode(bytes memory bytecode) public {
    address test;
    assembly {
        test := create(0, add(bytecode, 0x20), mload(bytecode))
    }
    require(test != address(0), "Regular CREATE failed");
}

}
