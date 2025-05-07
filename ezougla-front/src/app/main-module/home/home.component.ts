import { Component } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { UserModel } from '../../model/user.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  user: UserModel | undefined = undefined;
  subscription: Subscription = new Subscription();

  constructor(private userService: UserService) {
  }

  ngOnInit(): void {
    this.subscription.add(
      this.userService.getUserSubject().subscribe((user) => {
        this.user = user;
      })
    )
  }


}
