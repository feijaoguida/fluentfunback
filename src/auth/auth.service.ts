import * as bcrypt from 'bcrypt'
import { Injectable, NotFoundException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserService } from './../user/user.service'
import { UserToken } from './models/UserToken'
import { User } from '@/user/entities/user.entity'
import { UserPayload } from './models/UserPayload'
import { TenantService } from '@/tenant/tenant.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly UserService: UserService,
    private readonly tenantService: TenantService,
  ) {}

  async login(user: User, tenant: string): Promise<UserToken> {
    const { id, email, name } = user

    if (!tenant) {
      throw new NotFoundException('Tenant not found')
    }

    console.log('login', user, tenant)

    const payload: UserPayload = {
      sub: id,
      email: email,
      name: name,
    }

    const jwt_token = this.jwtService.sign(payload)

    const hasTenant = await this.validateTenantByUser(tenant, email)

    console.log('hasTenant', hasTenant)

    if (!hasTenant) {
      throw new NotFoundException('Tenant not found')
    }

    return {
      id,
      email,
      name,
      access_token: jwt_token,
    }
  }

  async validateTenantByUser(tenant: string, email: string): Promise<boolean> {
    const hasTenant = await this.tenantService.findBySlug(tenant)
    const user = await this.UserService.findByEmail(email)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    if (!hasTenant) {
      throw new NotFoundException('Tenant not found')
    }

    console.log('user', user)
    const tenantId = hasTenant?.id
    console.log('tenant', hasTenant)
    console.log('tenant', tenantId)

    return tenantId ? true : false
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.UserService.findByEmail(email)

    //TODO: validate tenant - email@fulano.com.br Abcd@123 [Function: verified]
    console.log('consts', email, password)

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (isPasswordValid) {
        return { ...user, password: undefined }
      }
    }
  }
}
