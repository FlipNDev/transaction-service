import { FlipN } from "./flipN";

const flipN = new FlipN({
    owner: "3aPjLKaEvuTU2DfmGEE2Wjh24VKN3wkMmwoicJCV7sPa",
    tokenName: "MEOMEO",
    tokenSymbol: "MEOMEO",
    tokenDecimals: 6,
})

// console.log('flipN:', flipN)

// flipN.test()

flipN.buyToken(1030694356243, 1000000).then(res => {
    console.log(res)
}).catch(err => {
    console.log(err)
})