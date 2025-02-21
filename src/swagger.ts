export const swagger = {
    openapi: '3.0.0',
    info: {
        title: 'Token Trading API',
        version: '1.0.0',
        description: 'API documentation for token trading operations'
    },
    paths: {
        '/api/buy': {
            get: {
                tags: ['Token Operations'],
                summary: 'Buy tokens',
                parameters: [
                    {
                        name: 'owner',
                        in: 'query',
                        required: true,
                        schema: {
                            type: 'string'
                        },
                        description: 'Owner wallet address'
                    },
                    {
                        name: 'type',
                        in: 'query',
                        required: true,
                        schema: {
                            type: 'integer',
                            enum: [1, 2, 3]
                        },
                        description: 'Trading type: 1=FLIP_N, 2=PUMP, 3=JUPITER'
                    },
                    {
                        name: 'tokenAddress',
                        in: 'query',
                        required: true,
                        schema: {
                            type: 'string'
                        },
                        description: 'Token contract address'
                    },
                    {
                        name: 'referralAddress',
                        in: 'query',
                        schema: {
                            type: 'string'
                        },
                        description: 'Referral address (optional)'
                    },
                    {
                        name: 'params',
                        in: 'query',
                        required: true,
                        schema: {
                            type: 'string'
                        },
                        description: 'Trade qoute params by estimate'
                    }
                ],
                responses: {
                    '200': {
                        description: 'Successful transaction',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        txId: {
                                            type: 'string',
                                            description: 'Transaction ID'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    '400': {
                        description: 'Bad request',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        error: {
                                            type: 'string',
                                            description: 'Error message'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/sell': {
            get: {
                tags: ['Token Operations'],
                summary: 'Sell tokens',
                parameters: [
                    {
                        name: 'owner',
                        in: 'query',
                        required: true,
                        schema: {
                            type: 'string'
                        },
                        description: 'Owner wallet address'
                    },
                    {
                        name: 'type',
                        in: 'query',
                        required: true,
                        schema: {
                            type: 'integer',
                            enum: [1, 2, 3]
                        },
                        description: 'Trading type: 1=FLIP_N, 2=PUMP, 3=JUPITER'
                    },
                    {
                        name: 'tokenAddress',
                        in: 'query',
                        required: true,
                        schema: {
                            type: 'string'
                        },
                        description: 'Token contract address'
                    },
                    {
                        name: 'referralAddress',
                        in: 'query',
                        schema: {
                            type: 'string'
                        },
                        description: 'Referral address (optional)'
                    },
                    {
                        name: 'params',
                        in: 'query',
                        required: true,
                        schema: {
                            type: 'string'
                        },
                        description: 'Trade qoute params by estimate'
                    }
                ],
                responses: {
                    '200': {
                        description: 'Successful transaction',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        txId: {
                                            type: 'string',
                                            description: 'Transaction ID'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/estimate': {
            get: {
                tags: ['Token Operations'],
                summary: 'Estimate trade',
                parameters: [
                    {
                        name: 'owner',
                        in: 'query',
                        required: true,
                        schema: {
                            type: 'string'
                        },
                        description: 'Owner wallet address'
                    },
                    {
                        name: 'type',
                        in: 'query',
                        required: true,
                        schema: {
                            type: 'integer',
                            enum: [1, 2, 3]
                        },
                        description: 'Trading type: 1=FLIP_N, 2=PUMP, 3=JUPITER'
                    },
                    {
                        name: 'tokenAddress',
                        in: 'query',
                        required: true,
                        schema: {
                            type: 'string'
                        },
                        description: 'Token contract address'
                    },
                    {
                        name: 'inNumber',
                        in: 'query',
                        required: true,
                        schema: {
                            type: 'number'
                        },
                        description: 'Input amount'
                    },
                    {
                        name: 'inType',
                        in: 'query',
                        required: true,
                        schema: {
                            type: 'string',
                            enum: ['sol', 'token']
                        },
                        description: 'Input type (sol or token)'
                    },
                    {
                        name: 'slip',
                        in: 'query',
                        schema: {
                            type: 'number',
                            default: 0.03
                        },
                        description: 'Slippage tolerance'
                    }
                ],
                responses: {
                    '200': {
                        description: 'Successful estimation',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        estimateAmount: {
                                            type: 'number',
                                            description: 'Estimated amount'
                                        },
                                        quote: {
                                            type: 'object',
                                            description: 'Quote details'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/prepaid': {
            get: {
                tags: ['Token Operations'],
                summary: 'Prepaid operation',
                parameters: [
                    {
                        name: 'owner',
                        in: 'query',
                        required: true,
                        schema: {
                            type: 'string'
                        },
                        description: 'Owner wallet address'
                    },
                    {
                        name: 'tokenAddress',
                        in: 'query',
                        required: true,
                        schema: {
                            type: 'string'
                        },
                        description: 'Token contract address'
                    },
                    {
                        name: 'amount',
                        in: 'query',
                        required: true,
                        schema: {
                            type: 'number'
                        },
                        description: 'Amount to prepaid'
                    },
                  
                ],
                responses: {
                    '200': {
                        description: 'Successful operation',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        txId: {
                                            type: 'string',
                                            description: 'Transaction ID'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/prepaid/sol/withdraw': {
            get: {
                tags: ['Token Operations'],
                summary: 'Withdraw SOL prepaid',
                parameters: [
                    {
                        name: 'owner',
                        in: 'query',
                        required: true,
                        schema: {
                            type: 'string'
                        },
                        description: 'Owner wallet address'
                    },
                    {
                        name: 'tokenAddress',
                        in: 'query',
                        required: true,
                        schema: {
                            type: 'string'
                        },
                        description: 'Token contract address'
                    },
                ],
                responses: {
                    '200': {
                        description: 'Withdrawal successful',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        txId: {
                                            type: 'string',
                                            description: 'Transaction ID'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/prepaid/token/withdraw': {
            get: {
                tags: ['Token Operations'],
                summary: 'Withdraw token prepaid',
                parameters: [
                    {
                        name: 'owner',
                        in: 'query',
                        required: true,
                        schema: {
                            type: 'string'
                        },
                        description: 'Owner wallet address'
                    },
                    {
                        name: 'tokenAddress',
                        in: 'query',
                        required: true,
                        schema: {
                            type: 'string'
                        },
                        description: 'Token contract address'
                    },
                ],
                responses: {
                    '200': {
                        description: 'Withdrawal successful',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        txId: {
                                            type: 'string',
                                            description: 'Transaction ID'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/token/create': {
            get: {
                tags: ['Token Operations'],
                summary: 'Create token',
                parameters: [
                    {
                        name: 'owner',
                        in: 'query',
                        required: true,
                        schema: {
                            type: 'string'
                        },
                        description: 'Owner wallet address'
                    },
                    {
                        name: 'tokenName',
                        in: 'query',
                        schema: {
                            type: 'string'
                        },
                        description: 'Token name (optional)'
                    },
                    {
                        name: 'tokenSymbol',
                        in: 'query',
                        schema: {
                            type: 'string'
                        },
                        description: 'Token symbol (optional)'
                    },
                    {
                        name: 'tokenDecimals',
                        in: 'query',
                        schema: {
                            type: 'integer'
                        },
                        description: 'Token decimals (optional)'
                    },
                    {
                        name: 'icon',
                        in: 'query',
                        schema: {
                            type: 'string'
                        },
                        description: 'Token icon URL (optional)'
                    },
                    {
                        name: 'launching',
                        in: 'query',
                        schema: {
                            type: 'boolean',
                            default: false
                        },
                        description: 'Whether this is a launching operation'
                    },
                    {
                        name: 'amount',
                        in: 'query',
                        schema: {
                            type: 'number',
                            default: 0
                        },
                        description: 'Amount to prepaid'
                    }
                ],
                responses: {
                    '200': {
                        description: 'Creation successful',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        txId: {
                                            type: 'string',
                                            description: 'Transaction ID'
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