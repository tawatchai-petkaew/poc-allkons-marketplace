// scripts/seed-role-permissions.ts
import { createConnection, ConnectionOptions } from 'typeorm';
import { configService } from '../config/config.service';
import { Role } from '../model/roles.entity';
import { Permission } from '../model/permissions.entity';
import { RolePermissions } from '../model/role_permissions.entity';
import roles from '../data/roles';

async function run() {
  const opt = {
    ...configService.getTypeOrmConfig(),
    debug: true,
  };

  const connection = await createConnection(opt as ConnectionOptions);

  const roleRepository = connection.getRepository(Role);
  const permissionRepository = connection.getRepository(Permission);
  const rolePermissionsRepository = connection.getRepository(RolePermissions);

  // Get all existing permissions
  const allPermissions = await permissionRepository.find();
  console.log(`Found ${allPermissions.length} permissions in database`);

  const permissionsByCode = allPermissions.reduce((acc, permission) => {
    acc[permission.code] = permission;
    return acc;
  }, {} as Record<string, Permission>);

  // Get all existing roles
  const existingRoles = await roleRepository.find({
    where: { organizeId: null }, // System default roles
  });
  console.log(`Found ${existingRoles.length} system roles in database`);

  const roleByName = existingRoles.reduce((acc, role) => {
    acc[role.name] = role;
    return acc;
  }, {} as Record<string, Role>);

  // Process each role from data file
  let totalPermissionsAssigned = 0;

  for (const roleData of roles) {
    const role = roleByName[roleData.name];

    if (!role) {
      console.log(`Role ${roleData.name} not found in database. Skipping.`);
      continue;
    }

    console.log(`\nProcessing role: ${role.displayName} (${role.name})`);

    // Get existing permissions for this role
    const existingRolePermissions = await rolePermissionsRepository.find({
      where: { roleId: role.id },
    });

    const existingPermissionIds = existingRolePermissions.map(
      (rp) => rp.permissionId,
    );
    console.log(
      `Role already has ${existingPermissionIds.length} permissions assigned`,
    );

    // Ask if we should remove existing permissions
    let shouldRemoveExisting = true; // Set to true to replace all permissions

    if (shouldRemoveExisting && existingRolePermissions.length > 0) {
      console.log(
        `Removing ${existingRolePermissions.length} existing permissions from role ${role.displayName}`,
      );

      // Delete existing role permissions
      await rolePermissionsRepository.remove(existingRolePermissions);
      console.log(`Removed existing permissions for role ${role.displayName}`);
    }

    // Determine permissions to assign
    const permissionsToAssign: Permission[] = [];

    // Special case for roles with ALL_PERMISSIONS flag
    if (roleData.permissionCodes.includes('ALL_PERMISSIONS')) {
      permissionsToAssign.push(...allPermissions);
      console.log(
        `Will assign ALL ${allPermissions.length} permissions to role ${role.displayName}`,
      );
    } else {
      // Assign specific permissions
      let validPermissionCount = 0;
      let invalidPermissionCount = 0;

      for (const code of roleData.permissionCodes) {
        if (permissionsByCode[code]) {
          permissionsToAssign.push(permissionsByCode[code]);
          validPermissionCount++;
        } else {
          console.warn(
            `Permission with code "${code}" not found in database. Skipping.`,
          );
          invalidPermissionCount++;
        }
      }

      console.log(
        `Will assign ${validPermissionCount} permissions to role ${role.displayName}`,
      );
      if (invalidPermissionCount > 0) {
        console.log(
          `Found ${invalidPermissionCount} invalid permission codes for role ${role.displayName}`,
        );
      }
    }

    // Create role-permission relationships
    const rolePermissionPromises = permissionsToAssign.map((permission) => {
      const rolePermission = new RolePermissions();
      rolePermission.roleId = role.id;
      rolePermission.permissionId = permission.id;

      return rolePermissionsRepository.save(rolePermission).catch((error) => {
        console.error(
          `Error assigning permission ${permission.code} to role ${role.displayName}:`,
          error.message,
        );
        return null;
      });
    });

    const results = await Promise.all(rolePermissionPromises);
    const successCount = results.filter((result) => result !== null).length;

    console.log(
      `Successfully assigned ${successCount} permissions to role ${role.displayName}`,
    );
    totalPermissionsAssigned += successCount;
  }

  console.log(`\nRole permissions seeding completed successfully!`);
  console.log(`Total permissions assigned: ${totalPermissionsAssigned}`);

  await connection.close();
}

run()
  .then(() => console.log('Role permissions seeding process finished.'))
  .catch((error) => console.error('Seed error', error));
