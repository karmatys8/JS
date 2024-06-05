/* eslint-disable prettier/prettier */
import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { UserController } from './user.controller';
import { SearchController } from './search.controller';
import { DataController } from './data.controller';
import { NotFoundMiddleware } from './not-found.middleware';

@Module({
  imports: [],
  controllers: [UserController, SearchController, DataController],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(NotFoundMiddleware)
      .exclude(
        { path: 'user/:id', method: RequestMethod.GET },
        { path: 'search', method: RequestMethod.GET },
        { path: 'data', method: RequestMethod.POST },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
