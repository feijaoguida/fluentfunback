import { Injectable } from '@nestjs/common'
import { CreateTenantDto } from './dto/create-tenant.dto'
import { UpdateTenantDto } from './dto/update-tenant.dto'
import { Prisma, Tenant } from '@prisma/client'
import { PrismaService } from '@/prisma/prisma.service'
import { UserService } from '@/user/user.service'

@Injectable()
export class TenantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const slug = await this.findBySlug(createTenantDto.slug)

    if (slug) {
      throw new Error('Tenant already exists')
    }

    let user = await this.userService.findByEmail(createTenantDto.user.email)

    if (!user) {
      const dataUser = {
        ...createTenantDto.user,
      }

      const newUser = await this.userService.create(dataUser)

      user = { ...newUser, id: newUser.id }
    }

    if (user) {
      const data: Prisma.TenantCreateInput = {
        ...createTenantDto,
        user: {
          connect: {
            id: user.id,
          },
        },
      }
      const createdTenant = await this.prisma.tenant.create({ data })
      console.log('createdTenant', createdTenant)

      return createdTenant
    } else {
      throw new Error('User not created')
    }
  }

  findAll() {
    return this.prisma.tenant.findMany()
  }

  findById(id: string) {
    return this.prisma.tenant.findUnique({ where: { id } })
  }

  findBySlug(slug: string) {
    const tenant = this.prisma.tenant.findFirst({ where: { slug } })
    console.log('tenant', tenant)
    return tenant
  }

  update(id: number, updateTenantDto: UpdateTenantDto) {
    console.log('update', updateTenantDto)
    return `This action updates a #${id} tenant`
  }

  remove(id: number) {
    return `This action removes a #${id} tenant`
  }
}
