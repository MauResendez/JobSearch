// this file makes the database connection, collects all the models
// and sets the associations
// other files can use this for database access by requiring it and
// assigning the exports

// assuming that this file (index.js) is in a subdirectory called models:
//  const models = require('./models');

// or (using deconstruction):
//  const { Person, PhoneNumber, Address, PersonAddress } = require('./models');

'use strict';

// database connection
const Sequelize = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'users.sqlite'
});

// import models
const Applied_Job = sequelize.import("./applied_jobs.js");
const Employee = sequelize.import("./employees.js");
const Employer = sequelize.import("./employers.js");
const Posted_Job = sequelize.import("./posted_jobs.js");
const Applicant = sequelize.import("./applicants.js");
const Saved_Job = sequelize.import("./saved_jobs.js");

// associations
// Item.hasMany(Review, {foreignKey: "itemId", as: "Reviews"});
// Review.belongsTo(Item, {foreignKey: "itemId"});

// Employee.hasMany(Applied_Job, {foreignKey: "employee_id"});
// Applied_Job.belongsTo(Employee, {foreignKey: "employee_id"});

//Employer.hasMany(Applied_Job, {foreignKey: "company"});
//Applied_Job.belongsTo(Employer, {foreignKey: "company"});

// Employer.hasMany(Posted_Job, {foreignKey: "employer_id"});
// Posted_Job.belongsTo(Employer, {foreignKey: "employer_id"});

//Employer.hasMany(Posted_Job, {foreignKey: "company"});
//Posted_Job.belongsTo(Employer, {foreignKey: "company"});

module.exports = {
  Applied_Job, Posted_Job, Employee, Employer, Applicant, Saved_Job
};

