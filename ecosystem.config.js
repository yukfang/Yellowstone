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


      // script  : "./void.js",
      watch   : true,
      name    : "datasync",
      instances  : 1
    }
  ]
}