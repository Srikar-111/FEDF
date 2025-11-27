const API = "http://localhost:3000";

window.onload = () => {
  loadEmployees();
  loadEmployeeSelect();
  loadLeaves();
};

async function loadEmployees() {
  const res = await fetch(`${API}/employees`);
  const employees = await res.json();

  document.getElementById("countEmployees").innerText = employees.length;

  const table = document.getElementById("employeeTable");
  table.innerHTML = "";

  employees.forEach(e => {
    table.innerHTML += `
      <tr>
        <td>${e.id}</td>
        <td>${e.name}</td>
        <td>${e.department}</td>
      </tr>`;
  });
}

async function loadEmployeeSelect() {
  const res = await fetch(`${API}/employees`);
  const employees = await res.json();

  const select = document.getElementById("employeeSelect");
  select.innerHTML = "";
  employees.forEach(emp => {
    select.innerHTML += `<option value="${emp.id}">${emp.name}</option>`;
  });
}

document.getElementById("leaveForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const newLeave = {
    employeeId: Number(employeeSelect.value),
    type: leaveType.value,
    from: fromDate.value,
    to: toDate.value,
    status: "Pending"
  };

  await fetch(`${API}/leaves`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newLeave)
  });

  loadLeaves();
});

async function loadLeaves() {
  const employees = await (await fetch(`${API}/employees`)).json();
  let leaves = await (await fetch(`${API}/leaves`)).json();

  const dept = filterDept.value;
  const type = filterType.value;
  const status = filterStatus.value;

  leaves = leaves.filter(l => {
    const emp = employees.find(e => e.id === l.employeeId);
    return (!dept || emp.department === dept) &&
           (!type || l.type === type) &&
           (!status || l.status === status);
  });

  document.getElementById("countLeaves").innerText = leaves.length;
  document.getElementById("countPending").innerText = leaves.filter(x => x.status === "Pending").length;
  document.getElementById("countApproved").innerText = leaves.filter(x => x.status === "Approved").length;

  const table = document.getElementById("leaveTable");
  table.innerHTML = "";

  leaves.forEach(l => {
    const emp = employees.find(e => e.id === l.employeeId);

    table.innerHTML += `
      <tr>
        <td>${l.id}</td>
        <td>${emp.name}</td>
        <td>${emp.department}</td>
        <td>${l.type}</td>
        <td>${l.from}</td>
        <td>${l.to}</td>
        <td>${l.status}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="updateStatus(${l.id})">Update</button>
          <button class="btn btn-danger btn-sm" onclick="deleteLeave(${l.id})">Delete</button>
        </td>
      </tr>`;
  });
}

window.updateStatus = function (id) {
  document.getElementById("currentLeaveId").value = id;
  let modal = new bootstrap.Modal(document.getElementById("statusModal"));
  modal.show();
};

window.saveStatusUpdate = async function () {
  const id = document.getElementById("currentLeaveId").value;
  const newStatus = document.getElementById("newStatusSelect").value;

  await fetch(`${API}/leaves/${id}`, {
    method: "PATCH",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ status: newStatus })
  });

  let modal = bootstrap.Modal.getInstance(document.getElementById("statusModal"));
  modal.hide();

  loadLeaves();
};

window.deleteLeave = async function (id) {
  if (!confirm("Delete this leave?")) return;

  await fetch(`${API}/leaves/${id}`, { method: "DELETE" });
  loadLeaves();
};

filterDept.onchange = loadLeaves;
filterType.onchange = loadLeaves;
filterStatus.onchange = loadLeaves;
