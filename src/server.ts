import express from 'express';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import Entry from './entry';
import { swagger } from './swagger';


dotenv.config();    
const app = express();

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swagger));

// 购买代币接口
app.get('/api/buy', async (req, res) => {
    try {
        const { owner, type, tokenAddress, tokenName, tokenSymbol, tokenDecimals, icon, referralAddress } = req.query;
        const { outputAmount, maxWsolAmount, solIn, slip, amount, tradeType } = req.query;

        const entry = new Entry();
        entry.init({
            owner: String(owner),
            type: Number(type),
            tokenAddress: tokenAddress ? String(tokenAddress) : undefined,
            tokenName: tokenName ? String(tokenName) : undefined,
            tokenSymbol: tokenSymbol ? String(tokenSymbol) : undefined,
            tokenDecimals: tokenDecimals ? Number(tokenDecimals) : undefined,
            icon: icon ? String(icon) : undefined,
            referralAddress: referralAddress ? String(referralAddress) : undefined
        });

        const result = await entry.buyToken({
            outputAmount: outputAmount ? Number(outputAmount) : undefined,
            maxWsolAmount: maxWsolAmount ? Number(maxWsolAmount) : undefined,
            solIn: solIn ? Number(solIn) : undefined,
            slip: slip ? Number(slip) : undefined,
            amount: amount ? Number(amount) : undefined,
            type: tradeType ? String(tradeType) : undefined
        });

        res.json({ txId: result });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// 卖出代币接口
app.get('/api/sell', async (req, res) => {
    try {
        const { owner, type, tokenAddress, tokenName, tokenSymbol, tokenDecimals, icon, referralAddress } = req.query;
        const { amount, minWsolAmount, slip, tradeType } = req.query;

        const entry = new Entry();
        entry.init({
            owner: String(owner),
            type: Number(type),
            tokenAddress: tokenAddress ? String(tokenAddress) : undefined,
            tokenName: tokenName ? String(tokenName) : undefined,
            tokenSymbol: tokenSymbol ? String(tokenSymbol) : undefined,
            tokenDecimals: tokenDecimals ? Number(tokenDecimals) : undefined,
            icon: icon ? String(icon) : undefined,
            referralAddress: referralAddress ? String(referralAddress) : undefined
        });

        const result = await entry.sellToken({
            amount: Number(amount),
            minWsolAmount: minWsolAmount ? Number(minWsolAmount) : undefined,
            slip: slip ? Number(slip) : undefined,
            type: tradeType ? String(tradeType) : undefined
        });

        res.json({ txId: result });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// 预估接口
app.get('/api/estimate', async (req, res) => {
    try {
        const { owner, type, tokenAddress, tokenName, tokenSymbol, tokenDecimals, icon, referralAddress } = req.query;
        const { inNumber, inType, slip } = req.query;

        const entry = new Entry();
        entry.init({
            owner: String(owner),
            type: Number(type),
            tokenAddress: tokenAddress ? String(tokenAddress) : undefined,
            tokenName: tokenName ? String(tokenName) : undefined,
            tokenSymbol: tokenSymbol ? String(tokenSymbol) : undefined,
            tokenDecimals: tokenDecimals ? Number(tokenDecimals) : undefined,
            icon: icon ? String(icon) : undefined,
            referralAddress: referralAddress ? String(referralAddress) : undefined
        });

        const result = await entry.estimate(
            Number(inNumber),
            String(inType) as 'sol' | 'token',
            slip ? Number(slip) : undefined
        );

        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Prepaid interface
app.get('/api/prepaid', async (req, res) => {
    try {
        const { owner, type, tokenAddress, tokenName, tokenSymbol, tokenDecimals, icon, referralAddress } = req.query;
        const { amount, isCreate } = req.query;

        const entry = new Entry();
        entry.init({
            owner: String(owner),
            type: Number(type),
            tokenAddress: tokenAddress ? String(tokenAddress) : undefined,
            tokenName: tokenName ? String(tokenName) : undefined,
            tokenSymbol: tokenSymbol ? String(tokenSymbol) : undefined,
            tokenDecimals: tokenDecimals ? Number(tokenDecimals) : undefined,
            icon: icon ? String(icon) : undefined,
            referralAddress: referralAddress ? String(referralAddress) : undefined
        });

        const result = await entry.prepaid(
            Number(amount),
            isCreate === 'true'
        );

        res.json({ txId: result });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Prepaid SOL withdraw interface
app.get('/api/prepaid/sol/withdraw', async (req, res) => {
    try {
        const { owner, type, tokenAddress, tokenName, tokenSymbol, tokenDecimals, icon, referralAddress } = req.query;

        const entry = new Entry();
        entry.init({
            owner: String(owner),
            type: Number(type),
            tokenAddress: tokenAddress ? String(tokenAddress) : undefined,
            tokenName: tokenName ? String(tokenName) : undefined,
            tokenSymbol: tokenSymbol ? String(tokenSymbol) : undefined,
            tokenDecimals: tokenDecimals ? Number(tokenDecimals) : undefined,
            icon: icon ? String(icon) : undefined,
            referralAddress: referralAddress ? String(referralAddress) : undefined
        });

        const result = await entry.prepaidSolWithdraw();
        res.json({ txId: result });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Prepaid token withdraw interface
app.get('/api/prepaid/token/withdraw', async (req, res) => {
    try {
        const { owner, type, tokenAddress, tokenName, tokenSymbol, tokenDecimals, icon, referralAddress } = req.query;

        const entry = new Entry();
        entry.init({
            owner: String(owner),
            type: Number(type),
            tokenAddress: tokenAddress ? String(tokenAddress) : undefined,
            tokenName: tokenName ? String(tokenName) : undefined,
            tokenSymbol: tokenSymbol ? String(tokenSymbol) : undefined,
            tokenDecimals: tokenDecimals ? Number(tokenDecimals) : undefined,
            icon: icon ? String(icon) : undefined,
            referralAddress: referralAddress ? String(referralAddress) : undefined
        });

        const result = await entry.prepaidTokenWithdraw();
        res.json({ txId: result });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Create token interface
app.get('/api/token/create', async (req, res) => {
    try {
        const { owner, type, tokenAddress, tokenName, tokenSymbol, tokenDecimals, icon, referralAddress } = req.query;
        const { launching, amount } = req.query;

        const entry = new Entry();
        entry.init({
            owner: String(owner),
            type: Number(type),
            tokenAddress: tokenAddress ? String(tokenAddress) : undefined,
            tokenName: tokenName ? String(tokenName) : undefined,
            tokenSymbol: tokenSymbol ? String(tokenSymbol) : undefined,
            tokenDecimals: tokenDecimals ? Number(tokenDecimals) : undefined,
            icon: icon ? String(icon) : undefined,
            referralAddress: referralAddress ? String(referralAddress) : undefined
        });

        const result = await entry.createToken(
            launching ? !!launching : false,
            amount ? Number(amount) : 0
        );

        res.json({ txId: result });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
}); 
