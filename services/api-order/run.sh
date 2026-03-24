node dist/scripts/write-type-orm-config.js
# yarn typeorm migration:run
# yarn start:dev:db:seed:permissions
# yarn start:dev:db:seed:role-permissions
node --max-old-space-size=256 dist/main
# yarn pretypeorm
# yarn typeorm migration:run
# node --max-old-space-size=4096 dist/main