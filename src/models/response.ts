export interface DayData {
  day: string,
  dayNumber: number,
  ratioFish: number,
  nTournaments: number,
  ratioTwoFishTournament: number,
  ratioTwoRegsTournament: number,
  ratioMixTournament: number
}

export interface DayResponse {
  data: DayData[];
}

export interface ResponseEntity {
  weekdayData: DayResponse;
  monthData: DayResponse;
}
