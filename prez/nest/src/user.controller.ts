/* eslint-disable prettier/prettier */
import { Controller, Get, Param, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Controller('user')
export class UserController {
  @Get(':id')
  getUser(@Param('id') id: string, @Res() res: Response) {
    res.status(HttpStatus.OK).send(`User ID: ${id}`);
  }
}
