import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';
import  * as qrcode from 'qrcode'
import { JwtService } from '@nestjs/jwt';


@Controller('two-factor-authentication')
export class TwoFactorAuthenticationController {
    constructor(private readonly tfaService:TwoFactorAuthenticationService,
        private jwtService: JwtService,){}
    
    @Get('2fa/generate')
    @UseGuards(AuthGuard('jwt'))
    async generateQrCode(@Req() req)
    {
        const {uri, secret} = await this.tfaService.generateOtp(req.user.email);
        try {
            const qrcodeDataUrl = await qrcode.toDataURL(uri);
            return { qrcode: qrcodeDataUrl };
        } catch (error) {
            console.error('Error generating QR code:', error);
            throw new Error('Failed to generate QR code');
        }
    }
    
    @Post('2fa/verify')
    @UseGuards(AuthGuard('jwt'))
    async verifyQr(@Body() request: {code: string}, @Req() req, @Res() res)
    {
        const isValid = await this.tfaService.verifyCode(request.code, req.user.two_factor_secret_key);
            if(isValid)
                await this.tfaService.enableTwoFactor(req.user.email);
            res.send({success: isValid, message: isValid ? "Verified" : "Invalid 2Fa"});
    }

    @Post('2fa/confirm')
    @UseGuards(AuthGuard('jwt'))
    async confirm(@Body() request: {code: string}, @Req() req, @Res() res)
    {
        const isValid = await this.tfaService.verifyCode(request.code, req.user.two_factor_secret_key);
        if(!isValid)
            return res.send({success:false, message:"Invalid 2FA Code"});
        return res.send({success:true, message:`Welcome ${req.user.username}`});
    }

    @Post('2fa/disable')
    @UseGuards(AuthGuard('jwt'))
    async disable2Fa(@Req() req, @Res() res)
    {
        await this.tfaService.disable2fa(req.user.email);
        res.send({success: true, message:"2FA Authentication Disabled Successfuly"});
    }
}