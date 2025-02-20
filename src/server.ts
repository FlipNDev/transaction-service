import express from 'express';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

import { FlipN } from './flipN';

dotenv.config();    
const app = express();

// Swagger documentation
const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'FlipN API',
        version: '1.0.0',
        description: 'API for interacting with FlipN token operations'
    },
    components: {
        schemas: {
            FlipNParams: {
                type: 'object',
                required: ['owner', 'tokenName', 'tokenSymbol', 'tokenDecimals'],
                properties: {
                    owner: {
                        type: 'string',
                        description: 'Owner public key'
                    },
                    tokenName: {
                        type: 'string',
                        description: 'Token name'
                    },
                    tokenSymbol: {
                        type: 'string',
                        description: 'Token symbol'
                    },
                    tokenDecimals: {
                        type: 'number',
                        description: 'Token decimals'
                    },
                    icon: {
                        type: 'string',
                        description: 'Token icon URL'
                    },
                    referralAddress: {
                        type: 'string',
                        description: 'Referral address'
                    }
                }
            }
        }
    },
    paths: {
        '/buyToken': {
            get: {
                summary: 'Buy tokens',
                parameters: [
                    {
                        in: 'query',
                        name: 'owner',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'tokenName',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'tokenSymbol',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'tokenDecimals',
                        required: true,
                        schema: { type: 'number' }
                    },
                    {
                        in: 'query',
                        name: 'icon',
                        required: false,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'referralAddress',
                        required: false,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'outputAmount',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'maxWsolAmount',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    '200': {
                        description: 'Successful operation',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        transaction: {
                                            type: 'string'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/sellToken': {
            get: {
                summary: 'Sell tokens',
                parameters: [
                    {
                        in: 'query',
                        name: 'owner',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'tokenName',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'tokenSymbol',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'tokenDecimals',
                        required: true,
                        schema: { type: 'number' }
                    },
                    {
                        in: 'query',
                        name: 'icon',
                        required: false,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'referralAddress',
                        required: false,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'amount',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'minWsolAmount',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    '200': {
                        description: 'Successful operation',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        transaction: {
                                            type: 'string'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/prepaid': {
            get: {
                summary: 'Prepaid operation',
                parameters: [
                    {
                        in: 'query',
                        name: 'owner',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'tokenName',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'tokenSymbol',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'tokenDecimals',
                        required: true,
                        schema: { type: 'number' }
                    },
                    {
                        in: 'query',
                        name: 'icon',
                        required: false,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'referralAddress',
                        required: false,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'amount',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'isCreate',
                        required: true,
                        schema: { type: 'boolean' }
                    }
                ],
                responses: {
                    '200': {
                        description: 'Successful operation',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        transaction: {
                                            type: 'string'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/prepaidSolWithdraw': {
            get: {
                summary: 'Withdraw SOL from prepaid',
                parameters: [
                    {
                        in: 'query',
                        name: 'owner',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'tokenName',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'tokenSymbol',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'tokenDecimals',
                        required: true,
                        schema: { type: 'number' }
                    },
                    {
                        in: 'query',
                        name: 'icon',
                        required: false,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'referralAddress',
                        required: false,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    '200': {
                        description: 'Successful operation',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        transaction: {
                                            type: 'string'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/prepaidTokenWithdraw': {
            get: {
                summary: 'Withdraw token from prepaid',
                parameters: [
                    {
                        in: 'query',
                        name: 'owner',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'tokenName',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'tokenSymbol',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'tokenDecimals',
                        required: true,
                        schema: { type: 'number' }
                    },
                    {
                        in: 'query',
                        name: 'icon',
                        required: false,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'referralAddress',
                        required: false,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    '200': {
                        description: 'Successful operation',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        transaction: {
                                            type: 'string'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/createToken': {
            get: {
                summary: 'Create new token',
                parameters: [
                    {
                        in: 'query',
                        name: 'owner',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'tokenName',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'tokenSymbol',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'tokenDecimals',
                        required: true,
                        schema: { type: 'number' }
                    },
                    {
                        in: 'query',
                        name: 'icon',
                        required: false,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'referralAddress',
                        required: false,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'launching',
                        required: true,
                        schema: { type: 'boolean' }
                    },
                    {
                        in: 'query',
                        name: 'amount',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    '200': {
                        description: 'Successful operation',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        transaction: {
                                            type: 'string'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/checkPrePaid': {
            get: {
                summary: 'Check prepaid amount',
                parameters: [
                    {
                        in: 'query',
                        name: 'owner',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'tokenName',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'tokenSymbol',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'tokenDecimals',
                        required: true,
                        schema: { type: 'number' }
                    },
                    {
                        in: 'query',
                        name: 'icon',
                        required: false,
                        schema: { type: 'string' }
                    },
                    {
                        in: 'query',
                        name: 'referralAddress',
                        required: false,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    '200': {
                        description: 'Successful operation',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        amount: {
                                            type: 'string'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Helper function to create FlipN instance
function createFlipNInstance(params: {
    owner: string,
    tokenName: string,
    tokenSymbol: string,
    tokenDecimals: number,
    icon?: string,
    referralAddress?: string
}) {
    return new FlipN(params);
}

// Buy token route
app.get('/buyToken', async (req, res) => {
    try {
        const flipNParams = {
            owner: req.query.owner as string,
            tokenName: req.query.tokenName as string,
            tokenSymbol: req.query.tokenSymbol as string,
            tokenDecimals: Number(req.query.tokenDecimals),
            icon: req.query.icon as string,
            referralAddress: req.query.referralAddress as string
        };
        const flipN = createFlipNInstance(flipNParams);
        const result = await flipN.buyToken(
            req.query.outputAmount as string,
            req.query.maxWsolAmount as string
        );
        res.json({ transaction: result });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Sell token route
app.get('/sellToken', async (req, res) => {
    try {
        const flipNParams = {
            owner: req.query.owner as string,
            tokenName: req.query.tokenName as string,
            tokenSymbol: req.query.tokenSymbol as string,
            tokenDecimals: Number(req.query.tokenDecimals),
            icon: req.query.icon as string,
            referralAddress: req.query.referralAddress as string
        };
        const flipN = createFlipNInstance(flipNParams);
        const result = await flipN.sellToken(
            req.query.amount as string,
            req.query.minWsolAmount as string
        );
        res.json({ transaction: result });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Prepaid route
app.get('/prepaid', async (req, res) => {
    try {
        const flipNParams = {
            owner: req.query.owner as string,
            tokenName: req.query.tokenName as string,
            tokenSymbol: req.query.tokenSymbol as string,
            tokenDecimals: Number(req.query.tokenDecimals),
            icon: req.query.icon as string,
            referralAddress: req.query.referralAddress as string
        };
        const flipN = createFlipNInstance(flipNParams);
        const result = await flipN.prepaid(
            req.query.amount as string,
            req.query.isCreate === 'true'
        );
        res.json({ transaction: result });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Prepaid SOL withdraw route
app.get('/prepaidSolWithdraw', async (req, res) => {
    try {
        const flipNParams = {
            owner: req.query.owner as string,
            tokenName: req.query.tokenName as string,
            tokenSymbol: req.query.tokenSymbol as string,
            tokenDecimals: Number(req.query.tokenDecimals),
            icon: req.query.icon as string,
            referralAddress: req.query.referralAddress as string
        };
        const flipN = createFlipNInstance(flipNParams);
        const result = await flipN.prepaidSolWithdraw();
        res.json({ transaction: result });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Prepaid token withdraw route
app.get('/prepaidTokenWithdraw', async (req, res) => {
    try {
        const flipNParams = {
            owner: req.query.owner as string,
            tokenName: req.query.tokenName as string,
            tokenSymbol: req.query.tokenSymbol as string,
            tokenDecimals: Number(req.query.tokenDecimals),
            icon: req.query.icon as string,
            referralAddress: req.query.referralAddress as string
        };
        const flipN = createFlipNInstance(flipNParams);
        const result = await flipN.prepaidTokenWithdraw();
        res.json({ transaction: result });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Create token route
app.get('/createToken', async (req, res) => {
    try {
        const flipNParams = {
            owner: req.query.owner as string,
            tokenName: req.query.tokenName as string,
            tokenSymbol: req.query.tokenSymbol as string,
            tokenDecimals: Number(req.query.tokenDecimals),
            icon: req.query.icon as string,
            referralAddress: req.query.referralAddress as string
        };
        const flipN = createFlipNInstance(flipNParams);
        const result = await flipN.createToken(
            req.query.launching === 'true',
            Number(req.query.amount)
        );
        res.json({ transaction: result });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Check prepaid route
app.get('/checkPrePaid', async (req, res) => {
    try {
        const flipNParams = {
            owner: req.query.owner as string,
            tokenName: req.query.tokenName as string,
            tokenSymbol: req.query.tokenSymbol as string,
            tokenDecimals: Number(req.query.tokenDecimals),
            icon: req.query.icon as string,
            referralAddress: req.query.referralAddress as string
        };
        const flipN = createFlipNInstance(flipNParams);
        const result = await flipN.checkPrePaid();
        res.json({ amount: result });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
}); 

console.log(process.env.hello);