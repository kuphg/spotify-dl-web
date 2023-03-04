const Spotify = require("spotify-web-api-node");
// import { searchMusics, searchPlaylists, listMusicsFromPlaylist } from "node-youtube-music";

import { SponsorBlock } from "sponsorblock-api";
import ytsr from "ytsr";

const client = new Spotify({
  clientId: process.env.key,
  clientSecret: process.env.secret,
});

client.setAccessToken(process.env.token);

export interface Response {
  message?: unknown;
  data?: Track | Album | Playlist
}

export interface AlbumTrack {
  name: string;
  id: string;
}

export interface PlaylistTrack {
  coverUrl: string;
  title: string;
  artist: string;
  year: string;
  id: string | null;
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

export interface Playlist {
  name: string;
  tracks: PlaylistTrack[];
}

async function searchSong(str: string) {
  let id: string | null = null;
  console.log(`search: ${str}`)
  const a = await ytsr(str, { limit: 3 });

  for (const item of a.items) {
    if (item.type === "video") id = item.id;
  }

  return id;
}

// async function getSongsFromAlbum(str: string) {
//   const results = await searchPlaylists(str, { onlyOfficialPlaylists: true });
//   return await listMusicsFromPlaylist(results[0].playlistId as string);
// }

/**
 * Gets the track data, and related youtube video ID for the song
 * @param {string} id - The track ID
 * @returns {Promise<Response>}
 */
export async function getTrack(id: string): Promise<Response> {
  try {
    const track = (await client.getTrack(id)).body;
    const data = {
      id: "",
      title: track.name,
      album: track.album.name,
      trackNumber: track.track_number,
      albumCoverURL: track.album.images[0].url,
      artist: track.artists.map((a: { name: any; }) => a.name).join(", "),
      year: track.album.release_date
    };
    
    const ytId = await searchSong(`${track.name} - ${track.artists[0].name}`);
    if (!ytId) throw new Error("Could not find a valid video Id");
    data.id = ytId;
    
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
 * Gets the album data, including tracks.
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
    const songs: any[] = [];//await getSongsFromAlbum(`${album.name} ${album.artists[0].name}`);
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

/**
 * Gets the playlist data, including tracks. Note private playlists can't be fetched without an oauth token.
 * @param {string} id - The public playlist ID
 * @returns {Promise<Response>}
 */
export async function getPlaylist(id: string): Promise<Response> {
  try {
    const playlist = (await client.getPlaylist(id)).body;
    const data: Playlist = {
      name: playlist.name,
      tracks: []
    }

    for (const { track } of playlist.tracks.items) {
      const ytId = await searchSong(`${track.name} - ${track.artists[0].name}`);
      if (!ytId) console.log(`Failed to get ytId for ${track.name}`);

      data.tracks.push({
        id: ytId || null,
        coverUrl: track.album.images[0].url,
        artist: track.artists.map((a: { name: any; }) => a.name).join(", "),
        year: track.album.release_date,
        title: track.name
      })
    }

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