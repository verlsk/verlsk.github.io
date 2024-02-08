import { Tournament } from "./tournament";

export interface CalculateRequest {
    tournaments: Tournament[],
    playersOcurrence: Array<[string, number]>;
}
