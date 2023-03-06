import * as React from "react";
import { toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import useDebounce from "../utils/useDebounce";
import {
  signTypedData,
  waitForTransaction,
  prepareWriteContract,
  writeContract,
} from "@wagmi/core";

import {
  Button,
  TextField,
  Typography,
  Switch,
  Link,
  FormControlLabel,
} from "@mui/material";
import {
  HourglassBottom as HourglassBottomIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { getTypedData } from "../utils/getTypedData";

export function Store(props) {
  const [isMeta, setIsMeta] = React.useState(true);
  const [valueToStore, setValueToStore] = React.useState();
  const [txLoading, setTxLoading] = React.useState();

  const debouncedValue = useDebounce(valueToStore, 500);

  const handleSwitchChange = (event) => {
    setIsMeta(event.target.checked);
  };

  const handleExecute = async () => {
    if (!valueToStore) return;

    setTxLoading(true);

    if (isMeta) {
      executeMetaTx();
    } else {
      executeTx();
    }
  };

  const executeTx = async () => {
    const config = await prepareWriteContract({
      address: process.env.REACT_APP_STORAGE_ADDRESS,
      abi: [
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_num",
              type: "uint256",
            },
          ],
          name: "store",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      functionName: "store",
      args: [parseInt(debouncedValue)],
      chainId: 80001,
    });

    const txData = await writeContract(config);

    const receipt = await waitForTransaction({
      hash: txData?.hash,
      chainId: 80001,
    });

    if (receipt.status == 1) {
      console.log("Transaction successful!", receipt);
      toast.success(
        <Link
          href={`https://mumbai.polygonscan.com/tx/${txData?.hash}`}
          target="_blank"
        >
          {"Transaction success!"}
        </Link>,
        {
          position: "top-center",
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
          theme: "light",
        }
      );
    } else {
      console.error("Transaction failed! Retry later.", receipt);
      toast.error(
        <Link
          href={`https://mumbai.polygonscan.com/tx/${txData?.hash}`}
          target="_blank"
        >
          {"Transaction failed! Retry later."}
        </Link>,
        {
          position: "top-center",
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
          theme: "light",
        }
      );
    }

    setTxLoading(false);
    await props.fetchUserData();
  };

  const executeMetaTx = async () => {
    const { domain, types, value } = await getTypedData(
      props.address,
      valueToStore
    );

    const signature = await signTypedData({
      domain,
      types,
      value,
    });

    axios
      .post("http://localhost:3001/executeMetaTx", {
        value,
        signature,
      })
      .then(async (res) => {
        const receipt = await waitForTransaction({
          hash: res.data.txHash,
          chainId: 80001,
        });

        if (receipt.status == 1) {
          console.log("Meta transaction successful!");
          toast.success(
            <Link
              href={`https://mumbai.polygonscan.com/tx/${res.data.txHash}`}
              target="_blank"
            >
              {"Meta transaction successful!"}
            </Link>,
            {
              position: "top-center",
              autoClose: false,
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: false,
              progress: undefined,
              theme: "light",
            }
          );
        } else {
          console.error("Meta transaction failed! Retry later.");
          toast.error(
            <Link
              href={`https://mumbai.polygonscan.com/tx/${res.data.txHash}`}
              target="_blank"
            >
              {"Meta transaction failed! Retry later."}
            </Link>,
            {
              position: "top-center",
              autoClose: false,
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: false,
              progress: undefined,
              theme: "light",
            }
          );
        }

        setTxLoading(false);
        await props.fetchUserData();
      });
  };

  return (
    <div className="mt-5 flex flex-col space-y-3">
      <FormControlLabel
        control={
          <Switch
            defaultChecked
            size="small"
            checked={isMeta}
            onChange={handleSwitchChange}
          />
        }
        label={
          <Typography sx={{ fontSize: "12px", fontFamily: "Consolas" }}>
            No fees
          </Typography>
        }
      />

      <TextField
        id="value"
        inputProps={{ style: { fontSize: 14, fontFamily: "Consolas" } }}
        InputLabelProps={{ style: { fontSize: 14, fontFamily: "Consolas" } }}
        label="Enter value"
        size="small"
        variant="outlined"
        onChange={(e) => setValueToStore(e.target.value)}
        value={valueToStore}
      />

      {!txLoading ? (
        <Button
          disabled={!executeTx}
          onClick={handleExecute}
          variant="contained"
          startIcon={<SendIcon />}
          sx={{ fontFamily: "Consolas" }}
        >
          Send
        </Button>
      ) : (
        <LoadingButton
          loading
          loadingPosition="start"
          startIcon={<HourglassBottomIcon />}
          variant="contained"
        >
          Sending
        </LoadingButton>
      )}
    </div>
  );
}
