import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js"
import dotenv from 'dotenv';

dotenv.config();    

const rpc = process.env.RPC || ''

export const GLOBAL = new PublicKey("4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf");
export const FEE_RECIPIENT = new PublicKey("CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM");
export const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
export const ASSOC_TOKEN_ACC_PROG = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
export const RENT = new PublicKey("SysvarRent111111111111111111111111111111111");
export const PUMP_FUN_ACCOUNT = new PublicKey("Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1");
export const SYSTEM_PROGRAM_ID = SystemProgram.programId;

export class Pump {
    static programId: PublicKey = new PublicKey(process.env.PUMP_PROGRAM_ID || '');
    static connection: Connection = new Connection(rpc, {
        fetch: fetch
    })

    owner: PublicKey
    tokenAddress: string
    coinData: any;
    constructor({
        owner,
        tokenAddress
    }: {
        owner: string
        tokenAddress: string
    }) {
        this.owner = new PublicKey(owner)
        this.tokenAddress = tokenAddress
    }

    async buyToken(solIn: number, slippageDecimal: number = 0.25) {
        const mint = new PublicKey(this.tokenAddress);

        const txBuilder = new Transaction();

        const tokenAccountAddress = await getAssociatedTokenAddress(
            mint,
            this.owner,
            false
        );

        let tokenAccountInfo
        try {
            tokenAccountInfo = await Pump.connection.getAccountInfo(tokenAccountAddress);
        } catch (e) { }

        const tokenAccount: PublicKey = tokenAccountAddress;
        if (!tokenAccountInfo) {
            txBuilder.add(
                createAssociatedTokenAccountInstruction(
                    this.owner,
                    tokenAccountAddress,
                    this.owner,
                    mint
                )
            );
        }

        const tokenOut = await this.estimateToken(solIn);

        const _tokenOut = Math.floor(tokenOut * (1 - slippageDecimal));
        const maxSolCost = Math.floor(solIn * LAMPORTS_PER_SOL);

        const ASSOCIATED_USER = tokenAccount;
        const USER = this.owner;
        const BONDING_CURVE = new PublicKey(this.coinData['bonding_curve']);
        const ASSOCIATED_BONDING_CURVE = new PublicKey(this.coinData['associated_bonding_curve']);

        const keys = [
            { pubkey: GLOBAL, isSigner: false, isWritable: false },
            { pubkey: FEE_RECIPIENT, isSigner: false, isWritable: true },
            { pubkey: mint, isSigner: false, isWritable: false },
            { pubkey: BONDING_CURVE, isSigner: false, isWritable: true },
            { pubkey: ASSOCIATED_BONDING_CURVE, isSigner: false, isWritable: true },
            { pubkey: ASSOCIATED_USER, isSigner: false, isWritable: true },
            { pubkey: USER, isSigner: false, isWritable: true },
            { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: RENT, isSigner: false, isWritable: false },
            { pubkey: PUMP_FUN_ACCOUNT, isSigner: false, isWritable: false },
            { pubkey: Pump.programId, isSigner: false, isWritable: false },
        ];

        const data = Buffer.concat([
            bufferFromUInt64("16927863322537952870"),
            bufferFromUInt64(_tokenOut),
            bufferFromUInt64(maxSolCost)
        ]);

        const instruction = new TransactionInstruction({
            keys: keys,
            programId: Pump.programId,
            data: data
        });
        txBuilder.add(instruction);

        const latestBlockhash = await Pump.connection.getLatestBlockhash();
        txBuilder.feePayer = this.owner;
        txBuilder.recentBlockhash = latestBlockhash!.blockhash;

        return txBuilder.serialize({ verifySignatures: false }).toString("base64")

    }

    async sellToken(tokenBalance: number, slippageDecimal: number = 0.25) {
        const mint = new PublicKey(this.tokenAddress);
        const txBuilder = new Transaction();

        const tokenAccountAddress = await getAssociatedTokenAddress(
            mint,
            this.owner,
            false
        );

        const tokenAccountInfo = await Pump.connection.getAccountInfo(tokenAccountAddress);

        let tokenAccount: PublicKey = tokenAccountAddress;
        if (!tokenAccountInfo) {
            txBuilder.add(
                createAssociatedTokenAccountInstruction(
                    this.owner,
                    tokenAccountAddress,
                    this.owner,
                    mint
                )

            );
        }

        const _minSolOutput = await this.estimateSol(tokenBalance);
        const minSolOutput = Math.floor(_minSolOutput! * (1 - slippageDecimal))
        const BONDING_CURVE = new PublicKey(this.coinData['bonding_curve']);
        const ASSOCIATED_BONDING_CURVE = new PublicKey(this.coinData['associated_bonding_curve']);

        const keys = [
            { pubkey: GLOBAL, isSigner: false, isWritable: false },
            { pubkey: FEE_RECIPIENT, isSigner: false, isWritable: true },
            { pubkey: mint, isSigner: false, isWritable: false },
            { pubkey: BONDING_CURVE, isSigner: false, isWritable: true },
            { pubkey: ASSOCIATED_BONDING_CURVE, isSigner: false, isWritable: true },
            { pubkey: tokenAccount, isSigner: false, isWritable: true },
            { pubkey: this.owner, isSigner: false, isWritable: true },
            { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: ASSOC_TOKEN_ACC_PROG, isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: PUMP_FUN_ACCOUNT, isSigner: false, isWritable: false },
            { pubkey: Pump.programId, isSigner: false, isWritable: false }
        ];

        const data = Buffer.concat([
            bufferFromUInt64("12502976635542562355"),
            bufferFromUInt64(tokenBalance),
            bufferFromUInt64(minSolOutput)
        ]);

        const instruction = new TransactionInstruction({
            keys: keys,
            programId: Pump.programId,
            data: data
        });
        txBuilder.add(instruction);

        const latestBlockhash = await Pump.connection.getLatestBlockhash();
        txBuilder.feePayer = this.owner;
        txBuilder.recentBlockhash = latestBlockhash!.blockhash;

        return txBuilder.serialize({ verifySignatures: false }).toString("base64")
    }

    async estimate(inNumber: number, inType: 'sol' | 'token') {
        if (inType === 'sol') {
            return await this.estimateToken(inNumber)
        } else {
            return await this.estimateSol(inNumber)
        }
    }

    private async estimateToken(solIn: number) {
        const coinData: any = await this.getCoinData()
        const tokenOut = Math.floor(
            (solIn * (1 - 0) * coinData["virtual_token_reserves"]) /
              coinData["virtual_sol_reserves"]
          );
        return tokenOut
    }

    private async estimateSol(tokenIn: number) {
        const coinData: any = await this.getCoinData()
        const solOut = Math.floor(
            (tokenIn * coinData["virtual_sol_reserves"]) /
              coinData["virtual_token_reserves"]
          );
        return solOut
    }   

    private async getCoinData() {
        if (this.coinData) {
            return this.coinData
        }   
        this.coinData = await fetch(`https://frontend-api.pump.fun/coins/${this.tokenAddress}`).then(res => res.json())
        return this.coinData
    }
}

export function bufferFromUInt64(value: number | string) {
    let buffer = Buffer.alloc(8);
    buffer.writeBigUInt64LE(BigInt(value));
    return buffer;
}