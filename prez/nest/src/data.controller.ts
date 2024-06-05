/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class DataController {
  @Post('data')
  postData(@Body() data: any, @Res() res: Response) {
    res.status(HttpStatus.OK).json({ receivedData: data });
  }
}
