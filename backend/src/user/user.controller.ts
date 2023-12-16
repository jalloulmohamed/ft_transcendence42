/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param,  Post,  Req,  Res,  UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
// import { JwtService } from '@nestjs/jwt';
// import { PrismaService } from 'prisma/prisma.service';
// import { whichWithAuthenticated } from './utils/auth-utils';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from 'prisma/prisma.service';
@Controller('user')
export class UserController {

    constructor(private readonly userService:UserService,
      private readonly prisma:PrismaService){}

    @Get('info')
    @UseGuards(AuthGuard('jwt'))
    async grabMyInfos(@Req() req) {
      
     const user = req.user

      return {
        username: user.username,
        email : user.email,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        tfa_enabled:user.tfa_enabled
      };
    }

    @Get('finduser/:username')
    @UseGuards(AuthGuard('jwt'))
    findUser(@Param('username')username:string)
    {
        return this.userService.findUser(username);
    }

    @Post('changedisplayname')
    @UseGuards(AuthGuard('jwt'))
    async displayedName(@Body() request:{newDisplayName: string}, @Req() req , @Res() res){
      try {
        const user = req.user;
        const updated = await this.userService.changeDisplayedName(user.email, request.newDisplayName);
        return res.status(200).json({ success: true, response: updated});
      }catch(error){
        // throw new Error('Failed to update the displayed name');
          return res.status(401).json({ success: false, message: error.message || 'An unexpected error occurred' });

      }
    }

    @Post('changeusername')
    @UseGuards(AuthGuard('jwt'))
    async changeUserName(@Body() request: {newUserName : string}, @Req() req, @Res() res){
      try {
        const user = req.user
        const updated = await this.userService.changeUserName(user.email, req.newUserName);
        return res.status(200).json({ success: true, response: updated});
      }catch(error){
        return res.status(401).json({ success: false, message: error.message || 'An unexpected error occurred' });
      }
    }


    // @Post('changeAvatar')
    // @UseGuards(AuthGuard('jwt'))
    // @UseInterceptors(FileInterceptor('file', {
    //   storage: diskStorage({
    //     destination: 'src/uploads',
    //     filename: (req, file, callback) => {
    //       const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
    //       const extension: string = path.parse(file.originalname).ext;
    //       callback(null, `${filename}${extension}`);
    //     },
    //   }),
    //   fileFilter: (req, file, _callback) => {
    //     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    //       _callback(null, true);//accept that type
    //     }
    //     else {
    //       _callback(new UnauthorizedException('Only JPEG and PNG files are allowed'), false); // refuse somthing else like .pdf ...etc
    //     }
    //   },
    //   limits: {
    //     fileSize: 1024 * 1024, // still don't know why this don't work !!!!!!!!! figure it out !
    //   },
    // }))
    // async changeAvatar(@Req() req, @UploadedFile() file: Express.Multer.File)
    // {
    //   try {
    //    const user = req.user
    //     const imagePath = file.path;
    //     const updatedAvatar = this.userService._changeAvatar(user.email, imagePath);
    //     return updatedAvatar;
    //   } catch (error) {
    //     throw new Error('Failed to update the Avatar');
    //   }
    // }
    
    @Post('changePhoto')
    @UseGuards(AuthGuard('jwt'))
    async changePhoto(@Req() req, @Res() res, @Body() request: {avatar: string})
    {
      const user = req.user;
      await this.prisma.user.update({where:{email: user.email}, data: {avatar_url: request.avatar}});
      res.send({success:true, message:"avatar uploaded succesfully"});
    }

    @Get('my-friends')
    @UseGuards(AuthGuard('jwt'))
    async listFriends(@Req() req)
    {
     const user = req.user
      return await this.userService.listFriends(user.id);
    }

    @Get('pending-requests')
    @UseGuards(AuthGuard('jwt'))
    async pendingRequests(@Req() req)
    {
     const user = req.user
      return await this.userService.pendingRequests(user.id);
    }

    @Get('blocked-friends')
    @UseGuards(AuthGuard('jwt'))
    async blockedFriends(@Req() req)
    {     
     const user = req.user
      return await this.userService.blockedFriends(user.id);
    }
    @Get('All-users')
    @UseGuards(AuthGuard('jwt'))
    async allUsers(@Req() req)
    {
     const user = req.user
      return await this.userService.allUsers(user.id);
    }
    @Post('search')
    async searchUsers(@Body() request: {displayName : string}) {
      const test = this.userService.findByDisplayNameSearching(request.displayName);
      return test;
  }
  @Get('table-friends')
  @UseGuards(AuthGuard('jwt'))
    async allFriend(@Req() req){
      const user = req.user;
      return await this.userService.allFriendsRequest(user.id);

    }
    @Post('table_friends_id')
    @UseGuards(AuthGuard('jwt'))

    async allFriendsId(@Body() request: {id_user : string}){
      return await this.userService.allFriendsId(request.id_user);

    }

    @Post('get_user')
    @UseGuards(AuthGuard('jwt'))
    async getUserId(@Body() request: {id_user : string}){
      const user =  await this.userService.userInfo(request.id_user);
      return user;

    }
     
    
}

