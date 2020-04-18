// Dependencies
const connection = require("./db/db.js");
const inquirer = require("inquirer");
const cTable = require("console.table");
const mysql = require("mysql");

// ====================================================================================================================
// Inquirer prompt and promise
const askQ = function() {
  inquirer
    .prompt({
      type: "list",
      name: "startQ",
      message: "What would you like to do?",
      choices: [
        "view all employees",
        "view all roles",
        "view all departments",
        "add employee",
        "add department",
        "add role",
        "update employee role",
        "remove employee"
      ]
    })
    .then(function(answer) {
      console.log(answer);
      // start of switch statment for user choice
      switch (answer.startQ) {
        case "view all employees":
          viewallemployees();
          break;

        case "view all roles":
          viewallroles();
          break;

        case "view all departments":
          viewalldepartments();
          break;

        case "add employee":
          addEmployee();
          break;

        case "update employee role":
          updateEmpRole();
          break;

        case "add department":
          addDepartment();
          break;

        case "add role":
          addRole();
          break;
      }
    });
};
askQ();

// allows user to view all departments currently in the database
function viewalldepartments() {
  connection.query("SELECT * FROM department", function(err, answer) {
    console.log("\n Departments Retrieved from Database \n");
    console.table(answer);
  });
  askQ();
}

// allows user to view all employee roles currently in the database
function viewallroles() {
  connection.query("SELECT * FROM role", function(err, answer) {
    console.log("\n Roles Retrieved from Database \n");
    console.table(answer);
  });
  askQ();
}

// allows user to view all employees currently in the database
function viewallemployees() {
  console.log("retrieving employess from database");
  var fancyQuery =
    "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department on role.department_id = department.id;";
  connection.query(fancyQuery, function(err, answer) {
    console.log("\n Employees retrieved from Database \n");
    console.table(answer);
  });
  askQ();
}

// allows user to add a new employee to database
function addEmployee() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "Enter employee first name",
        name: "firstname"
      },
      {
        type: "input",
        message: "Enter employee last name",
        name: "lastname"
      }
    ])
    .then(function(answer) {
      connection.query(
        "INSERT INTO employee SET ?",
        {
          first_name: answer.firstname,
          last_name: answer.lastname,
          role_id: null,
          manager_id: null
        },
        function(err, answer) {
          if (err) {
            throw err;
          }
          console.table(answer);
        }
      );
      askQ();
    });
}

// grabs all employees (id, first name, last name) and then allows user to select employee to update role
// https://www.guru99.com/delete-and-update.html
function updateEmpRole() {
  let allemp = [];
  connection.query("SELECT * FROM employee", function(err, answer) {
    // console.log(answer);
    for (let i = 0; i < answer.length; i++) {
      let employeeString =
        answer[i].id + " " + answer[i].first_name + " " + answer[i].last_name;
      allemp.push(employeeString);
    }
    // console.log(allemp)

    inquirer
      .prompt([
        {
          type: "list",
          name: "updateEmpRole",
          message: "select employee to update role",
          choices: allemp
        },
        {
          type: "list",
          message: "select new role",
          choices: ["manager", "employee"],
          name: "newrole"
        }
      ])
      .then(function(answer) {
        console.log("about to update", answer);
        const idToUpdate = {};
        idToUpdate.employeeId = parseInt(answer.updateEmpRole.split(" ")[0]);
        if (answer.newrole === "manager") {
          idToUpdate.role_id = 1;
        } else if (answer.newrole === "employee") {
          idToUpdate.role_id = 2;
        }
        connection.query(
          "UPDATE employee SET role_id = ? WHERE id = ?",
          [idToUpdate.role_id, idToUpdate.employeeId],
          function(err, data) {
            askQ();
          }
        );
      });
  });
}

// allows user to add a new department into the database
function addDepartment() {
  inquirer
    .prompt({
      type: "input",
      message: "enter department name",
      name: "dept"
    })
    .then(function(answer) {
      connection.query(
        "INSERT INTO department SET ?",
        {
          name: answer.dept
        },
        function(err, answer) {
          if (err) {
            throw err;
          }
        }
      ),
        console.table(answer);
      askQ();
    });
}

// allows user to add a new role/title
function addRole() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "enter employee title",
        name: "addtitle"
      },
      {
        type: "input",
        message: "enter employee salary",
        name: "addsalary"
      },
      {
        type: "input",
        message: "enter employee department id",
        name: "addDepId"
      }
    ])
    .then(function(answer) {
      connection.query(
        "INSERT INTO role SET ?",
        {
          title: answer.addtitle,
          salary: answer.addsalary,
          department_id: answer.addDepId
        },
        function(err, answer) {
          if (err) {
            throw err;
          }
          console.table(answer);
        }
      );
      askQ();
    });
}
