import ElevatorManager from "./ElevatorManager.js";

const carUI = document.getElementById("elevator-car");
const floorUI = document.getElementById("ui-floor");
const stopsUI = document.getElementById("ui-stops");
const traversedUI = document.getElementById("ui-traversed");
const ridersUI = document.getElementById("ui-riders");
const btnRequest = document.getElementById("btn-request");

function updateUI() {
  carUI.style.bottom = `${elevator.currentFloor * 60}px`;
  carUI.innerText = elevator.riders.length;
  floorUI.innerText = elevator.currentFloor;
  stopsUI.innerText = elevator.stops;
  traversedUI.innerText = elevator.floorsTraversed;
  ridersUI.innerText = elevator.riders.length;
}

const elevator = new ElevatorManager(updateUI);

btnRequest.addEventListener("click", async () => {
  const startFloor = parseInt(document.getElementById("start").value, 10);
  const endFloor = parseInt(document.getElementById("end").value, 10);

  if (isNaN(startFloor) || isNaN(endFloor)) return;
  btnRequest.disabled = true;

  await fetch("http://127.0.0.1:3001/api/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Rider",
      currentFloor: startFloor,
      dropOffFloor: endFloor,
    }),
  });

  await elevator.startDispatch();
  btnRequest.disabled = false;
});
