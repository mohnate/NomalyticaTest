import React, { useEffect, useRef, useState } from 'react';
import ethlogo from '../assets/eth_logo.svg';
import arrowdown from '../assets/arrow-down.svg';
import metamask from '../assets/metamask-fox.svg';
import Spinner from '../assets/spinner.gif';
import MetamaskLogo from './metamaskLogo';

const Metamodal = ({ modalVisible, setModalVisible, onConnectWallet }) => {

  const [spinner, setSpinner] = useState(true);
  const [isVisible, setIsVisible] = useState(modalVisible);
  const modalRef = useRef();
  const [count, setCount] = useState(1);
  const [rightPos, setRightPos] = useState(0);
  const [pixelValue, setPixelValue] = useState(36);

  useEffect(() => {
    if (modalVisible) {
      openModal()
    } else {
      setIsVisible(false)
    }
  }, [modalVisible])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setCount(1);
      } catch (err) {
        console.error("Error:", err);
      }
    };

    fetchData();

    setRightPos(pixelValue * count + 102);

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, count, pixelValue]);

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setModalVisible(false);
    }
  };

  const changePos = {
    right: rightPos
  };

  const openModal = () => {
    setSpinner(true);
    setTimeout(() => {
      setIsVisible(true);
    }, 500);
    setTimeout(() => {
      setSpinner(false);
    }, 1000);
  }

  const handleConnectWallet = () => {
    if (typeof onConnectWallet === 'function') {
      onConnectWallet();
      setModalVisible(false);
    }
  };


  return (
    <div className="mm-app">
      {
        isVisible && (
          spinner ? (
            <div className="mm-loading" style={changePos}>
              <img className="mm-loading-logo" src={metamask} alt="MetaMask Logo" />
              <img className="mm-loading-spinner" src={Spinner} alt="Loading" />
            </div>
          ) : (
            <div id="mm-container" style={{ top: 0, right: rightPos, display: isVisible ? 'inline-block' : 'none' }} ref={modalRef} >
              <div className="mm-toppart">
                <button className="mm-category">
                  <div className="mm-icon">
                    <img className="mm-icon-img" src={ethlogo} alt="Ethereum Logo" />
                  </div>
                  <div className="mm-defaultcategory">Ethereum Mainnet</div>
                  <div className="mm-downicon">
                    <img src={arrowdown} alt="Arrow Down" />
                  </div>
                </button>
                <button className="mm-logo">
                  <img src={metamask} alt="MetaMask Logo" />
                </button>
              </div>
              <div>
                <div className="mm-maincontainer">
                  <div style={{ zIndex: 0 }}>
                    <MetamaskLogo />
                  </div>
                  <h1 className='mm-maincontainer-h1'>Connect with MetaMask</h1>
                  <p className='mm-maincontainer-p'>Connect your wallet to access the application</p>

                  {/* Replace password form with connect button */}
                  <button className="mm-unlocksubmit" onClick={handleConnectWallet}>Connect Wallet</button>

                  <div className="mm-help">
                    <span>Need help? Contact&nbsp;
                      <a href="https://support.metamask.io" target="_blank" rel="noopener noreferrer" className='mm-help-a'>MetaMask support</a>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        )
      }
    </div>
  );
}
export default Metamodal;

