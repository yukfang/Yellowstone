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
    }

  ]
}