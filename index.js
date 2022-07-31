const inquirer = require("inquirer");
const db = require("./db/connection");

const startMenu = {
  name: "functionality",
  message: "Hello, welcome to employee manager, what would you like to do?",
  type: "list",
  choices: [
    "Add Employee",
    "Update Employee",
    "Show All Employees",
    "View all departments",
    "View all roles",
    "Add Department",
    "Add a role",
  ]
};

const addARole = () => {
  db.query('SELECT * FROM department').then(data => {
    const departments = data.map(dep => ({ name: dep.name, value: dep.id }))
    const questions = [
      {
        name: "title",
        message: "Hello, What is the title of the role?",
        type: "input",

      },
      {
        name: "salary",
        message: "Hello, What is the salary of the role?",
        type: "input",
      },
      {
        name: "department_id",
        message: "Hello, What is the department of the role?",
        type: "list",
        choices: [...departments],
      },

    ]
    inquirer.prompt(questions).then(res => {
      db.query('INSERT INTO role SET ?', res).then(() => {
        console.log("---Role Created---")
        setTimeout(start, 3000)
      })
    })
  })
}

const updateEmployee = () => {
  db.query('SELECT id,title FROM role').then((data) => {
    const availableRoles = data.map(role => ({ name: role.title, value: role.id }))
    const questions = [
      {
        name: "id",
        message: "Hello, Which employee ID would you like to update?",
        type: "input",

      },
      {
        name: "role",
        message: "Hello, What is the employee's new role?",
        type: "list",
        choices: [...availableRoles],
      },

    ]
    inquirer.prompt(questions).then((response) => {
      db.query('UPDATE employee SET role_id = ? WHERE id = ?', [response.role, response.id]).then(() => {
        setTimeout(start, 3000)
      })
    })
  })
}
//const viewAllRoles = 

const showAllEmployees = () => {
  //make a call to the db, and show all employees
  db.query(`SELECT e1.id as EMP_ID, CONCAT(e1.first_name, ' ', e1.last_name) as Name, title as role, 
  salary, department.name as department, IFNULL(CONCAT(e2.first_name, ' ', e2.last_name), 'No Manager, Bawss Status') as Manager FROM employee e1 LEFT JOIN role 
  ON e1.role_id=role.id LEFT JOIN department ON role.department_id=department.id
  LEFT JOIN employee e2 ON e1.manager_id=e2.id `).then((results) => {
    console.log("--------------  EMPLOYEES  --------------");
    console.table(results);
    console.log("--------------  EMPLOYEES  --------------");

    setTimeout(start, 3000);
  });
};

const viewAllDepartments = () => {
  db.query('SELECT * FROM department').then((results) => {
    console.log("--------------  DEPARTMENT  --------------");
    console.table(results);
    console.log("--------------  DEPARTMENT  --------------");

    setTimeout(start, 3000);
  });
};

const viewAllRoles = () => {
  db.query('SELECT * FROM role').then((results) => {
    console.log("--------------  ROLE  --------------");
    console.table(results);
    console.log("--------------  ROLE  --------------");

    setTimeout(start, 3000);
  });
};

const addDepartments = () => {

  const addDepartmentsPrompt = {
    name: "name",
    message: "What is the department you want to add?",
  }
  inquirer.prompt(addDepartmentsPrompt).then((results) => {
    console.log("RESULTS --- ", results);

    db.query("INSERT INTO department SET ?", results).then(() => setTimeout(start, 3000))
  })

}

const addEmployee = () => {
  //before writing query, we need inquirer to gather info on new employee
  //we need all the current role ids, to allow user to choose a role_id that's in the role table,
  //we need all the current emp ids, to choose a manager_id
  db.query(`SELECT id, first_name, last_name FROM employee`).then(
    (managers) => {
      const managerChoices = managers.map((man) => {
        return {
          name: `${man.first_name} ${man.last_name}`,
          value: man.id,
        };
      });
      db.query(`SELECT id, title FROM role`).then((results) => {
        const choices = results.map((role) => {
          return {
            name: role.title,
            value: role.id,
          };
        });
        //convert results to a array of choices for inquirer prompt
        const addEmployeePrompt = [
          {
            name: "first_name",
            message: "What is the employee's first name?",
          },
          {
            name: "last_name",
            message: "What is the employee's last name?",
          },
          {
            name: "role_id",
            message: "What is the employee's title?",
            type: "list",
            choices,
          },
          {
            name: "manager_id",
            message: "Who is this employee's manager?",
            type: "list",
            choices: [
              ...managerChoices,
              { name: "No Manager, this person is a bawss!", value: null },
            ],
          },
        ];

        inquirer.prompt(addEmployeePrompt).then((results) => {
          console.log("RESULTS --- ", results);

          db.query("INSERT INTO employee SET ?", results).then(() =>
            setTimeout(start, 3000)
          );
        });
      });
    }
  );
  // inquirer.prompt()
};

function start() {
  inquirer.prompt(startMenu).then((response) => {

    //based on user choice, we're going to maybe ask additional questions or do some db operation
    switch (response.functionality) {
      case "Show All Employees":
        return showAllEmployees();
      case "Add Employee":
        return addEmployee();
      case "Update Employee":
        return updateEmployee();
      case "Delete an Employee":
        return deleteAnEmployee();

      case "View all departments":
        return viewAllDepartments();
      case "View all roles":
        return viewAllRoles();
      case "Add Department":
        return addDepartments();
      case "Add a role":
        return addARole();

    }
  });
}

start();
