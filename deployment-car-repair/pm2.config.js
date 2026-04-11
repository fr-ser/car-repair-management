const logFile = `${process.env.HOME}/apps/car-repair/app.log`;

module.exports = {
  apps: [
    {
      interpreter: '/home/pi/.nvm/versions/node/v22.22.2/bin/node',
      name: 'car-repair',
      script: './dist/main.js',
      cwd: '../car-repair/',
      error_file: logFile,
      out_file: logFile,
    },
  ],
};
