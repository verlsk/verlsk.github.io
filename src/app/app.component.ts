import { Component, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Tournament } from '../models/tournament';
import { CalculateRequest } from '../models/calculate-request';
import { CalculateService } from './services/calculate.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DayData, ResponseEntity } from '../models/response';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatButtonModule, MatIconModule, NgChartsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent {
  @ViewChildren(BaseChartDirective) charts:QueryList<BaseChartDirective> | undefined;

  public charType: ChartType = 'bar';

  public weekBarChart: ChartData<'bar'> = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
      { data: [], label: 'Fish Week Ratio' },
      { data: [], label: 'Ratio two fish' },
      { data: [], label: 'Ratio two regs' },
      { data: [], label: 'Ratio one reg one fish' },
    ],

  };

  public barChartOptions: ChartConfiguration['options'] = {
    // We use these empty structures as placeholders for dynamic theming.
    responsive: true,
    scales: {
      x: {
      },
      y: {
        min: 0,
        max: 100
      }
    },
  };

  public monthBarChart: ChartData<'bar'> = {
    labels: this.getMonthLabels(),
    datasets: [
      { data: [], label: 'Fish Week Ratio' },
      { data: [], label: 'Ratio two fish' },
      { data: [], label: 'Ratio two regs' },
      { data: [], label: 'Ratio one reg one fish' },
    ],
  };

  // events

  tournaments: Tournament[] = [];
  playersOcc: Map<string, number> = new Map();
  enableSend: boolean = false;
  playersFileName: string = '';

  constructor(private calculateService: CalculateService) {

  }

  async onSelectFiles($event: any) {
    const files = $event.target.files;
    this.tournaments = [];

    // Convert FileList to an array using the spread operator
    const filesArray = [...files];

    // Define a function to read a single file and return a Promise
    const readFileAsync = (file: File): Promise<Tournament> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          const result = reader.result as string;
          const tournament: Tournament = { players: [], date: new Date() };

          for (const line of result.split(/[\r\n]+/)) {
            if (line.includes('Player') && !line.includes('tuquedise') && !line.includes('Players')) {
              const player = line.split(',')[1].split(': ')[1];
              tournament.players.push(player);
            } else if (line.includes('Started')) {
              const dateString = line.split(': ')[1].replace(' ', 'T').replaceAll('/', '-');
              tournament.date = new Date(dateString);
            }
          }

          resolve(tournament);
        };

        reader.onerror = () => {
          reject(new Error(`Error reading file: ${file.name}`));
        };

        reader.readAsText(file);
      });
    };

    try {
      // Use Promise.all to process all files concurrently
      const results = await Promise.all(filesArray.map(file => readFileAsync(file)));

      // Add the results to the tournaments array
      this.tournaments.push(...results);
      this.enableSend = this.tournaments.length > 0 && this.playersOcc.size > 0;
    } catch (error: any) {
      console.error(error.message);
    }
  }

  onSelectPlayers($event: any) {
    try {
      this.playersOcc = new Map();
      const file = $event.target.files[0];
      this.playersFileName = file.name;
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;
        const lines = result.split(/[\r\n]+/);
        for (let i = 1; i < lines.length - 1; i++) {
          const [name, _chips, occ] = lines[i].split('\",\"');
          this.playersOcc.set(name.replaceAll('"', ''), parseInt(occ.replaceAll(',', '')));
        }
        this.enableSend = this.tournaments.length > 0 && this.playersOcc.size > 0;
      };

      reader.readAsText(file);
    }
    catch (e) {
      console.error(e);
    }
  }

  onSend() {
    const request: CalculateRequest = {
      tournaments: this.tournaments,
      playersOcurrence: Array.from(this.playersOcc.entries())
    }

    this.calculateService.calculate(request).subscribe((resp: ResponseEntity) => {
      const weekdayData: DayData[] = resp.weekdayData.data;
      const monthData: DayData[] = resp.monthData.data;

      this.updateChartData(weekdayData, this.weekBarChart);
      this.updateChartData(monthData, this.monthBarChart);

      this.charts?.forEach((chart) => chart?.update());
    })
  }

  private updateChartData(data: DayData[], chart: ChartData) {
    for (let i = 0; i < data.length; i++) {
      chart.datasets[0].data[data[i].dayNumber] = Math.round(data[i].ratioFish * 1000) / 10
      chart.datasets[1].data[data[i].dayNumber] = Math.round(data[i].ratioTwoFishTournament * 1000) / 10
      chart.datasets[2].data[data[i].dayNumber] = Math.round(data[i].ratioTwoRegsTournament * 1000) / 10
      chart.datasets[3].data[data[i].dayNumber] = Math.round(data[i].ratioMixTournament * 1000) / 10
    }
  }

  private getMonthLabels(): Array<string> {
    const numbers = [];

    for (let i = 1; i <= 31; i++) {
      numbers.push(i.toString());
    }

    return numbers;
  }

}
