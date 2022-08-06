export enum EGameEvent {
  gameEndedEvent = 'event:game-ended',
  roundEndedEvent = 'event:round-ended',
  jackpotWinnerEvent = 'event:jackpot-winner',
  gameEndedByHostEvent = 'event:game-ended-by-host',
  roundEndedLoserEventCard = 'event:round-ended-loser-card',

}

export const gameEndedEvent = EGameEvent.gameEndedEvent;
export const roundEndedEvent = EGameEvent.roundEndedEvent;
export const jackpotWinnerEvent = EGameEvent.jackpotWinnerEvent;
export const gameEndedByHostEvent = EGameEvent.gameEndedByHostEvent;
export const roundEndedLoserEventCard = EGameEvent.roundEndedLoserEventCard;



