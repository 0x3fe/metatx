const express = require("express");
const ethers = require("ethers");
require("dotenv").config();

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_PROVIDER);

const forwarderInstance = new ethers.Contract(process.env.FORWARDER_ADDRESS, [
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "gas",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "nonce",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct MinimalForwarder.ForwardRequest",
        name: "req",
        type: "tuple",
      },
      {
        internalType: "bytes",
        name: "signature",
        type: "bytes",
      },
    ],
    name: "execute",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
]);

app.post("/executeMetaTx", async (req, res) => {
  const { value, signature } = req.body;
  const relayer = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY, provider);

  try {
    const tx = await forwarderInstance
      .connect(relayer)
      .execute(value, signature);

    console.log(tx.hash);

    res.status(200).json({ status: "tx_sent", txHash: tx.hash });
  } catch (error) {
    res.status(500).json({ status: "error", details: error });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
