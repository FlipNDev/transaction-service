import {
    PublicKey,
    SystemProgram,
    Transaction,
    ComputeBudgetProgram,
    Connection,
    TransactionInstruction,
} from "@solana/web3.js";
import Big from "big.js";
import { Metaplex } from "@metaplex-foundation/js";
import {
    getOrCreateAssociatedTokenAccount,
    getAssociatedTokenAddressSync,
    getAccount,
    Account,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    createAssociatedTokenAccountInstruction,
    TokenAccountNotFoundError,
    TokenInvalidAccountOwnerError,
    createSyncNativeInstruction,
    transfer,
    createTransferInstruction,
    createCloseAccountInstruction,
    getAssociatedTokenAddress,
    getTokenMetadata,
    TOKEN_2022_PROGRAM_ID,
    getMint
} from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { setGlobalDispatcher, ProxyAgent } from 'undici';


import dotenv from 'dotenv';

dotenv.config();    

import idl from "./idl/meme_launchpad.json";

const programId_address = process.env.PROGRAM_ID || ''
const rpc = process.env.RPC || 'https://solana-mainnet.core.chainstack.com/26539386617197b730ed9e3c81b611df'
const referral_address = process.env.referral_address || 'EEYm1sXVhH1EpsUan6Sj31zdydALoAVCEYdVncJQJ8s6'
const proxy_address = '8GBcwJAfUU9noxPNh5jnfwkKipK8XRHUPS5va9TAXr5f'
const total_supply = 1000000000

console.log('programId_address', programId_address, rpc)

if (process.env.IS_LOCAL) {
    const httpDispatcher = new ProxyAgent({ uri: "http://127.0.0.1:4780" });
    setGlobalDispatcher(httpDispatcher);
}

export class FlipN {
    static programId: PublicKey = new PublicKey(programId_address);
    static wsol: PublicKey = new PublicKey("So11111111111111111111111111111111111111112")
    static state: PublicKey = PublicKey.findProgramAddressSync(
        [Buffer.from("launchpad")],
        FlipN.programId
    )[0]
    static proxy: PublicKey = new PublicKey(proxy_address)

    static connection: Connection = new Connection(rpc, {
        fetch: fetch
    })

    // @ts-ignore
    owner: PublicKey;
    // @ts-ignore
    tokenName: string;
    // @ts-ignore
    tokenSymbol: string;
    // @ts-ignore
    tokenDecimals: number;
    // @ts-ignore
    icon?: string;
    // @ts-ignore
    referral: PublicKey = new PublicKey(referral_address);
    // @ts-ignore
    program: Program<any>;
    // @ts-ignore
    pool: PublicKey;
    // @ts-ignore
    tokenInfo: PublicKey;
    // @ts-ignore
    tokenAddress: PublicKey | null = null;

    constructor() {}

    async init({
        owner,
        tokenName,
        tokenSymbol,
        tokenDecimals,
        tokenAddress,
        icon,
        referralAddress
    }: { owner: string, tokenName?: string, tokenSymbol?: string, tokenDecimals?: number, tokenAddress?: string, icon?: string, referralAddress?: string }) {
        this.owner = new PublicKey(owner)
        if (tokenAddress) {

            console.log('tokenAddress', tokenAddress)

            this.tokenAddress = new PublicKey(tokenAddress)
            const metaplex = Metaplex.make(FlipN.connection);
            const metadataAccount = await metaplex
                .nfts()
                .findByMint({ mintAddress: this.tokenAddress });
    
            console.log('metadataAccount', metadataAccount)

            if (!metadataAccount) {
                throw 'metadataAccount not found'
            }

            this.tokenName = metadataAccount.name
            this.tokenSymbol = metadataAccount.symbol
            this.tokenDecimals = metadataAccount.mint.decimals
            this.icon = metadataAccount.uri



        } else {
            if (!tokenName || !tokenSymbol || !tokenDecimals || !icon) {
                throw 'tokenName, tokenSymbol, tokenDecimals and icon are required'
            }
            this.tokenName = tokenName
            this.tokenSymbol = tokenSymbol
            this.tokenDecimals = tokenDecimals
            this.icon = icon
        }
        
        console.log('init program', FlipN.programId, FlipN)
        
        this.program = new Program<any>(idl, FlipN.programId, {
            connection: FlipN.connection
        } as any);

        if (referralAddress) {
            this.referral = new PublicKey(referralAddress)
        }

        this.pool = PublicKey.findProgramAddressSync(
            [
                Buffer.from("token_info"),
                FlipN.state.toBuffer(),
                Buffer.from(this.tokenName),
                Buffer.from(this.tokenSymbol)
            ],
            FlipN.programId
        )[0]

        this.tokenInfo = PublicKey.findProgramAddressSync(
            [
                Buffer.from("mint"),
                FlipN.state.toBuffer(),
                Buffer.from(this.tokenName),
                Buffer.from(this.tokenSymbol)
            ],
            FlipN.programId
        )[0]
    }

    async buyToken(outputAmount: string | number, maxWsolAmount: string | number): Promise<string | null> {

        const keysAndIns = await this.getTradeKeysAndInstructions();
        if (!keysAndIns) {
            return null;
        }

        const { keys, instructions } = keysAndIns;

        const instruction1 = SystemProgram.transfer({
            fromPubkey: this.owner,
            toPubkey: keys.userWsolAccount,
            lamports: Number(maxWsolAmount)
        });
        const instruction2 = createSyncNativeInstruction(
            keys.userWsolAccount,
            TOKEN_PROGRAM_ID
        );

        const tx = new Transaction()

        const buyInstruction = await this.program.methods
            .buyToken({
                solAmount: new anchor.BN(maxWsolAmount),
                maxPrice: new anchor.BN(outputAmount),
                referralParam: {
                    recommender: this.referral,
                    proxy: keys.proxySolAccount
                }
            })
            .accounts(keys)
            .instruction();

        instructions.forEach((ins) => {
            ins && tx.add(ins);
        });

        tx.add(instruction1).add(instruction2).add(buyInstruction);

        const latestBlockhash = await FlipN.connection.getLatestBlockhash();
        tx.feePayer = this.owner;
        tx.recentBlockhash = latestBlockhash!.blockhash;

        return tx.serialize({ verifySignatures: false }).toString("base64")
    }

    async sellToken(amount: number | string, minWsolAmount: number | string): Promise<string | null> {
        const keysAndIns = await this.getTradeKeysAndInstructions();
        if (!keysAndIns) {
            return null;
        }

        const { keys, instructions } = keysAndIns;

        const tx = new Transaction();

        const sellInstruction = await this.program.methods
            .sellToken({
                amount: new anchor.BN(amount),
                minWsolAmount: new anchor.BN(minWsolAmount),
                referralParam: {
                    recommender: this.referral,
                    proxy: keys.proxySolAccount
                }
            })
            .accounts(keys)
            .instruction();

        instructions.forEach((ins) => {
            ins && tx.add(ins);
        });

        tx.add(sellInstruction);

        const closeUseSolIns = createCloseAccountInstruction(
            keys.userWsolAccount,
            this.owner,
            this.owner
        );

        tx.add(closeUseSolIns);

        const latestBlockhash = await FlipN.connection.getLatestBlockhash();
        tx.feePayer = this.owner;
        tx.recentBlockhash = latestBlockhash!.blockhash;

        return tx.serialize({ verifySignatures: false }).toString("base64")
    }

    async prepaid(amount: number | string, isCreate: boolean = false) {
        const keysAndIns = await this.getTradeKeysAndInstructions();
        if (!keysAndIns) {
            return null;
        }

        const { keys, instructions } = keysAndIns;

        const transaction = new Transaction();

        instructions.forEach((ins) => {
            ins && transaction.add(ins);
        });

        const paidRecord = PublicKey.findProgramAddressSync(
            [
                Buffer.from("prepaid_record"),
                keys.pool.toBuffer(),
                this.owner.toBuffer()
            ],
            FlipN.programId
        )[0];

        const protocolSolAccount = await this.getAssociatedTokenAccount(
            FlipN.wsol,
            FlipN.state
        );

        if (!protocolSolAccount) {
            throw "Create protocolSolAccount failed";
        }

        if (protocolSolAccount.instruction) {
            transaction.add(protocolSolAccount.instruction);
        }

        const prepaidInstruction = await this.program.methods
            .prepaid(new anchor.BN(amount))
            .accounts({
                ...keys,
                paidRecord: paidRecord,
                protocolWsolAccount: protocolSolAccount.address
            })
            .instruction();

        if (isCreate) {
            return prepaidInstruction;
        }

        const instruction1 = SystemProgram.transfer({
            fromPubkey: this.owner,
            toPubkey: keys.userWsolAccount,
            lamports: Number(amount)
        });

        const instruction2 = createSyncNativeInstruction(
            keys.userWsolAccount,
            TOKEN_PROGRAM_ID
        );

        transaction.add(instruction1).add(instruction2);

        transaction.add(prepaidInstruction);

        const latestBlockhash = await FlipN.connection.getLatestBlockhash();
        transaction.feePayer = this.owner;
        transaction.recentBlockhash = latestBlockhash!.blockhash;

        return transaction.serialize({ verifySignatures: false }).toString("base64")
    }

    async prepaidSolWithdraw() {
        const keysAndIns = await this.getWithdrawKeysAndInstructions();
        if (!keysAndIns) {
            return null;
        }

        const { keys, instructions } = keysAndIns;

        const outputAmount = await this.checkPrePaid();
        if (outputAmount <= 0) {
            return null;
        }

        const transaction = new Transaction();

        instructions.forEach((ins) => {
            ins && transaction.add(ins);
        });

        const prepaidSolWithdrawInstruction = await this.program.methods
            .prepaidSolWithdraw(new anchor.BN(outputAmount))
            .accounts(keys)
            .instruction();

        transaction.add(prepaidSolWithdrawInstruction);

        const closeUseSolIns = createCloseAccountInstruction(
            keys.userWsolAccount,
            this.owner,
            this.owner
        );

        transaction.add(closeUseSolIns);

        const latestBlockhash = await FlipN.connection.getLatestBlockhash();
        transaction.feePayer = this.owner;
        transaction.recentBlockhash = latestBlockhash!.blockhash;

        return transaction.serialize({ verifySignatures: false }).toString("base64")
    }

    async prepaidTokenWithdraw() {
        const keysAndIns = await this.getTradeKeysAndInstructions();
        if (!keysAndIns) {
            return null;
        }

        const { keys, instructions } = keysAndIns;

        const transaction = new Transaction();

        const paidRecord = PublicKey.findProgramAddressSync(
            [
                Buffer.from("prepaid_record"),
                keys.pool.toBuffer(),
                this.owner.toBuffer()
            ],
            FlipN.programId
        );

        const outputAmount = await this.checkPrePaid();

        if (outputAmount <= 0) {
            return null;
        }

        instructions.forEach((ins) => {
            ins && transaction.add(ins);
        });

        const instruction1 = SystemProgram.transfer({
            fromPubkey: this.owner,
            toPubkey: keys.userWsolAccount,
            lamports: Number(outputAmount) * 0.01
        });
        const instruction2 = createSyncNativeInstruction(
            keys.userWsolAccount,
            TOKEN_PROGRAM_ID
        );

        transaction.add(instruction1).add(instruction2);

        const prepaidTokenWithdrawInstruction = await this.program.methods
            .prepaidTokenWithdraw(new anchor.BN(outputAmount))
            .accounts(keys)
            .instruction();

        transaction.add(prepaidTokenWithdrawInstruction);

        const latestBlockhash = await FlipN.connection.getLatestBlockhash();
        transaction.feePayer = this.owner;
        transaction.recentBlockhash = latestBlockhash!.blockhash;

        return transaction.serialize({ verifySignatures: false }).toString("base64")
    }

    async createToken(launching: boolean = false, amount: number = 0): Promise<string | null> {
        const transaction = new Transaction();

        const keys = await this.getCreateKeys();
        if (!keys) {
            return null;
        }

        const createAccountInstruction = await this.program.methods
            .createTokenAccount({
                name: this.tokenName,
                symbol: this.tokenSymbol,
                uri: this.icon || "",
                totalSupply: new anchor.BN(total_supply),
                decimals: new anchor.BN(this.tokenDecimals)
            })
            .accounts({
                launchpad: FlipN.state,
                pool: this.pool,
                tokenMint: this.tokenInfo,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                user: this.owner,
                systemProgram: SystemProgram.programId
            })
            .instruction();

        transaction.add(createAccountInstruction);

        const METADATA_SEED = "metadata";
        const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
            "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        );
        const [metadataAddress] = PublicKey.findProgramAddressSync(
            [
                Buffer.from(METADATA_SEED),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                this.tokenInfo.toBuffer()
            ],
            TOKEN_METADATA_PROGRAM_ID
        );

        const userSolAccount = await this.getAssociatedTokenAccount(
            FlipN.wsol,
            this.owner
        );
        if (!userSolAccount) {
            throw "Create userSolAccount failed";
        }
        if (userSolAccount.instruction) {
            transaction.add(userSolAccount.instruction);
        }
        const poolSolAccount = await this.getAssociatedTokenAccount(
            FlipN.wsol,
            this.pool
        );

        if (!poolSolAccount) {
            throw "Create poolSolAccount failed";
        }
        if (poolSolAccount.instruction) {
            transaction.add(poolSolAccount.instruction);
        }

        const poolTokenAccount = await this.getAssociatedTokenAccount(
            keys.tokenInfo,
            keys.pool
        );
        if (!poolTokenAccount) {
            throw "Create poolTokenAccount failed";
        }
        if (poolTokenAccount.instruction) {
            transaction.add(poolTokenAccount.instruction);
        }

        const protocolSolAccount = await this.getAssociatedTokenAccount(
            FlipN.wsol,
            keys.launchpad
        );
        if (!protocolSolAccount) {
            throw "Create protocolSolAccount failed";
        }
        if (protocolSolAccount.instruction) {
            transaction.add(protocolSolAccount.instruction);
        }

        const createInfoTransition = await this.program.methods
            .createTokenInfo({
                name: this.tokenName,
                symbol: this.tokenSymbol,
                uri: this.icon || "",
                totalSupply: new anchor.BN(total_supply),
                decimals: new anchor.BN(this.tokenDecimals)
            })
            .accounts({
                launchpad: FlipN.state,
                pool: this.pool,
                metadata: metadataAddress,
                wsolMint: FlipN.wsol,
                userWsolAccount: userSolAccount.address,
                poolWsolAccount: poolSolAccount.address,
                protocolWsolAccount: protocolSolAccount.address,
                tokenMint: this.tokenInfo,
                poolTokenAccount: poolTokenAccount.address,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                user: this.owner,
                systemProgram: SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID
            })
            .instruction();

        let lamports = 0;
        if (amount && Number(amount) > 0) {
            lamports += Number(amount);
        }

        const instruction1 = SystemProgram.transfer({
            fromPubkey: this.owner,
            toPubkey: userSolAccount.address,
            lamports
        });
        const instruction2 = createSyncNativeInstruction(
            userSolAccount.address,
            TOKEN_PROGRAM_ID
        );

        transaction
            .add(instruction1)
            .add(instruction2)
            .add(createInfoTransition);

        if (launching) {
            const memoProgramId = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

            const memoInstruction = new TransactionInstruction({
                keys: [],
                programId: memoProgramId,
                data: Buffer.from(JSON.stringify({"type":"AddLaunching", "token": keys.tokenInfo.toBase58()})),
            });
            const transferSOLInstruction = SystemProgram.transfer({
                fromPubkey: this.owner,
                toPubkey: new PublicKey('EEzniCRUsjy9sqEqEi6jPEDF3kJehJxCxWrt2FuEQasH'),
                lamports: 100000000,
            });
            transaction.add(memoInstruction);
            transaction.add(transferSOLInstruction);
        }

        if (amount && Number(amount) > 0) {
            const prepaidInstructions = await this.prepaid(amount, true);
            if (prepaidInstructions) {
                transaction.add(prepaidInstructions as any);
            }
        }

        const latestBlockhash = await FlipN.connection.getLatestBlockhash();
        transaction.feePayer = this.owner;
        transaction.recentBlockhash = latestBlockhash!.blockhash;

        return transaction.serialize({ verifySignatures: false }).toString("base64");
    }

    async estimate(inNumber: number, inType: 'sol' | 'token') {
        const poolData: any = await this.program.account.pool.fetch(this.pool);
        const poolToken = new Big(poolData!.virtualTokenAmount.toNumber());
        const solToken = new Big(poolData!.virtualWsolAmount.toNumber());
        if (inType === 'sol') {
            const _solAmount = new Big(inNumber).mul(1 - 0.01);
            const result = poolToken
            .mul(_solAmount)
            .div(solToken.plus(_solAmount))
            .toFixed(0, 0);
            return result;
        } else {
            const _tokenAmount = new Big(inNumber).mul(1 - 0.015);
            const result = solToken
              .mul(_tokenAmount)
              .div(poolToken.plus(_tokenAmount))
              .toFixed(0, 0);
            return result;
        }

        return 0
    }

    private async getTradeKeysAndInstructions() {
        const instructions: (TransactionInstruction | null)[] = [];

        const protocolSolAccount = await this.getAssociatedTokenAccount(
            FlipN.wsol,
            FlipN.state
        );
        if (!protocolSolAccount) {
            return null;
        }
        instructions.push(protocolSolAccount.instruction);

        const userSolAccount = await this.getAssociatedTokenAccount(
            FlipN.wsol,
            this.owner
        );
        if (!userSolAccount) {
            return null;
        }
        instructions.push(userSolAccount.instruction);

        const poolSolAccount = await this.getAssociatedTokenAccount(
            FlipN.wsol,
            this.pool
        );
        if (!poolSolAccount) {
            return null;
        }
        instructions.push(poolSolAccount.instruction);


        const userTokenAccount = await this.getAssociatedTokenAccount(
            this.tokenInfo,
            this.owner
        );
        if (!userTokenAccount) {
            return null;
        }
        instructions.push(userTokenAccount.instruction);

        const poolTokenAccount = await this.getAssociatedTokenAccount(
            this.tokenInfo,
            this.pool
        );
        if (!poolTokenAccount) {
            return null;
        }
        instructions.push(poolTokenAccount.instruction);

        const referralRecord = PublicKey.findProgramAddressSync(
            [
                Buffer.from("referral_record"),
                FlipN.state.toBuffer(),
                this.owner.toBuffer()
            ],
            FlipN.programId
        )[0];

        try {
            const accountInfo = await FlipN.connection.getAccountInfo(referralRecord);

            if (accountInfo) {
                const referralAccount: any = await this.program.account.referralRecord.fetch(
                    referralRecord
                );
                this.referral = referralAccount.user;
            } else {
            }
        } catch (e) {
            console.log(e);
        }

        const referralFeeRateRecord = PublicKey.findProgramAddressSync(
            [
                Buffer.from("referral_fee_rate_record"),
                FlipN.state.toBuffer(),
                this.referral.toBuffer()
            ],
            FlipN.programId
        )[0];

        const referralSolAccount = await this.getAssociatedTokenAccount(
            FlipN.wsol,
            this.referral
        );
        if (!referralSolAccount) {
            return null;
        }
        instructions.push(referralSolAccount.instruction);

        const proxySolAccount = await this.getAssociatedTokenAccount(
            FlipN.wsol,
            FlipN.proxy
        );
        if (!proxySolAccount) {
            return null;
        }
        instructions.push(proxySolAccount.instruction);

        const keys = {
            launchpad: FlipN.state,
            protocolSolAccount: protocolSolAccount.address,
            referralSolAccount: referralSolAccount.address,
            proxySolAccount: proxySolAccount.address,
            pool: this.pool,
            wsolMint: FlipN.wsol,
            userWsolAccount: userSolAccount.address,
            poolWsolAccount: poolSolAccount.address,
            tokenMint: this.tokenInfo,
            userTokenAccount: userTokenAccount.address,
            poolTokenAccount: poolTokenAccount.address,
            referralRecord: referralRecord,
            referralFeeRateRecord: referralFeeRateRecord,

            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            user: this.owner,
            systemProgram: SystemProgram.programId
        }

        return {
            keys,
            instructions
        }
    }

    private async getWithdrawKeysAndInstructions() {
        const instructions: (TransactionInstruction | null)[] = [];

        const userSolAccount = await this.getAssociatedTokenAccount(
            FlipN.wsol,
            this.owner
        );
        if (!userSolAccount) {
            return null;
        }
        instructions.push(userSolAccount.instruction);

        const poolSolAccount = await this.getAssociatedTokenAccount(
            FlipN.wsol,
            this.pool
        );
        if (!poolSolAccount) {
            return null;
        }
        instructions.push(poolSolAccount.instruction);

        const prePaidRecord = PublicKey.findProgramAddressSync(
            [
                Buffer.from("prepaid_record"),
                this.pool.toBuffer(),
                this.owner.toBuffer()
            ],
            FlipN.programId
        )[0];

        const keys = {
            launchpad: FlipN.state,
            pool: this.pool,
            wsolMint: FlipN.wsol,
            userWsolAccount: userSolAccount.address,
            poolWsolAccount: poolSolAccount.address,
            paidRecord: prePaidRecord,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            user: this.owner,
            systemProgram: SystemProgram.programId
        }

        return {
            keys,
            instructions
        }
    }

    private async getCreateKeys() {
        return {
            launchpad: FlipN.state,
            pool: this.pool,
            tokenInfo: this.tokenInfo
        };
    }

    private async getAssociatedTokenAccount(mint: PublicKey, owner: PublicKey): Promise<{
        address: PublicKey,
        instruction: TransactionInstruction | null,
        account: Account | null
    } | null> {
        const associatedToken = getAssociatedTokenAddressSync(
            mint,
            owner,
            true,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        let account: Account | null = null;
        let instruction = null;
        try {
            account = await getAccount(
                FlipN.connection,
                associatedToken,
                undefined,
                TOKEN_PROGRAM_ID
            );
        } catch (error: unknown) {
            // console.log('error: ', error)
            if (
                error instanceof TokenAccountNotFoundError ||
                error instanceof TokenInvalidAccountOwnerError
            ) {
                try {
                    instruction = createAssociatedTokenAccountInstruction(
                        this.owner,
                        associatedToken,
                        owner,
                        mint,
                        TOKEN_PROGRAM_ID,
                        ASSOCIATED_TOKEN_PROGRAM_ID
                    );
                } catch (e) {
                    console.log(e);
                }
            }
        }

        return {
            address: associatedToken,
            instruction: instruction,
            account
        };
    }

    async checkPrePaid() {
        const prePaidRecord = PublicKey.findProgramAddressSync(
            [
                Buffer.from("prepaid_record"),
                this.pool.toBuffer(),
                this.owner.toBuffer()
            ],
            FlipN.programId
        )[0];

        try {
            const prePaidRecordData: any = await this.program.account.prePaidRecord.fetch(
                prePaidRecord
            );
            return prePaidRecordData.paidAmount.toNumber();
        } catch (e) {
            console.log(e);
        }

        return 0;
    }
}
