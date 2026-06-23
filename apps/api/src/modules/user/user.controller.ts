import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserProfileDto, UpdateUserPasswordDto } from './dto/user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';
import { AuthenticatedUser } from '@susuflow/shared';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.findById(user.id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile details' })
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateUserProfileDto,
  ) {
    return this.userService.updateProfile(user.id, dto);
  }

  @Put('me/password')
  @ApiOperation({ summary: 'Update current user password' })
  updatePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateUserPasswordDto,
  ) {
    return this.userService.updatePassword(user.id, dto);
  }
}
