import { Component } from '@angular/core';
import { UserModel } from '../../model/user.interface';
import { UserService } from '../../services/user/user.service';
import { Subscription } from 'rxjs';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-manage-user',
  imports: [NgClass],
  templateUrl: './manage-user.component.html',
  styleUrl: './manage-user.component.css'
})
export class ManageUserComponent {

  users: UserModel[] = [];
  currentUser: UserModel | undefined;
  subscription: Subscription = new Subscription();
  userRoleClicked: string = '';

  roles: string[] = [
    'DIRECTOR',
    'MANAGER',
    'EMPLOYEE'
  ]

  constructor(private userService: UserService) {
  }

  ngOnInit(): void {
    this.userService.getUserSubject().subscribe((user) => {
      this.currentUser = user;
    })

    this.userService.getUserTab().subscribe((users: UserModel[]) => {
      this.users = users;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  isUserClicked(id: string): boolean {
    if (id === this.userRoleClicked) {
      return true;
    } else {
      return false;
    }
  }

  onClickPage(): void {
    this.userRoleClicked = '';
  }

  onClickContainerRole(event: MouseEvent): void {
    event.stopPropagation();
  }

  onClickRole(id: string, event: MouseEvent): void {
    this.userRoleClicked = id;
    event.stopPropagation();
  }

  onClickModifyRole(id: string, role: string): void {
    this.userService.fetchModifyRoleUser(id, role).subscribe(() => {
      this.userRoleClicked = '';
    })
  }
  onClickDelete(id: string): void {
    this.userService.fetchDeleteUser(id).subscribe(() => { });
  }
  onClickEnable(id: string): void {
    this.userService.fetchEnableUser(id).subscribe(() => { })
  }
  onClickDisable(id: string): void {
    this.userService.fetchDisableUser(id).subscribe(() => { })
  }

}
