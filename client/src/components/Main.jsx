import React from 'react'
import { useState, useEffect } from 'react';
import { ethers, utils } from "ethers";
import abi from "../utils/Token.json";
import logo from '../assets/logo.png'
import truncateEthAddress from 'truncate-eth-address'


const Main = () => {

    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [yourWalletAddress, setYourWalletAddress] = useState(null);
    const [tokenName, setTokenName] = useState("");
    const [tokenSymbol, setTokenSymbol] = useState("");
    const [tokenTotalSupply, setTokenTotalSupply] = useState(0);
    const [inputValue, setInputValue] = useState({ walletAddress: "", transferAmount: "", burnAmount: "", mintAmount: "" });
    const [error, setError] = useState(null);
    
    const contractAddress = '0x621dc00160A748A35A288fE1Eb19282BEEF487c1' 
    const contractABI = abi.abi
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);
    
    const checkIfWalletIsConnected = async () => {
        try {
          if (window.ethereum) {
            let n = ethereum.chainId
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
            const account = accounts[0];
            setIsWalletConnected(true);
            setYourWalletAddress(account);
            await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: "0x89"}],
            });

            console.log("You have switched to the right network")
            console.log("Account Connected: ", account);
          } else {
            setError("Install a MetaMask wallet to get our token.");
            console.log("No Metamask detected");
          }
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await provider.request({
                      method: 'wallet_addEthereumChain',
                      params: [
                          {
                            chainId: '0x89', 
                            chainName:'Polygon',
                            rpcUrls:['https://polygon-rpc.com '],                   
                            blockExplorerUrls:['https://polygonscan.com/'],  
                            nativeCurrency: { 
                              symbol:'MATIC',   
                              decimals: 18
                            }    
                          }
                        ]})
                  } catch (err) {
                     console.log(err);
                }
            }
               console.log("Cannot switch to the network")
        }
    }

    const getTokenInfo = async () => {
        try {
          if (window.ethereum) {            
            let tokenName = await tokenContract.name();
            let tokenSymbol = await tokenContract.symbol();

            let tokenSupply = await tokenContract.totalSupply();
            tokenSupply = utils.formatEther(tokenSupply)
    
            setTokenName(`${tokenName}`);
            setTokenSymbol(tokenSymbol);
            setTokenTotalSupply(tokenSupply);

            console.log("Token Name: ", tokenName);
            console.log("Token Symbol: ", tokenSymbol);
            console.log("Token Supply: ", tokenSupply);
          }
        } catch (error) {
          console.log(error);
        }
    }

    const mintTokens = async (event) => {
        event.preventDefault();
        try {
          if (window.ethereum) {
            
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
            const account = accounts[0];
            const txn = await tokenContract.mint(account, utils.parseEther(inputValue.mintAmount));
            console.log("Minting tokens...");
            await txn.wait();
            console.log("Tokens minted...", txn.hash);
    
            let tokenSupply = await tokenContract.totalSupply();
            tokenSupply = utils.formatEther(tokenSupply)
            setTokenTotalSupply(tokenSupply);
    
          } else {
            console.log("Ethereum object not found, install Metamask.");
            setError("Install a MetaMask wallet to get our token.");
          }
        } catch (error) {
          console.log(error);
        }
    }

    const handleInputChange = (event) => {
        setInputValue(prevFormData => ({ ...prevFormData, [event.target.name]: event.target.value }));
    }

    useEffect(() => {
        checkIfWalletIsConnected();
        getTokenInfo();
      }, [])

    return (
        <div className="min-h-screen bg-gradient-to-r from-gray-900 to-gray-800 to-gray-900">
            <nav className="w-full flex md:justify-center justify-between items-center p-4">
            <div className="md:flex-[0.5] flex-initial justify-center items-center">
                <img src={logo} alt="logo" className="w-32 cursor-pointer" />
            </div>
            <ul className="text-white md:flex hidden list-none flex-row justify-between items-center flex-initial">
                <li className={`mx-4 cursor-pointer`}>
                    <a className="hover:text-gray-400" href={'https://crypto4kids.org'} target="_blank" rel="noreferrer">
                        Website
                    </a>
                </li>
                <li className={`mx-4 cursor-pointer`}>
                    <a className="hover:text-gray-400" href={'https://discord.gg/RRExhF6rDp'} target="_blank" rel="noreferrer">
                        Discord
                    </a>
                </li>
                <li className={`mx-4 cursor-pointer`}>
                    <a className="hover:text-gray-400" href={'https://www.youtube.com/channel/UCETUuNlhfXJ5vHAH2obPVJg'} target="_blank" rel="noreferrer">
                        Youtube
                    </a>
                </li>
                <li className={`mx-4 cursor-pointer`}>
                    <a className="hover:text-gray-400" href={'https://www.instagram.com/crypto4kidshk/'} target="_blank" rel="noreferrer">
                        Instagram
                    </a>
                </li>
                    {!isWalletConnected ? (
                        <button onClick={checkIfWalletIsConnected} className="bg-gray-800 outline outline-gray-600 py-2 px-7 mx-4 rounded-full cursor-pointer bg-gradient-to-r hover:from-green-400 hover:to-green-600">
                            Connect Wallet
                        </button>
                    ) : ( 
                        <a href={'https://polygonscan.com/address/' + yourWalletAddress} target="_blank" rel="noreferrer">
                            <div className="text-white md:flex hidden list-none flex-row justify-between items-center flex-initial">
                                <button className="outline outline-gray-600 py-2 px-7 mx-4 rounded-full cursor-pointer bg-gradient-to-r hover:from-green-400 hover:to-green-600">
                                    {truncateEthAddress(yourWalletAddress)}
                                </button>
                            </div>
                           
                        </a>  
                )}
                </ul>
            </nav>
            <div className="w-full flex md:justify-center justify-between items-center">
                <div className="text-xl p-2 text-center text-4xl py-5 border-b-2 border-slate-800 sm:px-10  bg-gray-900 font-bold">
                    <h1 className="text-3xl bg-clip-text text-transparent bg-gradient-to-tr from-green-400 to-green-600 py-1">
                        <a className="hover:text-green-400" href={'https://polygonscan.com/token/0x621dc00160a748a35a288fe1eb19282beef487c1'} target="_blank" rel="noreferrer">
                            Crypto4Kids Token DAPP
                        </a>
                    </h1>
                </div>
            </div>
            <div className="flex-h-screen">
                <div className="text-white flex md:justify-center">
                    {error && <p className="text-2xl text-red-700">{error}</p>}
                    <div className="mt-5">
                        <span className="mr-5"><strong>Coin:</strong> {tokenName} </span>
                        <span className="mr-5"><strong>Ticker:</strong>  {tokenSymbol} </span>
                        <span className="mr-5"><strong>Total Supply:</strong>  {tokenTotalSupply}</span>
                        <div className="py-10">
                            <form className="flex flex-col border rounded-lg p-5 border-gray-600 justify-center">
                                <input
                                    type="text"
                                    className="bg-gray-800 px-1 py-2 input-double focus-within:ring-indigo-500 z-40"
                                    onChange={handleInputChange}
                                    name="walletAddress"
                                    placeholder="Wallet Address"
                                    value={inputValue.walletAddress}
                                />
                                <input
                                    type="number"
                                    className="bg-gray-800 px-1 py-2  focus-within:ring-indigo-500 z-40"
                                    onChange={handleInputChange}
                                    name="mintAmount"
                                    placeholder={`Amount - 0.0000 ${tokenSymbol}`}
                                    value={inputValue.mintAmount}
                                />
                                 <button
                                    className="px-4 py-3 text-gray-100 border rounded-lg p-5 border-gray-600 transition-colors duration-200 transform bg-green-500  hover:bg-green-400/50 z-30"
                                    onClick={mintTokens}>
                                        Mint Tokens
                                </button>
                            </form>
                        </div>
                        <div className="mt-5">
                            <p><span className="font-bold">Contract Address: </span>{contractAddress}</p>
                        </div>
                            <div className="mt-5">
                            {isWalletConnected && <p><span className="font-bold">Your Wallet Address: </span>{yourWalletAddress}</p>}
                            <button className="bg-yellow-500 px-5 py-3 mt-5 rounded-lg text-gray-800 font-bold" onClick={checkIfWalletIsConnected}>
                                {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
                        </button>
                        </div>
                        
                    </div>


                </div>
            </div>

        </div>
        
        
        
    )
}

export default Main;