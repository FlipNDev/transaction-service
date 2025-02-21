import { PublicKey } from "@solana/web3.js"
import { FlipN } from "./flipN"
import { Pump } from "./pump"
import { Jupiter } from "./jupiter"


enum EntryType {
    FLIP_N = 1,
    PUMP = 2,
    JUPITER = 3
}

class Entry {
    flipN: FlipN | undefined
    pump: Pump | undefined
    jupiter: Jupiter | undefined
    type: EntryType | undefined
    constructor() {

    }

    async init({
        owner,
        type,
        tokenName,
        tokenSymbol,
        tokenDecimals,
        tokenAddress,
        icon,
        referralAddress
    }: { owner: string, type: EntryType, tokenName?: string, tokenSymbol?: string, tokenDecimals?: number, tokenAddress?: string, icon?: string, referralAddress?: string }) {
        this.type = type
        if (type === EntryType.FLIP_N) {
            this.flipN = new FlipN()
            await this.flipN.init({
                owner,
                tokenName,
                tokenSymbol,
                tokenDecimals,
                tokenAddress,
                icon,
                referralAddress
            })
        } else if (type === EntryType.PUMP) {
            if (!tokenAddress) {
                throw 'tokenAddress is required'
            }
            this.pump = new Pump({
                owner,
                tokenAddress
            })
        } else if (type === EntryType.JUPITER) {
            if (!tokenAddress) {
                throw 'tokenAddress is required'
            }
            this.jupiter = new Jupiter({
                owner,
                tokenAddress
            })
        }
    }

    async buyToken(params: any): Promise<string | null> {
        if (!this.type) {
            return null
        }

        if (this.type === EntryType.FLIP_N) {
            if (!this.flipN) {
                return null
            }
            return this.flipN.buyToken(params.outputAmount, params.maxWsolAmount)
        }

        if (this.type === EntryType.PUMP) {
            if (!this.pump) {
                return null
            }
            return this.pump.buyToken(params.solIn, params.slip)
        }

        if (this.type === EntryType.JUPITER) {
            if (!this.jupiter) {
                return null
            }
            return this.jupiter.trade(params.amount, params.type, params.slip)
        }

        return null

    }

    async sellToken(params: any): Promise<string | null> {
        if (!this.type) {
            return null
        }

        if (this.type === EntryType.FLIP_N) {
            if (!this.flipN) {
                return null
            }
            return this.flipN.sellToken(params.amount, params.minWsolAmount)
        }

        if (this.type === EntryType.PUMP) {
            if (!this.pump) {
                return null
            }
            return this.pump.sellToken(params.amount, params.slip)
        }

        if (this.type === EntryType.JUPITER) {
            if (!this.jupiter) {
                return null
            }
            return this.jupiter.trade(params.amount, params.type, params.slip)
        }

        return null
    }

    async prepaid(amount: number | string, isCreate: boolean = false) {
        if (!this.flipN) {
            return null
        }
        return this.flipN.prepaid(amount, isCreate)
    }

    async prepaidSolWithdraw() {
        if (!this.flipN) {
            return null
        }
        return this.flipN.prepaidSolWithdraw()
    }

    async prepaidTokenWithdraw() {
        if (!this.flipN) {
            return null
        }
        return this.flipN.prepaidTokenWithdraw()
    }

    async createToken(launching: boolean = false, amount: number = 0) {
        if (!this.flipN) {
            return null
        }
        return this.flipN.createToken(launching, amount)
    }

    async checkPrepaid() {
        if (!this.flipN) {
            return null
        }
        return this.flipN.checkPrePaid()
    }

    async estimate(inNumber: number, inType: 'sol' | 'token', slip: number = 0.03): Promise<any> {
        if (!this.type) {
            return null
        }
        if (this.type === EntryType.FLIP_N) {
            if (!this.flipN) {
                return null
            }

            const amount = await this.flipN.estimate(inNumber, inType)

            if (inType === 'sol') {
                return {
                    estimateAmount: amount,
                    quote: {
                        outputAmount: inNumber,
                        maxWsolAmount: amount
                    }

                }
            } else {
                return {
                    estimateAmount: amount,
                    quote: {
                        amount: inNumber,
                        minWsolAmount: amount
                    }
                }
            }
        }

        if (this.type === EntryType.PUMP) {
            if (!this.pump) {
                return null
            }
            const amount = await this.pump.estimate(inNumber, inType)

            if (inType === 'sol') {
                return {
                    estimateAmount: amount,
                    quote: {
                        solIn: inNumber,
                        slip
                    }
                }
            } else {
                return {
                    estimateAmount: amount,
                    quote: {
                        amount: amount,
                        slip
                    }
                }
            }
        }

        if (this.type === EntryType.JUPITER) {
            if (!this.jupiter) {
                return null
            }
            const amount = await this.jupiter.estimate(inNumber, inType)

            return {
                estimateAmount: amount,
                quote: {
                    amount: amount,
                    type: inType,
                    slip
                }
            }
        }
    }
}

export default Entry
