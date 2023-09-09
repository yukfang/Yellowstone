module.exports = {
  apps : [
    {
      "ignore_watch" : [
          "LocalCache"
      ],
      "watch_options": {
        "followSymlinks": false,
      },


      script  : "./index.js",
      watch   : true,
      name    : "ystracker",
      instances  : 1
    },
    {
      "ignore_watch" : [
          "LocalCache"
      ],
      "watch_options": {
        "followSymlinks": false,
      },

      script  : "./syncJob.js",
      watch   : true,
      name    : "syncjob",
      instances  : 1
    },
  ]
}