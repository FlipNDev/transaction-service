import Big from "big.js";
import { FlipN } from "../src/flipN";



// console.log('flipN:', flipN)

// flipN.test()

// flipN.buyToken(1030694356243, 1000000).then(res => {
//     console.log(res)
// }).catch(err => {
//     console.log(err)
// })

async function test() {
    const flipN = new FlipN()
    await flipN.init({
        owner: '2zSSVwbNGR8e6T9bEaMLYmwkmSrrjiXcYn5yyR8nM2dT',
        tokenAddress: 'BW6X26R9L57PWVcHersgMirB9eau5ck6333SUHMxGm88'
    })

    const value = await flipN.estimate(1000000, 'sol')

    const trs = await flipN.buyToken(Big(value).toFixed(0, 0), 1000000)

    console.log(trs)
}

test()