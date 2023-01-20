import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "./Constants.js";
import { CONTRACT_ABI } from "./Constants.js";
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import "./App.css";

export default function App() {
  const [publicKey, setPublickey] = useState();
  const [connected, setConnected] = useState(false);
  const [chainId, setChainId] = useState();
  const [msg, setMsg] = useState();
  const [notice, setNotice] = useState();
  const [noticedBy, setNoticeBy] = useState();
  const [updatedNotice, setUpdatedNotice] = useState();

  const connectButton = async () => {
    const { ethereum } = window;
    if (ethereum.isMetaMask) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const accounts = await provider.send("eth_requestAccounts", []);
      const { chainId } = await provider.getNetwork();
      setChainId(chainId);
      setPublickey(accounts[0]);
      await readNotice(provider);
      setConnected(true);
    } else {
      setMsg("Install MetaMask");
    }
  };

  const readNotice = async (provider) => {
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    console.log(contract)
    const notice = await contract.getNotice();
    console.log(notice);
    setNotice(notice);
    const noticeBy = await contract.getUserByNotice(notice);
    setNoticeBy(noticeBy);
    
  }

  const writeNotice = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    console.log(contract)
    console.log(updatedNotice)
    let tx = await contract.setNotice(updatedNotice, {
      gasLimit: 1000000000, // BlockGasLimit / 10
    });

    console.log(tx)
    await readNotice(provider);
  }

  return (
    <div className="App">
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand>
            Notice Board
          </Navbar.Brand>
          {!connected && <Button variant="light" onClick={connectButton}>Connect Wallet</Button>}
        </Container>
      </Navbar>

      <p>Connected To: {publicKey}</p>
      <p>Chain ID : {chainId}</p>
      {msg && <p>{msg}</p>}
      <br/>

      <div className="Notice">
      <InputGroup className="mb-3">
        <Form.Control
          placeholder="Enter updated notice here ..."
          aria-label="Recipient's username"
          aria-describedby="basic-addon2"
          onChange={(e) => {
            setUpdatedNotice(e.target.value);
          }}
        />
        <Button variant="outline-secondary" id="button-addon2" onClick ={() => {writeNotice()}}>
          Update Notice
        </Button>
      </InputGroup>

      <Card>
      <Card.Header>Notice</Card.Header>
      <Card.Body>
        <blockquote className="blockquote mb-0">
          <p>
            {' '}
            {notice}
            {' '}
          </p>
          <footer className="blockquote-footer">
            {noticedBy}
          </footer>
        </blockquote>
      </Card.Body>
    </Card>
      </div>
      
    </div>
  );
}
