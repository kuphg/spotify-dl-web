// import zip from "adm-zip";
import { Router } from "express";
import { getTrack, getAlbum, getPlaylist, Track, Playlist } from "../util/Info";
import { downloadTrack, downloadPlaylist } from "../util/Download";

function error(msg: unknown) {

  return {
    success: false,
    message: msg,
    code: 400
  }
}

const router = Router();
router.get("/track/:trackId", async (req, res, next) => {
  const trackId = req.params.trackId;
  if (trackId === undefined) return res.json(error("Param trackId not provided"));

  const track = await getTrack(trackId);
  if (track.data) {
    const result = await downloadTrack(track.data as Track, "./temp");
    res.download(result[0].filename);
    console.log(result)
  } else {
    res.json(error(track.message));
  }
});

router.get("/album/:albumId", async (req, res, next) => {
  const albumId = req.params.albumId;
  if (albumId === undefined) return res.json(error("Param albumId not provided"));

  const album = await getAlbum(albumId);
  if (album.data) {
    console.log(album.data)
  } else {
    res.json(error(album.message));
  }
})

router.get("/playlist/:playlistId", async (req, res, next) => {
  const playlistId = req.params.playlistId;
  if (playlistId === undefined) return res.json(error("Param playlistId not provided"));

  const playlist = await getPlaylist(playlistId);
  if (playlist.data) {
    downloadPlaylist(playlist.data as Playlist, "./temp")
  } else {
    res.json(error(playlist.message));
  }
})

export default router;