export default class Elevator {
  constructor() {
    this.currentFloor = 0;
    this.stops = 0;
    this.floorsTraversed = 0;
    this.requests = [];
    this.riders = [];
  }

  dispatch() {
    while (this.requests.length > 0 || this.riders.length > 0) {
      const targets = [
        ...this.requests.flatMap((req) => [req.currentFloor, req.dropOffFloor]),
        ...this.riders.map((rider) => rider.dropOffFloor),
      ];

      if (targets.length === 0) break;

      const maxFloor = Math.max(...targets);
      const minFloor = Math.min(...targets);

      if (this.currentFloor < maxFloor) {
        this.moveUp();
      } else if (this.currentFloor > minFloor) {
        this.moveDown();
      } else {
        break;
      }
    }

    if (this.checkReturnToLoby()) {
      this.returnToLoby();
    }
  }

  goToFloor(person) {
    while (this.currentFloor < person.currentFloor) this.moveUp();
    while (this.currentFloor > person.currentFloor) this.moveDown();
    while (this.currentFloor < person.dropOffFloor) this.moveUp();
    while (this.currentFloor > person.dropOffFloor) this.moveDown();

    if (this.checkReturnToLoby()) {
      this.returnToLoby();
    }
  }

  moveUp() {
    this.currentFloor++;
    this.floorsTraversed++;
    this.hasStop();
  }

  moveDown() {
    if (this.currentFloor > 0) {
      this.currentFloor--;
      this.floorsTraversed++;
      this.hasStop();
    }
  }

  hasStop() {
    const pickup = this.hasPickup();
    const dropoff = this.hasDropoff();
    if (pickup || dropoff) {
      this.stops++;
      return true;
    }
    return false;
  }

  hasPickup() {
    let pickedUp = false;
    this.requests = this.requests.filter((req) => {
      if (req.currentFloor === this.currentFloor) {
        this.riders.push(req);
        pickedUp = true;
        return false;
      }
      return true;
    });
    return pickedUp;
  }

  hasDropoff() {
    let droppedOff = false;
    this.riders = this.riders.filter((rider) => {
      if (rider.dropOffFloor === this.currentFloor) {
        droppedOff = true;
        return false;
      }
      return true;
    });
    return droppedOff;
  }

  checkReturnToLoby() {
    return new Date().getHours() < 12 && this.riders.length === 0;
  }

  returnToLoby() {
    while (this.currentFloor > 0) {
      this.moveDown();
    }
  }

  reset() {
    this.currentFloor = 0;
    this.stops = 0;
    this.floorsTraversed = 0;
    this.requests = [];
    this.riders = [];
  }
}
