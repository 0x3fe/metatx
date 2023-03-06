import * as ethers from "ethers";

export const getTypedData = async (accountAddress, valueToStore) => {
  const provider = new ethers.providers.JsonRpcProvider(
    `https://polygon-mumbai.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`
  );

  const forwarderInstance = new ethers.Contract(
    process.env.REACT_APP_FORWARDER_ADDRESS,
    [
      {
        inputs: [
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
        ],
        name: "getNonce",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
    provider
  );

  // Defining Domain Separator
  const domain = {
    name: "MinimalForwarder",
    version: "0.0.1",
    chainId: 80001,
    verifyingContract: process.env.REACT_APP_FORWARDER_ADDRESS,
  };

  // Define the type data structure for the request
  const types = {
    ForwardRequest: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "gas", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "data", type: "bytes" },
    ],
  };

  const nonce = await forwarderInstance.getNonce(accountAddress);
  let ABI = ["function store(uint256 value)"];
  let iface = new ethers.utils.Interface(ABI);
  const data = iface.encodeFunctionData("store", [valueToStore]);

  // Define the values for the message
  const value = {
    from: accountAddress,
    to: process.env.REACT_APP_STORAGE_ADDRESS,
    value: "0",
    gas: "300000",
    nonce,
    data,
  };

  return { domain, types, value };
};
