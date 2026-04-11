export PATH := /home/pi/.nvm/versions/node/v22.22.2/bin:$(PATH)

update:
	# Hardlink node_modules from the current install instead of copying — near-instant, no extra disk usage.
	# Falls back silently (-) if car-repair does not exist yet (first deploy).
	-cp -rl ~/apps/car-repair/node_modules ~/apps/next-car-repair
	# Only run yarn install when the lockfile changed; skips the slow linking step on code-only deploys.
	-if ! diff -q ~/apps/car-repair/yarn.lock ~/apps/next-car-repair/yarn.lock > /dev/null 2>&1; then \
		cd ~/apps/next-car-repair && yarn install --production --frozen-lockfile; \
	fi
	rm -rf ~/apps/backup-car-repair
	-mv ~/apps/car-repair ~/apps/backup-car-repair
	# Carry over secrets and database from the previous install.
	-cp ~/apps/backup-car-repair/.env ~/apps/next-car-repair
	-cp ~/apps/backup-car-repair/production.db ~/apps/next-car-repair
	mv ~/apps/next-car-repair ~/apps/car-repair
	pm2 startOrRestart ~/apps/deployment-car-repair/pm2.config.js
	pm2 save

revert:
	rm -rf ~/apps/next-car-repair
	-mv ~/apps/car-repair ~/apps/next-car-repair
	mv ~/apps/backup-car-repair ~/apps/car-repair
	pm2 startOrRestart ~/apps/deployment-car-repair/pm2.config.js
	pm2 save
