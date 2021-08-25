import { Controller, Get, Render } from '@nestjs/common';
@Controller()
export class AppController {
  @Get('login')
  @Render('login')
  root() {
    return {
      title: 'Book Dictionary | Login',
      pageError: true,
      transparentNav: true,
    };
  }
}
