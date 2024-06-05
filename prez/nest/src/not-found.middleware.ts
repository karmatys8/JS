/* eslint-disable prettier/prettier */
import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class NotFoundMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.status(HttpStatus.NOT_FOUND).send('404: Page Not Found');
  }
}
