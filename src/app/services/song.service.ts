import { Injectable } from '@angular/core';
import * as _ from 'lodash';

import { CachedGame } from '../pages/game/cached-game';
import { CacheManager } from '../managers/cache.manager';
import { GameService } from './game.service';
import { ConstantsService } from './constants.service';
import { Router } from '@angular/router';

/*
 * App task 1 - Cache host app
 */

@Injectable({
  providedIn: 'root'
})
export class SongService {

  constructor(
    private cacheManager: CacheManager,
    private gameService: GameService,
    private constants: ConstantsService,
    private router: Router
  ) { }

  public async saveRoundsOnCache(gameId: string): Promise<void> {
    const rounds = await this.gameService.getActiveGameFilenames(gameId);
    const result = await rounds.reduce(async (roundsPromises, roundSongs) => {
      const savedRounds = await roundsPromises;
      const chunkedSongs = _.chunk(roundSongs, 5);
      const savedSongs = await this.saveChunkedSongs(gameId, chunkedSongs);
      return [...savedRounds, savedSongs];
    }, Promise.resolve([]));
    console.log('rounds saved in cache', result)
  }
  private saveChunkedSongs = async (gameId: string, chunkedSongs: string[][]): Promise<string[]> => {
    return chunkedSongs.reduce(async (promises, songs) => {
      const savedSongs = await promises;
      const saved = await this.saveSongsOnCache(gameId, songs);
      return [...savedSongs, ...saved];
    }, Promise.resolve([]));
  }
  private saveSongsOnCache = async (gameId: string, songs: string[]) => {
    const promises = await songs.map(this.saveSong(gameId));
    const savedSongs = await Promise.all(promises);
    return savedSongs.filter(result => result);
  }

  async deleteGameSongs(gameId: string): Promise<void> {
    const gameExists = await this.cacheManager.get(gameId);
    if (!gameExists) { return; }
    const game = await this.cacheManager.get<CachedGame>(gameId);
    if (!game) { return; }
    await this.cacheManager.remove(gameId);
    for (const key of game.songs) {
      await this.cacheManager.remove(key);
    }
  }

  private saveSong = (gameId: string) => async (filename: string): Promise<boolean> => {
    try {
      const { url: routeUrl } = this.router;
      if (routeUrl !== '/game/details' && routeUrl !== '/game/active' && routeUrl !== '/game/card') {
        return false;
      }
      const songUrl = `${this.constants.AWS_S3_BASE_URL}${filename}`;
      const song = await this.fetchSong(songUrl);
      const gameExists = await this.cacheManager.get(gameId);
      const game = gameExists ? await this.cacheManager.get<CachedGame>(gameId) : new CachedGame();
      game.songs.push(songUrl); // Game song control
      await this.cacheManager.set<CachedGame>(gameId, game); // Control is saved
      await this.cacheManager.set<Blob>(songUrl, song); // Song is saved
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Fetches a song from the API
   * @param url: String
   * @returns song : Promise<Blob>
   */
  public async fetchSong(url: string): Promise<Blob> {
    const promise = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        Origin: window.location.origin,
      },
    });
    return await promise.blob();
  }

  /**
   * Gets a song, checking before the fetching if the song has been previously cached.
   * If so, then the song is retrived from the cache.
   * Else, the song is fetched from the API
   * @param url : String
   * @returns blob url : Promise<string>
   */
  async retrieveSong(url: string): Promise<string> {
    const cacheLocation = await this.retrieveFromCache(url)
    console.log('cacheLocation', cacheLocation);
    return cacheLocation ? cacheLocation : (await this.retrieveFromSource(url));
  }

  private async retrieveFromSource(url): Promise<string> {
    const blob = await this.fetchSong(url)
    return URL.createObjectURL(blob);
  }

  private async retrieveFromCache(url): Promise<string | null> {
    try {
      const blob = await this.getSongFromCache(url)
      return URL.createObjectURL(blob);
    } catch (error) {
      console.log(error)
      return null
    }
  }

  /**
   * Gets a song from the cache storage
   * @param url Url of the song : string
   * @returns Blob song : Promise<Blob>
   */
  async getSongFromCache(url: string): Promise<Blob> {
    const song = await this.cacheManager.get<Blob>(url);
    console.log('exists', !!song)
    if (song) {
      return song
    }
    throw new Error('This song is not cached');
  }

  /**
   * It fades the volume in or out
   */
  fadeAudio(audio: any, from: number, to: number, duration: number, callback: any = null) {
    const iterations = 50;
    const fadeOut = from - to > 0;
    const totalVolumeChange = Math.abs(from - to);
    const volumeChangeRatio = totalVolumeChange / iterations;
    const durationChangeRatio = duration / iterations;

    const volumeIntervals = [];

    for (let i = 0; i < iterations; i++) {
      const last = i === iterations - 1;
      let volume = fadeOut ? from - i * volumeChangeRatio : from + i * volumeChangeRatio;

      if (last) {
        volume = to; // make sure we end at the right place;
      }

      volumeIntervals.push({
        volume,
        duration: i * durationChangeRatio,
        last,
      });
    }

    volumeIntervals.forEach((vi) => {
      setTimeout(
        () => {
          if (typeof audio.volume === 'function') {
            audio.volume(vi.volume);
          } else {
            audio.volume = vi.volume;
          }

          if (vi.last && callback) {
            callback();
          }
        },
        vi.duration
      );
    });
  }

}
