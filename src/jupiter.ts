
const API_PREFIX = "https://quote-api.jup.ag";
const wsol = "So11111111111111111111111111111111111111112";

import dotenv from 'dotenv';
dotenv.config();
export class Jupiter {
    tokenAddress: string;
    owner: string;
    constructor({
        owner,
        tokenAddress,
    }: {
        tokenAddress: string,
        owner: string
    }) {    
        this.tokenAddress = tokenAddress    
        this.owner = owner
    }

    async trade(amount: string, type: "sol" | "token" = "sol", slip: number) {
        const swapInfo = await this.estimate(amount, type);
        const { swapTransaction } = await this.fetchSwapTransaction(Math.floor(slip * 100), swapInfo);
        return swapTransaction
    }

    async estimate(amount: string | number, type: "sol" | "token" = "sol") {
        const inputToken = type === "sol" ? wsol : this.tokenAddress;
        const outToken = type === "sol" ? this.tokenAddress : wsol;
        const swapInfo = await this.fetchSwapInfo(inputToken, outToken, amount, 0);
        return swapInfo;
    }

    /**
     * 
     * @param inputMint 
     * @param outputMint 
     * @param amount 
     * @param slip 
     * @returns 
     */
    private async fetchSwapInfo(
        inputMint: string,
        outputMint: string,
        amount: string | number,
        slip: number
    ) {
        const response = await fetch(
            `${API_PREFIX}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slip}&swapMode=ExactIn&onlyDirectRoutes=false&asLegacyTransaction=false&maxAccounts=64&minimizeSlippage=false&tokenCategoryBasedIntermediateTokens=true`
        );
        const data: any = await response.json();
        return {
            inAmount: data.inAmount,
            otherAmountThreshold: data.otherAmountThreshold,
            quoteResponse: data
        };
    }

    private async fetchSwapTransaction(
        slip: number,
        swapInfo: any
    ) {
        const requestBody = {
            userPublicKey: this.owner,
            wrapAndUnwrapSol: true,
            dynamicComputeUnitLimit: true,
            correctLastValidBlockHeight: true,
            asLegacyTransaction: false,
            allowOptimizedWrappedSolTokenAccount: true,
            prioritizationFeeLamports: {
              priorityLevelWithMaxLamports: {
                maxLamports: 4000000,
                global: false,
                priorityLevel: "veryHigh"
              }
            },
            dynamicSlippage: {
              maxBps: slip || 300
            },
            quoteResponse: swapInfo.quoteResponse
          };
        
          console.log('requestBody: ', JSON.stringify(requestBody))

          const response = await fetch(`${API_PREFIX}/v6/swap`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
          });
        
          const data: any = await response.json();

          return data;
    }
}