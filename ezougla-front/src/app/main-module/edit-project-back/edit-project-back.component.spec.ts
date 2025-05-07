import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProjectBackComponent } from './edit-project-back.component';

describe('EditProjectBackComponent', () => {
  let component: EditProjectBackComponent;
  let fixture: ComponentFixture<EditProjectBackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditProjectBackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditProjectBackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
