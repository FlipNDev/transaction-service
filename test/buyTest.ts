import { Connection, Keypair, sendAndConfirmTransaction, Transaction } from '@solana/web3.js';
import dotenv from 'dotenv';
import { ProxyAgent, setGlobalDispatcher } from 'undici';
import bs58 from 'bs58'
import { FlipN } from '../src/flipN';

dotenv.config();    

if (process.env.IS_LOCAL) {
    console.log('is local')
    const httpDispatcher = new ProxyAgent({ uri: "http://127.0.0.1:4780" });
    setGlobalDispatcher(httpDispatcher);
}

const rpc = process.env.RPC || ''
async function test() {
    const connection = new Connection(rpc, {
        fetch: fetch,
        commitment: 'confirmed'
    })

    const privateKeyString = process.env.PRIVATE_KEY || '';
    const sender = Keypair.fromSecretKey(bs58.decode(privateKeyString));

   const flipN = new FlipN()
   await flipN.init({
    owner: sender.publicKey.toBase58(),
    tokenAddress: 'FsVw5rPNVQBgrmJtaUCDiyis9M8RfeKhk5wGEURA6iuJ',
   })

   const maxSol = 100000

   const tokenAmount: any = await flipN.estimate(maxSol, 'sol')
   console.log('params: ', tokenAmount)

   const base64String = await flipN.buyToken(tokenAmount, maxSol)

    // 从base64字符串转换成Transaction
    // const base64String = "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAgSHZKOx6KVUKq0Q2720d6ZCfW2pyGMEj4GqxPk/mqEYbZ8vfdI4j4ILfFPnmrl4F1YxzdNQucGNYWgu4tZJSBe8YZotZSOZL6kGtCWsCmhVO2/HcB2m0cnl4KtCNcrFrPwoIhaW8w+ksjtWRCFWHCE6mX1S1Vjns2ZHRLlMyns49Cx+FOH9bXJ10zsAXzfwgl2oo1vNkgyun2PUN8Bg5GFnLyF2sli79DoSLsEUHqWPtnDWjO+9dRweFv8TXN7T4bXxL3SYGEKs6wWnDn6T0+zWLOIjs1XI22N52EqMdL9j/ADwyEVBv571jWVDCjHw2POoksEZ1c+CQAngHfYiuuuIt3PocUAxGS8FsLEyHgKBRP08IyWubTpZdkMlQShV8AkCEoPncUAakPTVV9VUWoHIAsibSQKyBQv0zvyQpc4QVcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEwAGxQooy1A0kTQunKT75V/6lyoX/37Q4dfdraUY903jJclj04kifG7PRApFI4NgwtaE5na/xCEBI572Nvp+FkFSlNamSkhBk0k6HFg2jh8fDW13bySu4HkH6hAQQVEjQtwZbHj0XxFOJ1Sf2sEw81YuGxzGqD9tUm20bwD+ClGBpuIV/6rgYT7aH9jRhjANdrEOdwa6ztVmKDwAAAAAAEGp9UXGSxcUSGMyUw9SvF/WNruCJuh/UTj29mKAAAAAAbd9uHXZaGT2cvhRs7reawctIXtX1s3kTqM9YV+/wCp0ujNlKuh6TnHnXme72FGJpZgqYO9CjUH/fZAIWJ/UI8ICwcJBAERDAAKV5Pxe2T0hK52AwAAAHR0ZQQAAABUVEUxPAAAAGh0dHBzOi8vZ2l0aHViLmNvbS9jcnlwdG9sb3V0cmUvZmV0Y2gtdG9rZW4tYW5kLWl0cy1tZXRhZGF0YQwGAAUEDwoRAAwGAAMEAQoRAAoCAAIMAgAAAAAAAAAAAAAAEQECARELDwkEBw8CBQgBAxEMAAoQDlcepyE9HV/nmAMAAAB0dGUEAAAAVFRFMTwAAABodHRwczovL2dpdGh1Yi5jb20vY3J5cHRvbG91dHJlL2ZldGNoLXRva2VuLWFuZC1pdHMtbWV0YWRhdGENAE57InR5cGUiOiJBZGRMYXVuY2hpbmciLCJ0b2tlbiI6IjlQd1paVU0xeXJCQkV0SGM1ZGJ4aEsxdzdTek1kRjJrQ0JNOHhnUzVIVlphIn0KAgAGDAIAAAAA4fUFAAAAAA=="; // 这里填入你的base64字符串
    const serializedTransaction = Buffer.from(base64String!, 'base64');
    const transaction = Transaction.from(serializedTransaction);

    // console.log('transaction: ', transaction)
    const latestBlockhash = await connection.getLatestBlockhash();

    console.log('latestBlockhash: ', latestBlockhash)

    transaction.recentBlockhash = latestBlockhash!.blockhash;
    transaction.feePayer = sender.publicKey;

    const signature = await sendAndConfirmTransaction(connection, transaction, [sender], {
        skipPreflight: true,
        // commitment: 'confirmed'
    });

    console.log('signature:', signature)
}

test()