import Elevator from "./elevator.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default class ElevatorManager extends Elevator {
  constructor(onUpdate) {
    super();
    this.onUpdate = onUpdate;
  }

  async syncWithServer() {
    try {
      const reqRes = await fetch("http://127.0.0.1:3001/api/requests");
      this.requests = await reqRes.json();
      const riderRes = await fetch("http://127.0.0.1:3001/api/riders");
      this.riders = await riderRes.json();
      this.onUpdate();
    } catch (e) {
      console.error(e);
    }
  }

  async moveUp() {
    this.currentFloor++;
    this.floorsTraversed++;
    this.onUpdate();
    await sleep(500);
    await this.handleArrival();
  }

  async moveDown() {
    if (this.currentFloor > 0) {
      this.currentFloor--;
      this.floorsTraversed++;
      this.onUpdate();
      await sleep(500);
      await this.handleArrival();
    }
  }

  async handleArrival() {
    let changed = false;
    const currentRequests = [...this.requests];

    for (let req of currentRequests) {
      if (req.currentFloor === this.currentFloor) {
        await fetch(`http://127.0.0.1:3001/api/requests/${req.id}`, {
          method: "DELETE",
        });
        await fetch("http://127.0.0.1:3001/api/riders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req),
        });
        changed = true;
      }
    }

    const currentRiders = [...this.riders];
    for (let rider of currentRiders) {
      if (rider.dropOffFloor === this.currentFloor) {
        await fetch(`http://127.0.0.1:3001/api/riders/${rider.id}`, {
          method: "DELETE",
        });
        changed = true;
      }
    }

    if (changed) {
      this.stops++;
      await this.syncWithServer();
    }
  }

  async startDispatch() {
    await this.syncWithServer();
    while (this.requests.length > 0 || this.riders.length > 0) {
      const targets = [
        ...this.requests.flatMap((req) => [req.currentFloor, req.dropOffFloor]),
        ...this.riders.map((rider) => rider.dropOffFloor),
      ];

      if (targets.length === 0) break;

      const maxFloor = Math.max(...targets);
      const minFloor = Math.min(...targets);

      if (this.currentFloor < maxFloor) {
        await this.moveUp();
      } else if (this.currentFloor > minFloor) {
        await this.moveDown();
      } else {
        break;
      }
    }

    if (this.checkReturnToLoby()) {
      while (this.currentFloor > 0) await this.moveDown();
    }
  }
}
