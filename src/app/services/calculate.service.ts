import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CalculateRequest } from '../../models/calculate-request';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalculateService {

  constructor(private httpClient: HttpClient) {

  }

  calculate(calculateRequest: CalculateRequest): Observable<any> {
    return this.httpClient.post<CalculateRequest>('https://hijifmwf77.execute-api.eu-west-1.amazonaws.com/Prod/calculate', calculateRequest);
  }
}
