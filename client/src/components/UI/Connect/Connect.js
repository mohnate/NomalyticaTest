import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './Connect.scss'
import { gameModes, userTypes } from "../../../utils/constant";

import {
  connectWallet,
  getCurrentWalletConnected
} from '../../../utils/interact.js'
import {
  chainId,
  llgContractAddress,
  llgRewardContractAddress
} from '../../../utils/address'

import {
  getContractWithSigner,
  getContractWithoutSigner
} from '../../../utils/interact'
import { ethers } from 'ethers'
import Metamodal from "../../Metamodal";

const llgContractABI = require('../../../utils/llg-contract-abi.json')
const llgRewardContractABI = require('../../../utils/llg-reward-contract-abi.json')

let arrInfo = {}

export const Connect = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [wallet, setWallet] = useState()
  const [status, setStatus] = useState()
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false);
  const [writtenPw, setWrittenPw] = useState(0);
  const [error, setError] = useState(null);
  const [networkCorrect, setNetworkCorrect] = useState(true);
  const [stage, setStage] = useState('connect')

  let amount = 100;
  useEffect(() => {
    const checkWalletConnection = async () => {
      const walletResponse = await getCurrentWalletConnected();
      setWallet(walletResponse.address || '');
      setStatus(walletResponse.status);

      if (walletResponse.address) {
        if (location.state?.roomName === "Classic Room") {
          setStage('join');
        } else {
          setStage('deposit');
        }
      }
    };

    checkWalletConnection();
    addWalletListener();
  }, []);

  console.log(location.state);

  useEffect(() => {
    if (location.state) {
      switch (location.state.roomName) {
        case 'Classic Room':
          amount = 0;
          break;
        case 'Silver Room':
          amount = 50;
          break;
        case 'Gold Room':
          amount = 100;
          break;
        case 'Platinum Room':
          amount = 200;
          break;
        case 'Diamond Room':
          amount = 500;
          break;
        default:
          amount = 100;
      }
    }
  }, [location.state]);

  arrInfo = {
    connect: {
      text: 'You need ' + amount + ' LLG to start the game.',
      button: 'Connect Wallet'
    },
    join: {
      text: 'Transaction approve. You have deposited ' + amount + ' LLG',
      button: 'Join game'
    },
    deposit: {
      text: 'You need ' + amount + ' LLG to start the game.',
      button: 'Deposit LLG'
    },
    depositFail: {
      text: 'Transaction failed. You need ' + amount + ' LLG to start the game',
      button: 'Deposit LLG'
    }
  }

  /************************************************************************************* */
  const addWalletListener = () => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', accounts => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus('Wallet connected');

          setError(null);

          if (location.state?.roomName === "Classic Room") {
            setStage('join');
          } else {
            setStage('deposit');
          }
        } else {
          setWallet('');
          setStatus('🦊 Connect to MetaMask.');
          setStage('connect');
        }
      });

      window.ethereum.on('chainChanged', async (chainIdHex) => {
        const chainIdDecimal = parseInt(chainIdHex, 16);

        if (chainIdDecimal !== parseInt(chainId)) {
          setNetworkCorrect(false);
          setError(`Please switch to the correct network (Chain ID: ${chainId})`);
        } else {
          setNetworkCorrect(true);
          setError(null);

          const walletResponse = await connectWallet();
          setWallet(walletResponse.address || '');
          setStatus(walletResponse.status);
        }
      });
    } else {
      setStatus(
        <p>
          🦊 You must install MetaMask, a virtual Ethereum wallet, in your
          browser. <a href="https://metamask.io/download.html" target="_blank" rel="noopener noreferrer">Download here</a>
        </p>
      );
    }
  }

  const connectWalletPressed = async () => {
    setLoading(true);
    try {
      let walletResponse = await connectWallet();
      setWallet(walletResponse.address || '');
      setStatus(walletResponse.status);

      if (window.ethereum) {
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        const chainIdDecimal = parseInt(chainIdHex, 16);

        if (chainIdDecimal !== parseInt(chainId)) {
          setNetworkCorrect(false);
          setError(`Please switch to the correct network (Chain ID: ${chainId})`);

          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${parseInt(chainId).toString(16)}` }],
            });
          } catch (switchError) {
            if (switchError.code === 4902) {
              setError('This network is not available in your MetaMask, please add it manually');
            }
          }
        } else {
          setNetworkCorrect(true);
          setError(null);
        }
      }

      return walletResponse.address != null;
    } catch (error) {
      console.error("Wallet connection error:", error);
      setError("Failed to connect wallet: " + (error.message || "Unknown error"));
      return false;
    } finally {
      setLoading(false);
    }
  }

  const makeDeposit = async () => {
    setLoading(true);
    try {
      if (!wallet) {
        setError("Please connect your wallet first");
        return false;
      }

      if (!networkCorrect) {
        setError(`Please switch to the correct network (Chain ID: ${chainId})`);
        return false;
      }

      let llgContract = getContractWithSigner(
        llgContractAddress,
        llgContractABI
      );

      let amount = 50;
      if (location.state) {
        switch (location.state.roomName) {
          case 'Classic Room':
            amount = 0;
            break;
          case 'Silver Room':
            amount = 50;
            break;
          case 'Gold Room':
            amount = 100;
            break;
          case 'Platinum Room':
            amount = 200;
            break;
          case 'Diamond Room':
            amount = 500;
            break;
          default:
            amount = 100;
        }
      }

      let spender = llgRewardContractAddress;

      try {
        let tx = await llgContract.approve(
          ethers.utils.getAddress(spender),
          ethers.BigNumber.from(amount * 1000000000),
          {
            value: 0,
            from: wallet
          }
        );

        if (tx.code === 4001) {
          setError("Transaction rejected by user");
          return false;
        }

        setStatus("Approving transaction...");
        let res = await tx.wait();

        if (res.transactionHash) {
          let llgRewardContract = getContractWithSigner(
            llgRewardContractAddress,
            llgRewardContractABI
          );

          setStatus("Making deposit...");
          let tx2 = await llgRewardContract.deposit(
            ethers.BigNumber.from(location.state.roomKey),
            ethers.utils.getAddress(wallet),
            ethers.BigNumber.from(amount),
            {
              value: 0,
              from: wallet
            }
          );

          if (tx2 == null) {
            setError("Deposit transaction failed");
            return false;
          }

          let res2 = await tx2.wait();

          if (res2.transactionHash) {
            setStatus("Deposit successful!");
            setError(null);
            return true;
          } else {
            setError("Deposit transaction failed");
            return false;
          }
        } else {
          setError("Approval transaction failed");
          return false;
        }
      } catch (error) {
        console.error("Deposit error:", error);
        setError("Transaction error: " + (error.message || "Unknown error"));
        return false;
      }
    } finally {
      setLoading(false);
    }
  }

  const nextStage = async () => {
    if (loading) return;
    setLoading(true)
    switch (stage) {
      case 'connect':
        try {
          setModalVisible(true);
        } catch (e) {
          console.error("Connection error:", e);
          setError("Failed to connect wallet: " + (e.message || "Unknown error"));
        }
        break
      case 'join':
        navigate('/gameScene', { state: { ...location.state, wallet } })
        break
      case 'deposit':
        try {
          let res1 = await makeDeposit()
          if (res1) setStage('join')
          else setStage('depositFail')
        } catch (e) {
          setStage('depositFail')
        }
        break
      case 'depositFail':
        try {
          let res2 = await makeDeposit()
          if (res2) setStage('join')
          else setStage('depositFail')
        } catch (e) {
          setStage('depositFail')
        }
        break
      default:
    }
    setLoading(false)
  }

  return (
    <div className='Connect'>
      <div className='u-container'>
        <div className='u-ribbon'>Play to earn</div>
        <div className='u-content'>
          <div className='u-content-container'>
            <div className='u-text'>{arrInfo[stage].text}</div>
            {!networkCorrect && (
              <div className='u-warning'>
                Wrong network detected. Please switch to the correct network.
              </div>
            )}
            {error && <div className='u-error'>{error}</div>}
            <div className='u-button' onClick={() => nextStage()}>
              {loading ? 'Loading...' : arrInfo[stage].button}
            </div>
          </div>
        </div>
      </div>
      <Metamodal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        onConnectWallet={connectWalletPressed}
      />
    </div>
  )
}

export default Connect
