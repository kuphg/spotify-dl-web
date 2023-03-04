import type { Track, Playlist } from "./Info";
import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ytdl from "ytdl-core";
import axios from "axios";
import NodeID3 from "node-id3";

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

interface Results {
  status: 'Success' | 'Failed (stream)' | 'Failed (tags)';
  filename: string;
  id?: string;
  tags?: object;
}

function coreDownloadTrack(id: string, filename: string): Promise<boolean> {
  return new Promise((res, rej) => {
    ffmpeg(ytdl(id, { quality: 'highestaudio', filter: 'audioonly' }))
    .audioBitrate(128)
    .save(filename)
    .on('error', (err: any) => {
      console.error(`Failed to write file (${filename}): ${err}`)
      fs.unlinkSync(filename)
      rej(false);
    })
    .on('end', () => {
      res(true);
    })
  })
}

const checkPath = (p: string) => {
  p = path.resolve(p);
  if (!fs.existsSync(p)) {
    throw Error(`Filepath:(${p}) doesn't exist, please specify absolute path`)
  } else if (p.slice(-1) != '/') {
    return `${p}/`
  }
  console.log(p)
  return p;
}

/**
 * Download the Spotify Track, need a <Track> type for first param, the second param is optional
 * @param {Track} obj An object of type <Track>, contains Track details and info
 * @param {string} outputPath - String type, (optional) if not specified the output will be on the current dir
 * @returns {Results[]} <Results[]> if successful, `string` if failed
 */
 export const downloadTrack = async (obj: Track, outputPath: string = './'): Promise<Results[]> => {
  try {
    const albCover = await axios.get(obj.albumCoverURL, { responseType: 'arraybuffer' })
    const tags: any = {
      title: obj.title,
      artist: obj.artist,
      album: obj.album,
      year: obj.year,
      trackNumber: obj.trackNumber,
      image: {
        imageBuffer: Buffer.from(albCover.data, 'utf-8')
      }
    }

    let filename = `${checkPath(outputPath)}${obj.title}.mp3`;
    let dlt = await coreDownloadTrack(obj.id, filename);
    if (dlt) {
      let tagStatus = NodeID3.update(tags, filename)
      if (tagStatus) return [{ status: 'Success', filename: filename }]
      else return [{ status: 'Failed (tags)', filename: filename, tags: tags }]
    } else {
      return [{ status: 'Failed (stream)', filename: filename, id: obj.id, tags: tags }]
    }
  } catch (err: any) {
    throw `Caught: ${err}`
  }
}

/**
 * Download the Spotify Playlist, need a <Playlist> type for first param, the second param is optional
 * @param {Playlist} obj An object of type <Playlist>, contains Playlist details and info
 * @param {string} outputPath - String type, (optional) if not specified the output will be on the current dir
 * @returns {Results[]} <Results[]> if successful, `string` if failed
 */
 export const downloadPlaylist = async (obj: Playlist, outputPath: string = './'): Promise<Results[]> => {
  try {

    const now = Date.now();
    const path = `${checkPath(outputPath)}/${now}`;
    fs.mkdirSync(path);

    console.log(obj)
    for (const track of obj.tracks) {
      console.log(track.title);
      if (!track.id) continue;
      const albCover = await axios.get(track.coverUrl, { responseType: 'arraybuffer' })
      const tags: any = {
        title: track.title,
        artist: track.artist,
        year: track.year,
        image: {
          imageBuffer: Buffer.from(albCover.data, 'utf-8')
        }
      }

      let filename = `${path}/${track.title}.mp3`;
      let dlt = await coreDownloadTrack(track.id, filename);

      if (dlt) {
        let tagStatus = NodeID3.update(tags, filename)
        if (tagStatus) return [{ status: 'Success', filename: filename }]
        else return [{ status: 'Failed (tags)', filename: filename, tags: tags }]
      } else {
        return [{ status: 'Failed (stream)', filename: filename, id: track.id, tags: tags }]
      }
    }

    return []
  } catch (err: any) {
    throw new Error(`Caught: ${err}`)
  }
}