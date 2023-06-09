// these imports aren't actually necessary, but why not :)
import util from 'util';
import { setTimeout } from 'timers';
import type * as Types from './types';

export function makeFilename(name: string, extension: string = '.sol'): string {
  if (!name) {
    return `Contract${extension}`;
  }
  if (name.endsWith(extension)) {
    return name;
  }
  return name + extension;
}

export const makeTimer: (milliseconds: number) => Promise<void> =
  util.promisify(setTimeout);

export function removeLibraries(
  settings: Types.SolcSettings,
  alsoRemoveCompilationTarget: boolean = false,
): Types.SolcSettings {
  const copySettings: Types.SolcSettings = { ...settings };
  delete copySettings.libraries;
  if (alsoRemoveCompilationTarget) {
    delete copySettings.compilationTarget;
  }
  return copySettings;
}

export class InvalidNetworkError extends Error {
  public networkId: number;
  public fetcherName: string;
  constructor(networkId: number, fetcherName: string) {
    super(`Invalid network ID ${networkId} for fetcher ${fetcherName}`);
    this.networkId = networkId;
    this.fetcherName = fetcherName;
    this.name = 'InvalidNetworkError';
  }
}
