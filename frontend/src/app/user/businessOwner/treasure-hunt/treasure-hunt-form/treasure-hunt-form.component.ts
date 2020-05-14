import {Component, Inject, Input, OnInit, ViewChild} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {Gamestep, Games} from '../../../../models/Games';
import {UserAuthService} from "../../../user-auth.service";
import {GamesService} from "../../../services/games.service";
import {ToastrService} from "ngx-toastr";
import {Place} from "../../../../models/places";
import {PlacesService} from "../../../services/places.service"
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-new-treasure-hunt',
  templateUrl: './treasure-hunt-form.component.html',
  styleUrls: ['./treasure-hunt-form.component.scss'],
})
export class TreasureHuntFormComponent implements OnInit {
  currentStepNum = 1;
  steps: Gamestep[] = [];
  dogParks: Place[];

  constructor(
    private rout: ActivatedRoute,
    private userAuth: UserAuthService,
    private toastr: ToastrService,
    private GamesService: GamesService,
    private placesService: PlacesService,
    private dialogRef: MatDialogRef<TreasureHuntFormComponent>,
    @Inject(MAT_DIALOG_DATA) public treasureHunt: Games
  ) {
  }

  basicForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    start: new FormControl('', [Validators.required]),
    end: new FormControl('', [Validators.required]),
    start_location: new FormControl('', [Validators.required]),
    finish_location: new FormControl('', [Validators.required]),
  });

  stepsForm = new FormGroup({
    location: new FormControl('', [Validators.required]),
    secret_key: new FormControl('', [Validators.required]),
    description: new FormControl(''),
  });

  mode: any;
  panelOpenState = false;

  ngOnInit(): void {
    this.placesService.getDogParks().subscribe(parks => {
      this.dogParks = parks;
      if (this.treasureHunt) {
        console.log(this.treasureHunt);
        this.basicForm.setValue({
          title: this.treasureHunt.name,
          start: this.treasureHunt.start,
          end: this.treasureHunt.end,
          start_location: this.treasureHunt.start_location,
          finish_location: this.treasureHunt.finish_location
        });
        this.steps = this.treasureHunt.steps;
      }
    }, err => {
      console.log(err);
    });
  }

  findWithAttr(arr, attr, val) {
    for (var i = 0; i < arr.length; i += 1) {
      if (arr[i][attr] === val) {
        return i;
      }
    }
    return -1;
  }

  createNewStep(): Gamestep {
    let title = this.basicForm.controls.title.value,
      secret_key = this.stepsForm.controls.secret_key.value,
      finish_location =this.stepsForm.controls.location.value,
      description = this.stepsForm.controls.description.value;
    if (!this.stepsForm.valid) {
      this.toastr.error('יש להזין את כל השדות הדרושים לצעד');
      return null;
    }

    let place_index = this.findWithAttr(this.dogParks, 'id', finish_location)
    if (place_index > -1) {
      let place = this.dogParks[place_index];
      let name = place.name;
      let start_location = this.basicForm.controls.start_location.value
      if (this.steps.length > 0) {
        start_location = this.steps[this.steps.length - 1].finish_location
        this.steps[this.steps.length - 1].finish_location = start_location
      }
      let step: Gamestep = {
        name: name,
        secret_key: secret_key,
        start_location: start_location,
        finish_location: finish_location,
        step_num: this.currentStepNum++,
        description: description
      };
      this.stepsForm.reset();
      Object.keys(this.stepsForm.controls).forEach(key => {
        this.stepsForm.controls[key].setErrors(null)
      });
      return step;
    } else return;
  }

  pushNewStep(): void {
    if (this.steps.length == 0) {
      if (this.basicForm.controls.start_location.value == '') {
        this.toastr.error('יש להזין את כל השדות הבסיסיים למשחק');
        return;
      }
    }
    let newStep = this.createNewStep();
    if (newStep == null) return;
    this.steps.push(newStep);
  }

  removeStep(index: number) {
    this.steps.splice(index, 1);
    this.currentStepNum--;
  }

  date_str(date: Date): string {
    let y = date.getFullYear();
    let m = date.getMonth()+1;
    let d = date.getDate();
    return y + '-' + m + '-' + d;
  }

  submitGame(): void {
    if (!this.basicForm.valid) {
      this.toastr.error('יש להזין את כל השדות הבסיסיים למשחק');
      return;
    }
    let game: Games = {
      owner_id: this.userAuth.currentUser.getValue().id,
      name: this.basicForm.controls.title.value,
      start: this.date_str(new Date(this.basicForm.controls.start.value)),
      end: this.date_str(new Date(this.basicForm.controls.end.value)),
      start_location: this.basicForm.controls.start_location.value,
      finish_location: this.basicForm.controls.finish_location.value,
      steps: this.steps
    }
    this.GamesService.createNewGame(game).subscribe((res) => {
      this.toastr.success('הפעולה הסתיימה בהצלחה!');
      this.basicForm.reset();
      Object.keys(this.basicForm.controls).forEach(key => {
        this.basicForm.controls[key].setErrors(null)
      });
      this.steps = [];
    }, err => {
      this.toastr.error('הפעולה נכשלה!');
      console.log('err', err);
    });
  }

  updateGame(): void {
    if (!this.basicForm.valid) {
      this.toastr.error('יש להזין את כל השדות הבסיסיים למשחק');
      return;
    }
    let game: Games = {
      id: this.treasureHunt.id,
      owner_id: this.userAuth.currentUser.getValue().id,
      name: this.basicForm.controls.title.value,
      start: this.date_str(new Date(this.basicForm.controls.start.value)),
      end: this.date_str(new Date(this.basicForm.controls.end.value)),
      start_location: this.basicForm.controls.start_location.value,
      finish_location: this.basicForm.controls.finish_location.value,
      steps: this.steps
    }
    this.GamesService.updateGame(game).subscribe((res) => {
      this.toastr.success('הפעולה הסתיימה בהצלחה!');
      this.dialogRef.close(res);
    }, err => {
      this.toastr.error('הפעולה נכשלה!');
      console.log('err', err);
    });
  }

}
