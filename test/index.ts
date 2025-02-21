import { Connection, Keypair, sendAndConfirmTransaction, Transaction } from '@solana/web3.js';
import dotenv from 'dotenv';
import { ProxyAgent, setGlobalDispatcher } from 'undici';
import bs58 from 'bs58'

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

    // 从base64字符串转换成Transaction
    const base64String = "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAYSHZKOx6KVUKq0Q2720d6ZCfW2pyGMEj4GqxPk/mqEYbYsiKNmsOdl74Q2RGvMVyHW727uCjExx+Kt5izF5iDcMkaoev87HpwHtjNePmBEMiMTNWpm73z2dalJlKsSMv8mTJuOWe+PUGwWqEOzhW6hD1czeNfrufOKNVHLJTb1PRtob4nW8FpiCvyOlc94kbs1fWiAfpocosKfLNQTDXYXUoZotZSOZL6kGtCWsCmhVO2/HcB2m0cnl4KtCNcrFrPwxpZlyjRW/LAQJbJRgsZuQwxbyuOx5mzJWnJeud29cJzdz6HFAMRkvBbCxMh4CgUT9PCMlrm06WXZDJUEoVfAJOUlgEROirzpphaTJQTUUxMAS2u8hxoy/aRaBSMGAm3w+wYwXHWrrUvMHLwYGKYU1fQqLRiUA5CDs7L0DjJFOPb7rDgAoU3C+b7piHBJpQ3kfZ4b1Js+/aw+DgjLEpe6NghKD53FAGpD01VfVVFqByALIm0kCsgUL9M78kKXOEFXAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABMABsUKKMtQNJE0Lpyk++Vf+pcqF/9+0OHX3a2lGPdN4yXJY9OJInxuz0QKRSODYMLWhOZ2v8QhASOe9jb6fhZnAjzks/cSPMgYr9KzVYjmvbap4uATuquuFtkI/Ec35UGm4hX/quBhPtof2NGGMA12sQ53BrrO1WYoPAAAAAAAQbd9uHXZaGT2cvhRs7reawctIXtX1s3kTqM9YV+/wCpadfjin3hhD7qJfCp1RvvwCjVeUqniLD9K5Evx69+CbMDDAIABQwCAAAAAOH1BQAAAAARAQUBEQ0RCwcJCAoQBQQPAQIGAxEOAAxoin8OWyZXc2kA4fUFAAAAAABoQaomaolCAAAAAAAAAAAAAAAAAAAAAMSgY/PkhBBRdWzM1VI2v3aL+LKb1PAPLXOqnEUiVmtN5SWARE6KvOmmFpMlBNRTEwBLa7yHGjL9pFoFIwYCbfA="; // 这里填入你的base64字符串
    const serializedTransaction = Buffer.from(base64String, 'base64');
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