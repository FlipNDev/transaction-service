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
    tokenAddress: 'BKy43Ab4M4KjTU5V195GJkLTNjKiqQx8iS71N1XTxDyh',
   })

   const maxSol = 100000

   const tokenAmount: any = await flipN.estimate(maxSol, 'sol')
   console.log('params: ', tokenAmount)

   const base64String = await flipN.buyToken(tokenAmount * (1 - 0.03), maxSol)

    // 从base64字符串转换成Transaction
    const base64String2 = "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAYSjiH71n/IGO2UHWL7f1nlKfw+OoHR7cwWtznVtgKHQIgAWKOhKiulZbvqtDXwWt58Q0pr59wl+j73XIWdpOxg8RRETMnQ9bZP9byTMLo+g2xQ1cQ+Gqjyd4oub3v0G3kATJuOWe+PUGwWqEOzhW6hD1czeNfrufOKNVHLJTb1PRt1Pe4skA6g14tJK+NB/MBLTiIDL9is1qRuFYFwL7wA+sNw3b6TP5d+g/XHo5Pwdxk94CeCLL6aiQ1VQlUnWzxK3c+hxQDEZLwWwsTIeAoFE/TwjJa5tOll2QyVBKFXwCTrIcqGnZ12yuH+eZ9s9IQ7G76XFOIFU12tiHeGQFqoCeUlgEROirzpphaTJQTUUxMAS2u8hxoy/aRaBSMGAm3w+ct2kHMi+f/84KfxCfN1yQcKseiekhwu60xlSQaj5S/7BjBcdautS8wcvBgYphTV9CotGJQDkIOzsvQOMkU49ghKD53FAGpD01VfVVFqByALIm0kCsgUL9M78kKXOEFXAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABMABsUKKMtQNJE0Lpyk++Vf+pcqF/9+0OHX3a2lGPdN4yXJY9OJInxuz0QKRSODYMLWhOZ2v8QhASOe9jb6fhZmXCz0y/XrWyrpx6XqEF72vcCMBQnWO7s5KuNF0i3GgAGm4hX/quBhPtof2NGGMA12sQ53BrrO1WYoPAAAAAAAQbd9uHXZaGT2cvhRs7reawctIXtX1s3kTqM9YV+/wCpFw3kcx9xeNwrJMf91v+62JWMUur8h4d6J9ByN10qcUYDDAIABQwCAAAAoIYBAAAAAAARAQUBEQ0RCwYKCAkQBQEPBwQCAxEOAAxoin8OWyZXc2mghgEAAAAAAAAAjkOtbzhCAAAAAAAAAAAAAAAAAAAAAMSgY/PkhBBRdWzM1VI2v3aL+LKb1PAPLXOqnEUiVmtN5SWARE6KvOmmFpMlBNRTEwBLa7yHGjL9pFoFIwYCbfA="; // 这里填入你的base64字符串
    const serializedTransaction = Buffer.from(base64String2, 'base64');
    const transaction = Transaction.from(serializedTransaction);

    // console.log('transaction: ', transaction)
    const latestBlockhash = await connection.getLatestBlockhash();

    console.log('latestBlockhash: ', latestBlockhash)

    transaction.recentBlockhash = latestBlockhash!.blockhash;
    transaction.feePayer = sender.publicKey;

    // console.log('transaction: ', transaction)

    const signature = await sendAndConfirmTransaction(connection, transaction, [sender], {
        skipPreflight: true,
        // commitment: 'confirmed'
    });

    console.log('signature:', signature)
}

test()