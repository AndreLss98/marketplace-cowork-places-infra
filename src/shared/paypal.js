const axios = require('axios');

const Alugavel = require('./../repositorys/alugavel');

const url_oauth = 'https://api.sandbox.paypal.com/v1/oauth2/token';
const url_plans = 'https://api.sandbox.paypal.com/v1/billing/plans';
const url_products = 'https://api.sandbox.paypal.com/v1/catalogs/products';

const PAYPAL_PRODUCT_TYPE = {
    SERVICO: 'SERVICE',
    DIGITAL: 'DIGITAL',
    FISICO: 'PHYSICAL'
}

const PAYPAL_PRODUCT_CATEGORY = {
    RENTAL_PROPERTY_MANAGEMENT: 'RENTAL_PROPERTY_MANAGEMENT'
}

const PAYPAL_PLAN_STATUS = {
    CREATED: 'CREATED',
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE'
}

const PAYPAL_PLAN_INTERVAL_UNITS = {
    DAY: 'DAY',
    WEEK: 'WEEK',
    MONTH: 'MONTH',
    YEAR: 'YEAR'
}

const PAYPAL_PLAN_TENURE_TYPES = {
    REGULAR: 'REGULAR',
    TRIAL: 'TRIAL'
}

async function getAccessToken() {
    return await axios({
        method: 'POST',
        url: url_oauth,
        headers: {
            'Accept': 'application/json',
            'Accept-Language': 'en_US'
        },
        auth: {
            username: `${process.env.PAYPAL_CLIENT_ID}`,
            password: `${process.env.PAYPAL_CLIENT_SECRET}`
        },
        data: "grant_type=client_credentials"
    }).then(response => {
        return response.data;
    }).catch(error => {
        console.log('Error: ', error);
        throw error;
    });
}

module.exports = {
    async createProduct(product, image_url, description) {
        let authorization;
        try {
            authorization = await getAccessToken();
        } catch(error) {
            throw error;
        }
        return await axios({
            method: 'POST',
            url: url_products,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authorization.access_token}`
            },
            data: {
                name: product.titulo,
                description,
                type: PAYPAL_PRODUCT_TYPE.SERVICO,
                category: PAYPAL_PRODUCT_CATEGORY.RENTAL_PROPERTY_MANAGEMENT,
                image_url: `https://spotted-br.com/imgs/${image_url}`,
                home_url: `https://placeet.com/spaces/${product.id}`
            }
        }).then(async (response) => {
            response = response.data;
            return await Alugavel.update(product.id, {paypal_id: response.id});
        }).catch((error) => {
            console.log('Paypal error: ', error);
            throw error.data;
        });
    },
    async createPlan(product, qtd_month, value) {
        let authorization;
        try {
            authorization = await getAccessToken();
            console.log('Token: ', authorization);
        } catch(error) {
            console.log('Erro no token: ', error);
            throw error;
        }

        return await axios({
            method: 'POST',
            url: url_plans,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authorization.access_token}`
            },
            data: {
                product_id: product.paypal_id,
                name: `Reserva de ${product.titulo}`,
                status: PAYPAL_PLAN_STATUS.ACTIVE,
                billing_cycles: [
                    {
                        frequency: {
                            interval_unit: PAYPAL_PLAN_INTERVAL_UNITS.MONTH,
                            interval_count: 1
                        },
                        tenure_type: PAYPAL_PLAN_TENURE_TYPES.REGULAR,
                        sequence: 1,
                        total_cycles: qtd_month,
                        pricing_scheme: {
                            fixed_price: {
                                value: value/qtd_month,
                                currency_code: "BRL"
                            }
                        }
                    }
                ],
                payment_preferences: {
                    auto_bill_outstanding: true,
                    setup_fee_failure_action: 'CANCEL',
                    payment_failure_threshold: 0
                }
            }
        }).then(response => {
            return response.data;
        }).catch(error => {
            throw error.data;
        });
    }
}