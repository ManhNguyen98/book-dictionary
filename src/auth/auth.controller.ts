import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import JwtRefreshGuard from './guards/jwt-refresh.guard';
import { LocalAuthenticationGuard } from './guards/local-authentication.guard';
import RequestWithUser from './types/requestWithUser.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  refresh(@Req() req: RequestWithUser) {
    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
      req.user.id,
    );

    req.res.setHeader('Set-Cookie', accessTokenCookie);
    return req.user;
  }

  @Post('register')
  async register(@Body() registrationData: RegisterDto) {
    return this.authService.register(registrationData);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthenticationGuard)
  @Post('login')
  async login(@Req() req: RequestWithUser, @Res() res: Response) {
    try {
      const { user } = req;
      const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
        user.id,
      );
      const { cookie: refreshTokenCookie, token: refreshToken } =
        this.authService.getCookieWithJwtRefreshToken(user.id);
      await this.usersService.setCurrentRefreshToken(refreshToken, user.id);
      res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
    } catch (error) {
      console.error('[Login Error] ', error);
    } finally {
      return res.redirect('/books');
    }
  }

  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  async logout(@Req() req: RequestWithUser, @Res() res: Response) {
    await this.usersService.removeRefreshToken(req.user.id);
    res.setHeader('Set-Cookie', this.authService.getCookieForLogout());
    return res.redirect('/login');
  }

  @UseGuards(JwtRefreshGuard)
  @Get()
  authenticate(@Req() req: RequestWithUser) {
    const user = req.user;
    return user;
  }
}
