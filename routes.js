const fs = require("fs");
const express = require('express');
const Spotify = require("spotify-finder");
const ytdl = require("ytdl-core");
const ytsr = require("ytsr");

const router = express.Router();
require("dotenv").config();

const client = new Spotify({
  consumer: {
    key: process.env.key,
    secret: process.env.secret
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
