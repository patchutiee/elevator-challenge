import Elevator from "./elevator";
import Person from "./person";

describe("Elevator Simulator", () => {
  let elevator;

  beforeEach(() => {
    // Reset the elevator and mock the time to PM so Level 6 doesn't interfere with standard metrics
    elevator = new Elevator();
    jest.useFakeTimers().setSystemTime(new Date("2024-01-01T15:00:00")); // 3:00 PM
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Level 2: Single Rider Scenarios", () => {
    test("Person A goes up", () => {
      const personA = new Person("Alice", 0, 5);
      elevator.requests.push(personA);
      elevator.dispatch();

      expect(elevator.floorsTraversed).toBe(5);
      expect(elevator.stops).toBe(1); // Stop at floor 5
      expect(elevator.currentFloor).toBe(5);
    });

    test("Person A goes down", () => {
      elevator.currentFloor = 5; // Start the elevator at floor 5
      const personA = new Person("Alice", 5, 0);
      elevator.requests.push(personA);
      elevator.dispatch();

      expect(elevator.floorsTraversed).toBe(5);
      expect(elevator.stops).toBe(1); // Stop at floor 0
    });
  });

  describe("Level 5: Multiple Sequential Riders", () => {
    test("Person A goes up, Person B goes up", () => {
      const personA = new Person("Alice", 0, 5);
      const personB = new Person("Bob", 2, 6);

      elevator.requests.push(personA, personB);
      elevator.dispatch();

      // Alice: 0 -> 5 (Traverse: 5, Stops: 1 [dropoff])
      // Bob: 5 -> 2 (Traverse: 3, Stops: 1 [pickup]) -> 6 (Traverse: 4, Stops: 1 [dropoff])
      expect(elevator.floorsTraversed).toBe(12); // 5 + 3 + 4
      expect(elevator.stops).toBe(3);
      expect(elevator.requests.length).toBe(0);
      expect(elevator.riders.length).toBe(0);
    });

    test("Person A goes up, Person B goes down", () => {
      const personA = new Person("Alice", 0, 4);
      const personB = new Person("Bob", 6, 2);

      elevator.requests.push(personA, personB);
      elevator.dispatch();

      // Alice: 0 -> 4 (Traverse: 4, Stops: 1)
      // Bob: 4 -> 6 (Traverse: 2, Stops: 1) -> 2 (Traverse: 4, Stops: 1)
      expect(elevator.floorsTraversed).toBe(10); // 4 + 2 + 4
      expect(elevator.stops).toBe(3);
    });

    test("Person A goes down, Person B goes up", () => {
      elevator.currentFloor = 8;
      const personA = new Person("Alice", 8, 3);
      const personB = new Person("Bob", 1, 5);

      elevator.requests.push(personA, personB);
      elevator.dispatch();

      // Alice: 8 -> 3 (Traverse: 5, Stops: 1)
      // Bob: 3 -> 1 (Traverse: 2, Stops: 1) -> 5 (Traverse: 4, Stops: 1)
      expect(elevator.floorsTraversed).toBe(11); // 5 + 2 + 4
      expect(elevator.stops).toBe(3);
    });

    test("Person A goes down, Person B goes down", () => {
      elevator.currentFloor = 10;
      const personA = new Person("Alice", 10, 5);
      const personB = new Person("Bob", 8, 2);

      elevator.requests.push(personA, personB);
      elevator.dispatch();

      // Alice: 10 -> 5 (Traverse: 5, Stops: 1)
      // Bob: 5 -> 8 (Traverse: 3, Stops: 1) -> 2 (Traverse: 6, Stops: 1)
      expect(elevator.floorsTraversed).toBe(14); // 5 + 3 + 6
      expect(elevator.stops).toBe(3);
    });
  });

  describe("Level 6: Return to Lobby", () => {
    test("Elevator returns to lobby if before 12:00 PM", () => {
      // Mock time to 10:00 AM
      jest.useFakeTimers().setSystemTime(new Date("2024-01-01T10:00:00"));

      const personA = new Person("Alice", 0, 5);
      elevator.requests.push(personA);
      elevator.dispatch();

      // Drops Alice at 5, then returns to 0
      expect(elevator.currentFloor).toBe(0);
      expect(elevator.floorsTraversed).toBe(10); // 5 up, 5 down
    });

    test("Elevator stays on current floor if after 12:00 PM", () => {
      // Mock time to 2:00 PM
      jest.useFakeTimers().setSystemTime(new Date("2024-01-01T14:00:00"));

      const personA = new Person("Alice", 0, 5);
      elevator.requests.push(personA);
      elevator.dispatch();

      // Drops Alice at 5, stays at 5
      expect(elevator.currentFloor).toBe(5);
      expect(elevator.floorsTraversed).toBe(5); // 5 up only
    });
  });
});
