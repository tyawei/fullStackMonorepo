import { CallHandler, ExecutionContext, Logger, NestInterceptor } from "@nestjs/common";
import { Observable, map, tap, catchError, throwError } from "rxjs";
import type { Response, Request } from 'express'

export class LoggingAndFmtResInterceptor implements NestInterceptor {

    private readonly logger = new Logger(LoggingAndFmtResInterceptor.name)

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const response = context.switchToHttp().getResponse<Response>()
        const request = context.switchToHttp().getResponse<Request>()

        const headers = request.headers
        delete headers.authorization;

        const body = request.body        
        const sensitiveFields = ['password', 'token', 'accessToken', 'refreshToken', 'oldPassword', 'newPassword'];
        sensitiveFields.forEach(f => {body[f] = '******'})

        return next.handle().pipe(
            map(data => {
                return {
                    code: response.statusCode,
                    data,
                    message: 'success'
                }
            }),
            tap(data => {
                this.logger.log(`\n${request.url}---------`+JSON.stringify({
                    headers,
                    request: {
                        method: request.method,
                        url: request.url,
                        originUrl: request.originalUrl,
                        body,
                        params: request.params,
                        query: request.query
                    },
                    response: {
                        ...data, // code data message
                        // statusCode: response.statusCode
                    }
                }))
            }),
            catchError(err => {
                this.logger.error(
                    `${request.url}-----${JSON.stringify(err)}`
                )
                return throwError(() => err)
            })
        )

    }

}