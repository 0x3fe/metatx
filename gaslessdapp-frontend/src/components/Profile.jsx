import { useState, useEffect } from "react";
import {
  useSwitchNetwork,
  useAccount,
  useConnect,
  useDisconnect,
} from "wagmi";
import { fetchBalance, readContract } from "@wagmi/core";
import * as ethers from "ethers";
import { Store } from "./Store";

import {
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
} from "@mui/material";
import {
  Logout as LogoutIcon,
  HourglassBottom as HourglassBottomIcon,
} from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";

export function Profile() {
  const [userBalance, setUserBalance] = useState();
  const [valueStored, setValueStored] = useState();
  const { address, isConnected } = useAccount();

  useSwitchNetwork({
    throwForSwitchChainNotSupported: true,
  });

  const {
    connect,
    connectors,
    error,
    isLoading: connectLoading,
  } = useConnect();
  const { disconnect } = useDisconnect();
  const connector = connectors[0];

  const fetchUserData = async () => {
    const userBalanceData = await fetchBalance({
      address,
      formatUnits: "wei",
      chainId: 80001,
    });

    setUserBalance(
      parseFloat(ethers.utils.formatEther(userBalanceData.value)).toFixed(8)
    );

    console.log(process.env.REACT_APP_STORAGE_ADDRESS);

    setValueStored(
      await readContract({
        address: process.env.REACT_APP_STORAGE_ADDRESS,
        abi: [
          {
            inputs: [
              {
                internalType: "address",
                name: "account",
                type: "address",
              },
            ],
            name: "getValue",
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
        functionName: "getValue",
        args: [address],
        chainId: 80001
      })
    );
  };

  useEffect(() => {
    if (!address) return;

    fetchUserData().catch(console.error);
  }, [address]);

  return (
    <div>
      {!isConnected && !connectLoading && (
        <Button
          variant="contained"
          size="small"
          onClick={() => connect({ connector })}
          sx={{ fontFamily: "Consolas" }}
        >
          Connect wallet
          {!connector.ready && " (unsupported)"}
        </Button>
      )}
      {connectLoading ? (
        <Button onClick={disconnect}>
          <LoadingButton
            loading
            disabled="true"
            loadingPosition="start"
            startIcon={<HourglassBottomIcon />}
            variant="contained"
            sx={{ fontFamily: "Consolas" }}
          >
            Connecting
          </LoadingButton>
        </Button>
      ) : (
        isConnected && (
          <div className="flex flex-col space-y-5">
            <Card>
              <CardContent>
                <div className="flex flex-col space-y-1 mt-3 z-10">
                  <div className="flex flex-row justify-center grow-0">
                    <Typography
                      sx={{ fontSize: 25, fontFamily: "Consolas" }}
                    >{`${userBalance}`}</Typography>
                  </div>
                  <div className="flex flex-row justify-center grow-0">
                    <Typography sx={{ fontSize: 14, fontFamily: "Consolas" }}>
                      Value
                    </Typography>
                    <Typography
                      sx={{ fontSize: 14, fontFamily: "Consolas" }}
                    >{`: ${valueStored}`}</Typography>
                  </div>
                </div>
                <div className="flex flex-col space-y-1 mt-3 z-10">
                  <Chip
                    color="info"
                    size="small"
                    avatar={
                      <Avatar
                        alt="Natacha"
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/1200px-MetaMask_Fox.svg.png"
                      />
                    }
                    sx={{ fontFamily: "Consolas" }}
                    label={
                      address.substr(0, 5) +
                      "..." +
                      address.substr(address.length - 4)
                    }
                  />
                  <Chip
                    clickable
                    onClick={disconnect}
                    variant="outlined"
                    color="info"
                    size="small"
                    avatar={<LogoutIcon />}
                    sx={{ fontFamily: "Consolas" }}
                    label="Disconnect"
                  />
                  <div>
                    <Store fetchUserData={fetchUserData} address={address} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      )}

      {error && <div>{error.message}</div>}
    </div>
  );
}
