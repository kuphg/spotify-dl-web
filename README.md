# spotify-dl-web
A web server server that gets download links for spotify tracks using youtube.

Change `process.env.key` and `process.env.secret` to the ones you got from the [spotify dashboard](https://developer.spotify.com/dashboard/applications).
### Usage:
Route: **`/id`**\
  Query:\
  `track` - ID of the track to download\
  `album` - ID of the album to download (not implemented)
