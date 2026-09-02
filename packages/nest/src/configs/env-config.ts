import * as Joi from 'joi'

const envConfigObj = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production').default('development'),

    // # 本地服务端口
    PORT: Joi.number(),

    // # postgres 数据库
    DB_TYPE: Joi.string().valid('postgres', 'mysql').default('postgres'),
    DB_URL: Joi.string(),
    // docker postgres 镜像默认的参数名
    POSTGRES_USER: Joi.string(),
    POSTGRES_PASSWORD: Joi.string(),
    POSTGRES_HOST: Joi.string(),
    POSTGRES_PORT: Joi.number(),
    POSTGRES_DB: Joi.string(),

    // # 暂时写这些
    JWT_SECRET: Joi.string(),
    ACCESS_TOKEN_EXPIRES: Joi.string(),
    JWT_FRESH_SECRET: Joi.string(),
    FRESH_TOKEN_EXPIRES: Joi.string(),
    COOKIE_SECRET: Joi.string(),

    RSA_PRIVATE_KEY_PATH: Joi.string(),

    ACCOUNTS: Joi.string(),
    PASSWORDS: Joi.string(),
})

export default envConfigObj