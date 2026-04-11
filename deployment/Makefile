update:
	cp -r ~/apps/car-repair/node_modules ~/apps/next-car-repair
	cp ~/apps/car-repair/production.db ~/apps/next-car-repair
	cd ~/apps/next-car-repair && yarn install --production --frozen-lockfile

	pm2 kill
	cp ~/apps/car-repair/.env ~/apps/next-car-repair

	rm -rf ~/apps/backup-car-repair
	mv ~/apps/car-repair ~/apps/backup-car-repair
	mv ~/apps/next-car-repair ~/apps/car-repair

	pm2 start ~/apps/deployment/pm2.config.js
	pm2 save

revert:
	rm -rf ~/apps/next-car-repair
	mv ~/apps/car-repair ~/apps/next-car-repair
	mv ~/apps/backup-car-repair ~/apps/car-repair

	pm2 kill
	pm2 start ~/apps/deployment/pm2.config.js
	pm2 save
