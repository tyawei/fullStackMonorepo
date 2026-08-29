import * as Joi from 'joi'

const envConfigObj = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production').default('development'),

    // # 本地服务端口
    PORT: Joi.number(),

    // # postgres 数据库
    DB_TYPE: Joi.string().valid('postgres', 'mysql').default('postgres'),
    DB_URL: Joi.string(),
    PG_USER: Joi.string(),
    PG_PASSWORD: Joi.string(),
    PG_HOST: Joi.string(),
    PG_PORT: Joi.number(),
    PG_DATABASE: Joi.string(),

    // # 暂时写这些
    JWT_SECRET: Joi.string(),
    ACCESS_TOKEN_EXPIRES: Joi.string(),
    JWT_FRESH_SECRET: Joi.string(),
    FRESH_TOKEN_EXPIRES: Joi.string(),
    COOKIE_SECRET: Joi.string(),

    RSA_PRIVATE_KEY_PATH: Joi.string(),
})

export default envConfigObj