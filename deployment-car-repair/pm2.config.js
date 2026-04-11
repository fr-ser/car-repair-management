module.exports = {
  apps: [
    {
      interpreter: '/home/pi/.nvm/versions/node/v22.22.2/bin/node',
      name: 'car-repair',
      script: './dist/main.js',
      cwd: '../car-repair/',
      error_file: '~/apps/car-repair/app.log',
      out_file: '~/apps/car-repair/app.log',
    },
  ],
};
