import { React, useRef, useEffect } from "react";
import { useThemeSwitcher } from "react-css-theme-switcher";
import { Typography, Button, Col, Menu, Row, Input } from "antd";
const { Title } = Typography;
const ipfsAPI = require("ipfs-http-client");
const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });

const mintItem = async () => {
  // upload to ipfs
  const uploaded = await ipfs.add(JSON.stringify(json[count]));
  setCount(count + 1);
  console.log("Uploaded Hash: ", uploaded);
  const result = tx(
    writeContracts && writeContracts.YourCollectible && writeContracts.YourCollectible.mintItem(address, uploaded.path),
    update => {
      console.log("📡 Transaction Update:", update);
      if (update && (update.status === "confirmed" || update.status === 1)) {
        console.log(" 🍾 Transaction " + update.hash + " finished!");
        console.log(
          " ⛽️ " +
            update.gasUsed +
            "/" +
            (update.gasLimit || update.gas) +
            " @ " +
            parseFloat(update.gasPrice) / 1000000000 +
            " gwei",
        );
      }
    },
  );
};

export default function MintPage({}) {
  return (
    <div>
      <Title level={3}>Minting in 1 step what?!</Title>
      <Input
        id="0xName" 
        name="0xName"
        autoComplete="off"
        autoFocus={true}
        placeholder={"Name"}
      ></Input>
    </div>
  );
}
