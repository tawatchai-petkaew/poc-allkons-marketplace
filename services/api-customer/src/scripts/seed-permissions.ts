// scripts/seed-permissions.ts
import { createConnection, ConnectionOptions } from 'typeorm';
import { configService } from '../config/config.service';
import { Permission } from '../model/permissions.entity';
import permissions from '../data/permissions';

async function run() {
  const opt = {
    ...configService.getTypeOrmConfig(),
    debug: true,
  };

  const connection = await createConnection(opt as ConnectionOptions);

  const permissionRepository = connection.getRepository(Permission);
  const existingPermissions = await permissionRepository.find();
  const existingPermissionCodes = existingPermissions.map(
    (permission) => permission.code,
  );

  const workPermissions = permissions.map(async (permissionData) => {
    if (existingPermissionCodes.includes(permissionData.code)) {
      console.log('Existing permission ->', permissionData.code);
      return null;
    } else {
      const permission = new Permission();
      permission.code = permissionData.code;
      permission.description = permissionData.description;
      permission.descriptionTh = permissionData.descriptionTh;
      permission.group = permissionData.group;
      permission.groupNameTh = permissionData.groupNameTh;

      return permissionRepository
        .save(permission)
        .then((r) => {
          console.log('Permission created ->', r.code);
          return r;
        })
        .catch((error) => {
          console.error(
            `Error creating permission ${permissionData.code}:`,
            error,
          );
          return null;
        });
    }
  });

  const results = await Promise.all(workPermissions);
  const createdCount = results.filter((result) => result !== null).length;
  const skippedCount = results.filter((result) => result === null).length;

  console.log(`\nPermission seeding completed:`);
  console.log(`- Created: ${createdCount} permissions`);
  console.log(`- Skipped: ${skippedCount} permissions (already exist)`);
  console.log(`- Total attempted: ${results.length} permissions`);

  await connection.close();
}

run()
  .then(() => console.log('Permissions seeding completed.'))
  .catch((error) => console.error('Seed error', error));
