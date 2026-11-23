import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalFrame } from './modal-frame';

describe('ModalFrame', () => {
  let component: ModalFrame;
  let fixture: ComponentFixture<ModalFrame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalFrame],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalFrame);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
