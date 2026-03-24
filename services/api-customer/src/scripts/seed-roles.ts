// scripts/seed-roles.ts
import { createConnection, ConnectionOptions } from 'typeorm';
import { configService } from '../config/config.service';
import { Role } from '../model/roles.entity';

interface RoleData {
  name: string;
  displayName: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  isClone?: boolean;
  priority: number;
}

const roles: RoleData[] = [
  {
    name: 'OWNER',
    displayName: 'Owner',
    description: 'Full access to all features',
    isActive: true,
    isDefault: true,
    isClone: false,
    priority: 1, // Highest priority
  },
  {
    name: 'SUPER_ADMIN',
    displayName: 'Super Admin',
    description:
      'Access to most system features except critical organization settings',
    isActive: true,
    isDefault: true,
    isClone: false,
    priority: 2,
  },
  {
    name: 'ADMIN',
    displayName: 'Admin',
    description: 'Access to common administrative features',
    isActive: true,
    isDefault: true,
    isClone: true,
    priority: 3,
  },
  {
    name: 'MEMBER',
    displayName: 'Member',
    description: 'Regular member access with limited permissions',
    isActive: true,
    isDefault: true,
    isClone: true,
    priority: 4, // Lowest priority
  },
];

async function run() {
  const opt = {
    ...configService.getTypeOrmConfig(),
    debug: true,
  };

  const connection = await createConnection(opt as ConnectionOptions);

  const roleRepository = connection.getRepository(Role);
  const existingRoles = await roleRepository.find({
    where: { organizeId: null }, // System default roles
  });

  const existingRoleNames = existingRoles.map((role) => role.name);

  const workRoles = roles.map(async (roleData) => {
    if (existingRoleNames.includes(roleData.name)) {
      console.log('Existing role ->', roleData.name);

      // Update existing role
      const existingRole = existingRoles.find((r) => r.name === roleData.name);
      if (existingRole) {
        existingRole.displayName = roleData.displayName;
        existingRole.isActive = roleData.isActive;
        existingRole.isDefault = roleData.isDefault;
        existingRole.priority = roleData.priority;
        if (roleData.isClone !== undefined) {
          existingRole.isClone = roleData.isClone;
        }

        return roleRepository
          .save(existingRole)
          .then((r) => {
            console.log('Role updated ->', r.name);
            return r;
          })
          .catch((error) => {
            console.error(`Error updating role ${roleData.name}:`, error);
            return null;
          });
      }
      return null;
    } else {
      const role = new Role();
      role.name = roleData.name;
      role.displayName = roleData.displayName;
      role.isActive = roleData.isActive;
      role.isDefault = roleData.isDefault;
      role.priority = roleData.priority;
      if (roleData.isClone !== undefined) {
        role.isClone = roleData.isClone;
      }
      // organizeId is null for system default roles
      role.organizeId = null;

      return roleRepository
        .save(role)
        .then((r) => {
          console.log('Role created ->', r.name);
          return r;
        })
        .catch((error) => {
          console.error(`Error creating role ${roleData.name}:`, error);
          return null;
        });
    }
  });

  const results = await Promise.all(workRoles);
  const processedCount = results.filter((result) => result !== null).length;
  const skippedCount = results.filter((result) => result === null).length;

  console.log(`\nRole seeding completed:`);
  console.log(`- Processed: ${processedCount} roles`);
  console.log(`- Skipped: ${skippedCount} roles`);
  console.log(`- Total attempted: ${results.length} roles`);

  await connection.close();
}

run()
  .then(() => console.log('Roles seeding completed.'))
  .catch((error) => console.error('Seed error', error));
