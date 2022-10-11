const fs = require("fs");
const express = require('express');
const Spotify = require("spotify-finder");
const ytdl = require("ytdl-core");
const ytsr = require("ytsr");
const router = express.Router();

const client = new Spotify({
  consumer: {
    key: "d461ee71d7ff43728151abf6d42604b3",
    secret: "7d56885b77594f9b8654bb60e19fb45e"
  }
})

router.get('/', (req, res, next) => {
  const track = req.query.track;
  if (!track) res.sendStatus(400);

  client.getTrack(track).then(async (track) => {
    const name = track.name;
    const artist = track.artists[0].name;

    const result = await ytsr(`${name} ${artist} audio`, { limit: 1 });
    const url = result.items[0].url;

    const path = `${__dirname}/audio/${Date.now()}.mp3`;
    ytdl(url, { filter: "audioonly" }).pipe(fs.createWriteStream(path)).on("close", () => {
      res.download(path, `${name}.mp3`, (e) => {
        if (e) return console.log(e);

        fs.unlink(path, (err) => {
          if (err) return console.error(err);
        });
      });
    });
  })
});

module.exports = router;
