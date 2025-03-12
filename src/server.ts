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
        const { owner, type, tokenAddress, referralAddress, params } = req.query;

        const entry = new Entry();
        await entry.init({
            owner: String(owner),
            type: Number(type),
            tokenAddress: tokenAddress ? String(tokenAddress) : undefined,
            tokenName: undefined,
            tokenSymbol: undefined,
            tokenDecimals: undefined,
            icon: undefined,
            referralAddress: referralAddress ? String(referralAddress) : undefined
        });

        const result = await entry.buyToken(JSON.parse(params as string));

        res.json({ txId: result });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// 卖出代币接口
app.get('/api/sell', async (req, res) => {
    try {
        const { owner, type, tokenAddress, referralAddress, params } = req.query;
        const entry = new Entry();
        await entry.init({
            owner: String(owner),
            type: Number(type),
            tokenAddress: tokenAddress ? String(tokenAddress) : undefined,
            tokenName: undefined,
            tokenSymbol: undefined,
            tokenDecimals: undefined,
            icon: undefined,
            referralAddress: referralAddress ? String(referralAddress) : undefined
        });

        const result = await entry.sellToken(JSON.parse(params as string));

        res.json({ txId: result });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// 预估接口
app.get('/api/estimate', async (req, res) => {
    try {

        console.log('estimate')

        const { owner, type, tokenAddress } = req.query;
        const { inNumber, inType, slip } = req.query;

        const entry = new Entry();
        await entry.init({
            owner: String(owner),
            type: Number(type),
            tokenAddress: tokenAddress ? String(tokenAddress) : undefined,
            tokenName: undefined,
            tokenSymbol: undefined,
            tokenDecimals: undefined,
            icon: undefined,
            referralAddress: undefined
        });

        console.log('estimate init')

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
        const { owner, tokenAddress, amount } = req.query;

        const entry = new Entry();
        await entry.init({
            owner: String(owner),
            type: 1,
            tokenAddress: undefined,
            tokenName: undefined,
            tokenSymbol: undefined,
            tokenDecimals: undefined,
            icon: undefined,
            referralAddress: undefined
        });

        const result = await entry.prepaid(
            Number(amount),
            false
        );

        res.json({ txId: result });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Prepaid SOL withdraw interface
app.get('/api/prepaid/sol/withdraw', async (req, res) => {
    try {
        const { owner, tokenAddress } = req.query;

        const entry = new Entry();
        await entry.init({
            owner: String(owner),
            type: 1,
            tokenAddress: tokenAddress ? String(tokenAddress) : undefined,
            tokenName: undefined,
            tokenSymbol: undefined,
            tokenDecimals: undefined,
            icon: undefined,
            referralAddress: undefined
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
        const { owner, tokenAddress } = req.query;

        const entry = new Entry();
        await entry.init({
            owner: String(owner),
            type: 1,
            tokenAddress: tokenAddress ? String(tokenAddress) : undefined,
            tokenName: undefined,
            tokenSymbol: undefined,
            tokenDecimals: undefined,
            icon: undefined,
            referralAddress: undefined
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
        const { owner, tokenName, tokenSymbol, tokenDecimals, icon, launching, amount } = req.query;

        const entry = new Entry();
        await entry.init({
            owner: String(owner),
            type: 1,
            tokenAddress: undefined,
            tokenName: tokenName ? String(tokenName) : undefined,
            tokenSymbol: tokenSymbol ? String(tokenSymbol) : undefined,
            tokenDecimals: tokenDecimals ? Number(tokenDecimals) : undefined,
            icon: icon ? String(icon) : undefined,
            referralAddress: undefined
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
