module.exports = {
    apps: [{
      name: 'mezitouch',
      script: 'node_modules/.bin/next',
      args: 'start',
      instances: 'max',
      exec_mode: 'cluster',
      max_memory_restart: '512M'
    }]
  }