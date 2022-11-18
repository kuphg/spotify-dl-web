const Spotify = require("spotify-finder");
import { searchMusics, searchPlaylists, listMusicsFromPlaylist } from "node-youtube-music";
import { SponsorBlock } from "sponsorblock-api";
import ytsr from "ytsr";

const client = new Spotify({
  consumer: {
    key: process.env.key as string,
    secret: process.env.secret as string
  }
})

export interface Response {
  message?: unknown;
  data?: Track | Album
}

export interface AlbumTrack {
  name: string;
  id: string;
}

export interface Track {
  title: string;
  artist: string;
  year: string;
  album: string;
  id: string;
  albumCoverURL: string;
  trackNumber: string;
}

export interface Album {
  name: string;
  artist: string;
  year: string;
  albumCoverURL: string;
  tracks: AlbumTrack[];
}

async function searchSong(str: string) {
  console.log(str)
  const a = await searchMusics(str);
  console.log(a)
  return a[0].youtubeId as string;
}

async function getSongsFromPlaylist(str: string) {
  const playlist = await searchPlaylists(str, { onlyOfficialPlaylists: true });
  const a = await listMusicsFromPlaylist(playlist[0].playlistId as string);
  return a;
}

/**
 * Gets the track data, and related youtube video ID for the song
 * @param {string} id - The track ID
 * @returns {Promise<Response>}
 */
export async function getTrack(id: string): Promise<Response> {
  try {
    console.log(await searchMusics("Levitating (feat. DaBaby) - Dua Lipa"))
    const track = await client.getTrack(id);
    const data = {
      id: "",
      title: track.name,
      album: track.album.name,
      trackNumber: track.track_number,
      albumCoverURL: track.album.images[0].url,
      artist: track.artists.map((a: { name: any; }) => a.name).join(", "),
      year: track.album.release_date
    };
    
    data.id = await searchSong(`${data.title} - ${track.artists[0].name}`);
    
    return {
      data
    };

  } catch (error) {
    console.log(error);
    return {
      message: error
    }
  }
}

/**
 * Gets the album data, including tracks. Note private playlists can't be fetched without an oauth token.
 * @param {string} id - The public album ID
 * @returns {Promise<Response>}
 */
export async function getAlbum(id: string): Promise<Response> {
  try {
    const album = await client.getAlbum(id);
    const data: Album = {
      name: album.name,
      artist: album.artists.map((a: { name: any; }) => a.name).join(", "),
      albumCoverURL: album.images[0].url,
      year: album.release_date,
      tracks: []
    }

    // TODO: Use ytmusic api to scrape the playlist content for video ids.
    console.log(album)
    const songs = await getSongsFromPlaylist(`${album.name} ${album.artists[0].name}`);
    data.tracks = songs.map((v) => {
      return {
        name: v.title || "No name",
        id: v.youtubeId as string
      }
    })

    return {
      data
    }
  } catch (error) {
    console.log(error)
    return {
      message: error
    }
  }
}