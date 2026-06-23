import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
} from "@nestjs/swagger";
import { TeamService } from "./team.service";
import { CreateTeamMemberDto, UpdateTeamMemberDto } from "./dto/operations.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles, Tenant } from "../../common/decorators";
import { ROLES, TenantContext } from "@susuflow/shared";

@ApiTags("team")
@ApiBearerAuth()
@ApiHeader({ name: "x-tenant-slug", required: true })
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("team")
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Roles(ROLES.COMPANY_ADMIN, ROLES.ACCOUNT_OFFICER, ROLES.AUDITOR)
  @Get()
  @ApiOperation({ summary: "List organization team members" })
  list(@Tenant() tenant: TenantContext) {
    return this.teamService.listTeam(tenant.id);
  }

  @Roles(ROLES.COMPANY_ADMIN)
  @Post()
  @ApiOperation({
    summary: "Add a team member (collector, account officer, or auditor)",
  })
  create(@Tenant() tenant: TenantContext, @Body() dto: CreateTeamMemberDto) {
    return this.teamService.createTeamMember(tenant.id, dto);
  }

  @Roles(ROLES.COMPANY_ADMIN)
  @Patch(":id")
  @ApiOperation({ summary: "Update a team member status or profile" })
  update(
    @Tenant() tenant: TenantContext,
    @Param("id") id: string,
    @Body() dto: UpdateTeamMemberDto,
  ) {
    return this.teamService.updateTeamMember(tenant.id, id, dto);
  }
}
