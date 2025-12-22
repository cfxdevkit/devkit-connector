// Auto-generated contract configuration (ES Module)
// Generated: 2025-12-22T08:05:29.346Z

const contractConfig = {
  "metadata": {
    "generated": "2025-12-22T08:05:29.346Z",
    "version": "1.0.0",
    "sources": [
      "legacy",
      "ignition",
      "artifacts"
    ]
  },
  "networks": {
    "localEspace": {
      "name": "Local eSpace",
      "chainId": 71,
      "rpcUrl": "http://localhost:8545",
      "type": "eSpace"
    },
    "chain-2030": {
      "name": "Local Chain 2030",
      "chainId": 2030,
      "rpcUrl": "http://localhost:8545",
      "type": "eSpace"
    }
  },
  "contracts": {
    "counter": {
      "name": "counter",
      "address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      "network": "localEspace",
      "source": "legacy",
      "abi": [
        {
          "inputs": [],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "newCount",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "operation",
              "type": "string"
            }
          ],
          "name": "CountUpdated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [],
          "name": "CounterReset",
          "type": "event"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            }
          ],
          "name": "add",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256[]",
              "name": "values",
              "type": "uint256[]"
            }
          ],
          "name": "batchAdd",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256[]",
              "name": "values",
              "type": "uint256[]"
            }
          ],
          "name": "batchSubtract",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "count",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            }
          ],
          "name": "divide",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getCount",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getMaxCount",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "isAtMax",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "isAtZero",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "maxCount",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            }
          ],
          "name": "multiply",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "reset",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            }
          ],
          "name": "subtract",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ],
      "functions": 13,
      "events": 2,
      "metadata": {
        "txHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "gasUsed": "500000",
        "timestamp": "2025-09-16T14:01:00.000Z",
        "mock": false
      },
      "artifact": {
        "contractName": "Counter",
        "sourceName": "contracts/Counter.sol",
        "bytecode": "0x6080806040523460205760008055620f424060015561071490816100268239f35b600080fdfe6080604052600436101561...",
        "deployedBytecode": "0x6080604052600436101561001257600080fd5b60003560e01c8063041176691461040057806306661abd14610189578063..."
      }
    },
    "delegation": {
      "name": "delegation",
      "address": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      "network": "localEspace",
      "source": "legacy",
      "abi": [
        {
          "inputs": [],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "name": "OwnableInvalidOwner",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "account",
              "type": "address"
            }
          ],
          "name": "OwnableUnauthorizedAccount",
          "type": "error"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "delegator",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "delegate",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "limit",
              "type": "uint256"
            }
          ],
          "name": "DelegationCreated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "delegator",
              "type": "address"
            }
          ],
          "name": "DelegationRevoked",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "previousOwner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "OwnershipTransferred",
          "type": "event"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_delegate",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "_limit",
              "type": "uint256"
            }
          ],
          "name": "createDelegation",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "name": "delegations",
          "outputs": [
            {
              "internalType": "address",
              "name": "delegate",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "limit",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "active",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "createdAt",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_delegator",
              "type": "address"
            }
          ],
          "name": "getDelegation",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "address",
                  "name": "delegate",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "limit",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "createdAt",
                  "type": "uint256"
                }
              ],
              "internalType": "struct DelegationManager.Delegation",
              "name": "",
              "type": "tuple"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getDelegationCount",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_delegator",
              "type": "address"
            }
          ],
          "name": "hasActiveDelegation",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "owner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "renounceOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "revokeDelegation",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "transferOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ],
      "functions": 9,
      "events": 3,
      "metadata": {
        "txHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "gasUsed": "800000",
        "timestamp": "2025-09-16T14:01:00.000Z",
        "mock": false
      },
      "artifact": {
        "contractName": "DelegationManager",
        "sourceName": "contracts/DelegationManager.sol",
        "bytecode": "0x608080604052346075573315605f5760008054336001600160a01b0319821681178355916001600160a01b03909116907f...",
        "deployedBytecode": "0x6080604052600436101561001257600080fd5b60003560e01c80632b293768146104805780633163827e1461043e578063..."
      }
    },
    "DelegationManager": {
      "name": "DelegationManager",
      "address": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      "network": "chain-2030",
      "source": "ignition",
      "abi": [
        {
          "inputs": [],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "name": "OwnableInvalidOwner",
          "type": "error"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "account",
              "type": "address"
            }
          ],
          "name": "OwnableUnauthorizedAccount",
          "type": "error"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "delegator",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "delegate",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "limit",
              "type": "uint256"
            }
          ],
          "name": "DelegationCreated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "delegator",
              "type": "address"
            }
          ],
          "name": "DelegationRevoked",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "previousOwner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "OwnershipTransferred",
          "type": "event"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_delegate",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "_limit",
              "type": "uint256"
            }
          ],
          "name": "createDelegation",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "name": "delegations",
          "outputs": [
            {
              "internalType": "address",
              "name": "delegate",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "limit",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "active",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "createdAt",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_delegator",
              "type": "address"
            }
          ],
          "name": "getDelegation",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "address",
                  "name": "delegate",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "limit",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "createdAt",
                  "type": "uint256"
                }
              ],
              "internalType": "struct DelegationManager.Delegation",
              "name": "",
              "type": "tuple"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getDelegationCount",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_delegator",
              "type": "address"
            }
          ],
          "name": "hasActiveDelegation",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "owner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "renounceOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "revokeDelegation",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "transferOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ],
      "functions": 9,
      "events": 3,
      "metadata": {},
      "artifact": {
        "contractName": "DelegationManager",
        "sourceName": "contracts/DelegationManager.sol",
        "bytecode": "0x608080604052346075573315605f5760008054336001600160a01b0319821681178355916001600160a01b03909116907f...",
        "deployedBytecode": "0x6080604052600436101561001257600080fd5b60003560e01c80632b293768146104805780633163827e1461043e578063..."
      }
    },
    "Counter": {
      "name": "Counter",
      "address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      "network": "chain-2030",
      "source": "ignition",
      "abi": [
        {
          "inputs": [],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "newCount",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "operation",
              "type": "string"
            }
          ],
          "name": "CountUpdated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [],
          "name": "CounterReset",
          "type": "event"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            }
          ],
          "name": "add",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256[]",
              "name": "values",
              "type": "uint256[]"
            }
          ],
          "name": "batchAdd",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256[]",
              "name": "values",
              "type": "uint256[]"
            }
          ],
          "name": "batchSubtract",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "count",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            }
          ],
          "name": "divide",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getCount",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getMaxCount",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "isAtMax",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "isAtZero",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "maxCount",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            }
          ],
          "name": "multiply",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "reset",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            }
          ],
          "name": "subtract",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ],
      "functions": 13,
      "events": 2,
      "metadata": {},
      "artifact": {
        "contractName": "Counter",
        "sourceName": "contracts/Counter.sol",
        "bytecode": "0x6080806040523460205760008055620f424060015561071490816100268239f35b600080fdfe6080604052600436101561...",
        "deployedBytecode": "0x6080604052600436101561001257600080fd5b60003560e01c8063041176691461040057806306661abd14610189578063..."
      }
    }
  }
};

export default contractConfig;
export const { metadata, networks, contracts } = contractConfig;
