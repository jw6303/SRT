import React, { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import './ConnectWalletButton.css';

const ConnectWalletButton = () => {
    const { connected, publicKey } = useWallet();
    const [buttonText, setButtonText] = useState('[ connect wallet ]');

    useEffect(() => {
        if (connected && publicKey) {
            const shortAddress = `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`;
            setButtonText(`[ connected: ${shortAddress} ]`);
        } else {
            setButtonText('[ connect wallet ]');
        }
    }, [connected, publicKey]);

    return (
        <div className="wallet-container">
            <WalletMultiButton className={`custom-wallet-button ${connected ? 'connected' : 'disconnected'}`}>
                {buttonText}
            </WalletMultiButton>
        </div>
    );
};

export default ConnectWalletButton;