/* eslint-disable prettier/prettier */
import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Controller('search')
export class SearchController {
  @Get()
  search(@Query('q') q: string, @Res() res: Response) {
    if (!q) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: "Missing query parameter 'q'" });
    } else {
      res.status(HttpStatus.OK).send(`Search query: ${q}`);
    }
  }
}
