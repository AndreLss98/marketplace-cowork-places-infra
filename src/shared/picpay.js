const axios = require('axios');

const base_url = 'https://appws.picpay.com/ecommerce/public/payments';

const PICPAY_STATUS = {
    CREATED: 'created',
    EXPIRED: 'expired',
    ANALYSIS: 'analisys',
    PAID: 'paid',
    COMPLETED: 'completed',
    REFUNDED: 'refunded',
    CHARGEBACK: 'chargeback'
}

module.exports = {
    async createOrder(product, buyer) {
        return await axios({
            method: 'post',
            url: base_url,
            data: {
                referenceId: product.id,
                callbackUrl: "https://spotted-br.com/alugueis/checkout/callback", // Create a endpoint for callback
                returnUrl: "https://placeet.com",
                value: product.valor,
                buyer: {
                    firstName: buyer.nome,
                    lastName: buyer.sobrenome,
                    document: buyer.cpf,
                    email: buyer.email,
                    phone: buyer.numero_1
                }
            },
            headers: {
                "Content-Type": "application/json",
                "x-picpay-token": process.env.PIC_PAY_TOKEN,
                "accept-encoding": 'gzip,deflate,br'
            }
        }).then(async (response) => {
            return response.data;
        }).catch((error) => {
            throw error.data;
        });
    },
    async orderStatusUpdate(referenceId) {
        return await axios({
            method: 'get',
            url: `${base_url}/${referenceId}/status`,
            headers: {
                "Content-Type": "application/json",
                "x-picpay-token": process.env.PIC_PAY_TOKEN,
                "accept-encoding": 'gzip,deflate,br'
            }
        }).then(async (response) => {
            return response.data;
        }).catch(error => {
            throw error;
        });
    },
    async cancelOrder(referenceId, authorizationId) {
        const data = authorizationId ? { authorizationId } : {};
        await axios({
            method: 'post',
            url: `${base_url}/${referenceId}/cancellations`,
            data,
            headers: {
                "Content-Type": "application/json",
                "x-picpay-token": process.env.PIC_PAY_TOKEN,
                "accept-encoding": 'gzip,deflate,br'
            }
        }).then(async (response) => {
            return response.data;
        }).catch(error => {
            throw error.data;
        });
    }
}