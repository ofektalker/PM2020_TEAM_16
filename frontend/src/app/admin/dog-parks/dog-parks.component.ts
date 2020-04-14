import { Component, OnInit } from '@angular/core';
import { ConditionType, ConditionTypeTitles, Place } from '../../models/places';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AreYouSureDialogComponent } from '../../are-you-sure-dialog/are-you-sure-dialog.component';
import { NewDogParkComponent } from './new-dog-park/new-dog-park.component';
import { DogParksService } from '../services/dog-parks.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { LayoutService } from '../shared/services/layout.service';

@Component({
  selector: 'app-dog-parks',
  templateUrl: './dog-parks.component.html',
  styleUrls: ['./dog-parks.component.scss']
})
export class DogParksComponent implements OnInit {
  conditionType = ConditionType;
  conditionTypeTitle = ConditionTypeTitles;
  displayedColumns: string[] = ['name', 'street', 'neighborhood', 'operator', 'handicapped', 'condition', 'action'];
  dataSource: MatTableDataSource<Place>;
  places: Place[];

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  constructor(
    private rout: ActivatedRoute,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private dogParkService: DogParksService
    ) { }

  ngOnInit(): void {
    this.places = this.rout.snapshot.data.dogParks.places;
    this.dataSource = new MatTableDataSource<Place>(this.places);
  }

  removeDogPark(dogParkId: number) {
    this.dialog.open(AreYouSureDialogComponent, {
      width: '250px',
    }).afterClosed().subscribe(result => {
      if (result) {
        this.dogParkService.deleteDogPark(dogParkId).subscribe(res => {
          console.log(res);
          this.dataSource.data = this.dataSource.data.filter(park => park.id !== dogParkId);
          this.toastr.success('נמחק בהצלחה');
        }, err =>  {
          console.log(err);
          this.toastr.error('ארעה שגיאה במחיקה');
        });
      }
    });
  }

  editDogPark(dogPark: Place) {
    this.dialog.open(NewDogParkComponent, {
      width: '600px',
      data: dogPark
    }).afterClosed().subscribe(result => {
      if (result && result.status) {
        const idx = this.dataSource.data.findIndex(park => park.id === result.places[0]);
        if (idx >= 0) {
          this.dataSource.data[idx] = result.places[0];
        }
        this.dataSource.data = this.dataSource.data;
      }
    });
  }

  addDogPark() {
    this.dialog.open(NewDogParkComponent, {
      width: '600px',
      data: null
    }).afterClosed().subscribe(result => {
      if (result && result.status) {
        this.dataSource.data.push(result.places[0]);
        this.dataSource.data = this.dataSource.data;
      }
    });
  }

}
