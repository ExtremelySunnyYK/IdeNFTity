import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import React from "react";
import { Link } from "react-router-dom";
import { Typography, Button, Col, Menu, Row } from "antd";
import "./Home.scss"

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Home({ yourLocalBalance, readContracts }) {
  const purpose = useContractReader(readContracts, "YourContract", "purpose");

  return (
    <div style={{backgroundColor: "rgba(0,0,0,0.5)", padding: "10%"}}>
      <div style={{display:"flex"}}>
        <div className="logos" style={{animationName:"float1"}}>
          <img src={"/uglyGithub.png"} />
        </div>
        <div className="logos" style={{animationName:"float2"}}>
          <img src={"/uglyLinkedin.png"} />{" "}
        </div>
        <div className="logos" style={{animationName:"float3"}}>
          <img src={"/uglyResumeNoBackground.png"} />{" "}
        </div>  
      </div>
      <Link to="/mint">
        <Button size="large" shape="round">
          <span style={{ marginRight: 8 }} role="img" aria-label="support">
            💬
          </span>
          Mint Now!
        </Button>
      </Link>
    </div>
  );
}

export default Home;
