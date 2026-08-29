import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger, } from "@nestjs/common";
import type { Request, Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {

    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: HttpException, host: ArgumentsHost) {
        const request = host.switchToHttp().getRequest<Request>()
        const response = host.switchToHttp().getResponse<Response>()
        const status = exception.getStatus()
        const message = exception.message

        const body = request.body;
        const params = request.params;
        const headers = request.headers;

        // 避免打印出敏感信息
        if (body || params) {
            const sensitiveFields = ['password', 'token', 'accessToken', 'refreshToken', 'oldPassword', 'newPassword'];
            sensitiveFields.forEach(f => {
                body && body[f] && (body[f] = '******');
                params && params[f] && (params[f] = '******');
            })
        }

        const fmtedRequest = `headers:${JSON.stringify(headers)};;;body:${body? JSON.stringify(body) : null};;;params:${params? JSON.stringify(params) : null}`
        this.logger.error(
            `${request.url}------------${fmtedRequest}`
        )

        response.status(status).json({
            code: status,
            data: message,
            message: 'failed'
        })

    }

}