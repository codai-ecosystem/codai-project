// Ethereum window object type declarations
export interface EthereumProvider {
    request(args: { method: string; params?: any[] }): Promise<any>;
    on(event: string, handler: (...args: any[]) => void): void;
    removeListener(event: string, handler: (...args: any[]) => void): void;
    isMetaMask?: boolean;
    chainId?: string;
    selectedAddress?: string;
}

declare global {
    interface Window {
        ethereum?: EthereumProvider;
    }
}

export { };
