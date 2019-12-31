// import the models
const { Applied_Job, Posted_Job, Employee, Employer, Applicant, Saved_Job } = require('./models');
var Sequelize = require('sequelize');
const Op = Sequelize.Op

const express = require('express');
const path = require('path');
var hbs = require( 'express-handlebars');
const session = require('express-session');
const bcrypt = require('bcrypt-nodejs');
const loop = require('handlebars');
const list = require('handlebars');
var favicon = require('serve-favicon');

app = express();
app.set('port', 3002);

// setup handlebars and the view engine for res.render calls
// (more standard to use an extension like 'hbs' rather than
//  'html', but the Universiry server doesn't like other extensions)
app.set('view engine', 'html');
app.engine( 'html', hbs( {
  extname: 'html',
  defaultView: 'default',
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/'
}));

// setup body parsing for form data
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// set up session (in-memory storage by default)
app.use(session({secret: "This is a big long secret lama string."}));

// setup static file service
app.use(express.static(path.join(__dirname, 'static')));
//setup favicon
app.use(favicon(path.join(__dirname,'static','favicon.ico')));

//////////////////////////////////////////////////////////////////
// employee page
app.get('/home', (req,res) => 
{
	if(req.session.user)
	{
		if(req.session.type === "Employee")
		{
			Posted_Job.findAll().then(posted_jobs => 
			{
				res.render('home', {active: { home: true }, page: "Home", user: req.session.user, type: req.session.type, posted_jobs: posted_jobs});
			});
		}
		else if(req.session.type === "Employer")
		{
			res.render('employer_page', {active: { upload: true }, page: "Upload", user: req.session.user, type: req.session.type});
		}
	}
	else
	{
		Posted_Job.findAll().then(posted_jobs => 
		{
			res.render('home', {active: { home: true }, page: "Home", posted_jobs: posted_jobs});
		});
	}
});

//////////////////////////////////////////////////////////////////
// login
app.get('/login', (req,res) => 
{
	res.render('login');
});

//////////////////////////////////////////////////////////////////
// register
app.get('/register', (req,res) => 
{
	res.render('register');
});

//////////////////////////////////////////////////////////////////
// employer login
app.get('/employer_login', (req,res) => 
{
	res.render('employer_login');
});

//////////////////////////////////////////////////////////////////
// employer register
app.get('/employer_register', (req,res) => 
{
	res.render('employer_register');
});

//////////////////////////////////////////////////////////////////
// form action from login page
app.post('/login', (req,res) => 
{
	let email = req.body.email.trim();
	let password = req.body.password.trim();
	let errors = [];

	if(email.length == 0 || password.length == 0)
    {
      errors.push({msg: "One or more of these fields is blank"});
	}

	if(req.body.login_btn)
	{
		Employee.findOne({where: {email: email}}).then(employee => 
		{
			if(employee) // case 1
			{
				bcrypt.compare(password, employee.password, (err, match) => 
				{
					if(match)
					{
						req.session.type = "Employee";
						req.session.user = employee;
						res.redirect('/home');
					}
					else
					{
						errors.push({msg: "Wrong email or password"});
						res.render('login', {errors: errors, email: email, password: password});
					}
				});
			}
			else // case 2
			{
				errors.push({msg: "Wrong email or password"});
				res.render('login', {errors: errors, email: email, password: password});
			}
		});
	}
});

//////////////////////////////////////////////////////////////////
// form action from register page
app.post('/register', (req,res) => 
{
	let email = req.body.email.trim();
	let password = req.body.password.trim();
	let first_name = req.body.first_name.trim();
	let last_name = req.body.last_name.trim();
	let state = req.body.state.trim();
	let city = req.body.city.trim();
	let education = req.body.education.trim();
	let major = req.body.major;
	let resume = req.body.resume;
	let errors = [];

	//const selectedFile = document.getElementById('input').files[0];

	console.log(resume);
	//console.log(selectedFile);

	if(req.body.email.trim().length == 0 || req.body.password.trim().length == 0 || req.body.first_name.trim().length == 0 || req.body.last_name.trim().length == 0 || req.body.city.trim().length == 0 || req.body.state.trim().length == 0 || req.body.education.trim().length == 0 || req.body.major.trim().length == 0)
    {
		errors.push({msg: "Every field needs to be filled out"});
	}

	if(password < 8)
    {	
    	errors.push({msg: "Password is too short"});
    }

	if(req.body.register_btn)
	{
		Employee.findOne({where: {email : email}}).then(employee =>
		{
		    if(employee)
			{
				errors.push({msg: "Email is already being used"});
			};
		}).then(function ()
		{
			if(errors.length > 0) // case 4
			{
				res.render('register', {errors: errors, email: email, password: password, first_name: first_name, last_name: last_name, state: state, city: city, education: education, major: major, resume: resume});
				return;
			}
			else // case 3
			{
				Employee.create({email: email, password: bcrypt.hashSync(password), city: city, state: state, education: education, major: major, first_name: first_name, last_name: last_name, resume: resume}).then(employee => 
				{
					req.session.type = "Employee";
					req.session.user = employee;
					res.redirect('/home');
				});
			}
		});
	}
});

//////////////////////////////////////////////////////////////////
// form action from login page
app.post('/employer_login', (req,res) => 
{
	let email = req.body.email.trim();
	let password = req.body.password.trim();
	let errors = [];

	if(req.body.email.trim().length == 0 || req.body.password.trim().length == 0)
    {
      errors.push({msg: "One or more of these fields is blank"});
	}

	if(req.body.login_btn)
	{
		Employer.findOne({where: {email: email}}).then(employer => 
		{
			if(employer) // case 1
			{
				bcrypt.compare(password, employer.password, (err, match) => 
				{
					if(match)
					{
						req.session.type = "Employer";
						req.session.user = employer;
						res.redirect('/home');
					}
					else
					{
						errors.push({msg: "Wrong email or password"});
						res.render('employer_login', {errors: errors, email: email, password: password});
					}
				});
			}
			else // case 2
			{
				errors.push({msg: "Wrong email or password"});
				res.render('employer_login', {errors: errors, email: email, password: password});
			}
		});
	}
});

//////////////////////////////////////////////////////////////////
// form action from register page
app.post('/employer_register', (req,res) => 
{
	let email = req.body.email.trim();
	let password = req.body.password.trim();
	let company = req.body.company.trim();
	let state = req.body.state.trim();
	let city = req.body.city.trim();
	let errors = [];

	if(req.body.email.trim().length == 0 || req.body.password.trim().length == 0 || req.body.company.trim().length == 0 || req.body.city.trim().length == 0 || req.body.state.trim().length == 0)
    {
		errors.push({msg: "Every field needs to be filled out"});
	}

	if(password < 8)
    {	
    	errors.push({msg: "Password is too short"});
    }

	if(req.body.register_btn)
	{
		Employer.findOne({where: {company : company}}).then(employer =>
			{
				if(employer)
				{
					errors.push({msg: "Company name is already being used"});
				}

				Employer.findOne({where: {email : email}}).then(employer =>
				{
					if(employer)
					{
						errors.push({msg: "Email is already being used"});
					}
				}).then(function ()
				{
					if(errors.length > 0) // case 4
					{
						res.render('employer_register', {errors: errors, email: email, password: password, company: company, state: state, city: city});
						return;
					}
					else // case 3
					{
						Employer.create({email: email, password: bcrypt.hashSync(password), city: city, state: state, company: company}).then(employer => 
						{
							req.session.type = "Employer";
							req.session.user = employer;
							res.redirect('/home');
						});
					}
				});
		});
	}
});

//////////////////////////////////////////////////////////////////
//render jobs
app.get('/jobs', (req,res) => 
{
	if(req.session.user) //if there is a user
	{
		if(req.session.type === "Employee") // If employee, go through jobs you already applied
		{
			Applied_Job.findAll(
			{
				where: {employee_id: req.session.user.id}
			}).then(applied_jobs => 
			{
				res.render('jobs_applied', {active: { jobs: true }, page: "Jobs", user: req.session.user, type: req.session.type, applied_jobs: applied_jobs});
			});
		}
		else if(req.session.type === "Employer") // Else if employer, go through jobs you posted
		{
			Posted_Job.findAll(
			{
				where: {employer_id: req.session.user.id}
			}).then(posted_jobs => 
			{
				res.render('jobs_posted', {active: { jobs: true }, page: "Jobs", user: req.session.user, type: req.session.type, posted_jobs: posted_jobs});
			});
		}
	}
	else // If not a user, go home
	{
		res.render('home', {active: { home: true }, page: "Home"});
	}
});

//////////////////////////////////////////////////////////////////
//render jobs
app.get('/employer_page', (req,res) => 
{
	if(req.session.user) //if there is a user
	{
		if(req.session.type === "Employer") // If user is an employer
		{
			res.render('employer_page', {active: { upload: true }, page: "Upload", user: req.session.user, type: req.session.type});
		}
		else // else go home
		{
			res.render('home', {active: { home: true }, page: "Home"});
		}
	}
	else // if not a user, go home
	{
		res.render('home', {active: { home: true }, page: "Home"});
	}
});

//////////////////////////////////////////////////////////////////
//render jobs
app.get('/job_upload', (req,res) => 
{
	if(req.session.user) // if user
	{
		if(req.session.type === "Employer") // if employer
		{
			res.render('job_upload', {active: { upload: true }, page: "Upload", user: req.session.user, type: req.session.type}); // take user, type variables to job_upload page
		}
		else // if employee, go home
		{
			res.render('home', {active: { home: true }, page: "Home"}); // go home
		}
	}
	else // if not user, go home
	{
		res.render('home', {active: { home: true }, page: "Home"});
	}
});

//////////////////////////////////////////////////////////////////
//render jobs
app.post('/upload_job', (req,res) => 
{
	if(req.session.user)
	{
		if(req.session.type === "Employer")
		{
			// takes info from page inputs and session
			let id = req.session.user.id;
			let title = toTitleCase(req.body.title);
			let description = req.body.description;
			let company = req.session.user.company;
			let pay = req.body.pay;
			let education = req.body.education;
			let major = req.body.major;
			let state = req.body.state;
			let city = req.body.city;

			// creates posted job in the database
			Posted_Job.create({employer_id: id, title: title, description: description, company: company, pay: pay, education: education, major: major, state: state, city: city}).then(job => 
			{
				res.redirect('/home');
			});
		}
		else // if user is an employee, go home
		{
			res.render('home', {active: { home: true }, page: "Home"});
		}
	}
	else // if not user, go home
	{
		res.render('home', {active: { home: true }, page: "Home"});
	}
});

//////////////////////////////////////////////////////////////////
// show list of applicants
app.get('/applicants', (req,res) => 
{
	if(req.session.user)
	{
		if(req.session.type === "Employer")
		{
			// gets all Applicants that have applied to jobs that you have created
			Applicant.findAll(
			{where: {employer_id: req.session.user.id}}).then(applicants =>
				{
					//search database for users that have applied to employer 
					//return in array to be formated in applicants.html cards
					res.render('applicants', {active: { applicants: true }, page: "Applicants", user: req.session.user, type: req.session.type, applicants: applicants
				});
			});
		}
		else
		{
			res.render('home', {active: { home: true }, page: "Home"});
		}
	}
	else
	{
		res.render('home', {active: { home: true }, page: "Home"});
	}
});

app.post('/decline/:id', (req,res) => 
{
	if(req.body.decline_btn) // if decline button is pressed
	{
		let id = req.params.id; // applicant id
		
		Applicant.findOne({ where: {id: id}}).then(applicant =>
		{
			let jobid = applicant.job_id;
			let employeeid = applicant.employee_id;

			// deletes applied job that the applicant has applied in and then deletes applicant itself

			Applied_Job.destroy({ where: {employee_id: employeeid, job_id: jobid}}).then(function(){
				Applicant.destroy({ where: {employee_id: employeeid, job_id: jobid}}).then(function()
				{
					res.redirect('/home');
				});
			});
		});
		
	}
	else if(req.body.message_btn) // if messages button pressed, go to messages
	{
		res.redirect('/messages');
	}
});

//////////////////////////////////////////////////////////////////
//render account
app.get('/account', (req,res) => 
{
	if(req.session.user)
	{
		if(req.session.type === "Employee")
		{
			res.render('employee_account', {active: { account: true }, page: "Account", user: req.session.user, type: req.session.type});
		}
		else if(req.session.type === "Employer")
		{
			res.render('employer_account', {active: { account: true }, page: "Account", user: req.session.user, type: req.session.type});
		}
	}
	else
	{
		res.render('home', {active: { home: true }, page: "Home"});
	}
});

//////////////////////////////////////////////////////////////////
//render account
app.post('/update_or_delete_account', (req,res) => 
{
	if(req.body.update_btn)
	{
		if(req.session.user)
		{
			if(req.session.type === "Employee")
			{
				// gets info from page
				let email = req.body.email.trim();
				let password = req.body.original_password.trim();
				let state = req.body.state.trim();
				let city = req.body.city.trim();
				let education = req.body.education.trim();
				let major = req.body.major;

				Employee.findOne( // finds employee with your id
					{
						where: {id: req.session.user.id}
					}).then(employee => 
					{
						if(employee)
						{
							if(password === "")
							{
								// Updates info from applicant so employers don't see old info about you in their applicants page,
								// then updates employee itself
								Applicant.update({ city: city, state: state, education: education, major: major},
								{ where: {employee_id: req.session.user.id}}).then(function()
								{
									Employee.update({ email: email, city: city, state: state, education: education, major: major},
									{ where: {id: req.session.user.id} }).then(function() 
										{
											req.session.save(function(err) 
											{
												req.session.reload(function (err)
												{
													req.session.user.email = email;
													req.session.user.original_password = password;
													req.session.user.city = city;
													req.session.user.state = state;
													req.session.user.education = education;
													req.session.user.major = major;
													res.redirect('/home');
												});
											});
									});
								});
							}
							else
							{
								Applicant.update({ city: city, state: state, education: education, major: major},
								{ where: {employee_id: req.session.user.id}}).then(function()
								{
									Employee.update({email: email, password: bcrypt.hashSync(password), city: city, state: state, education: education, major: major}, { where: {id: req.session.user.id}}).then(function()
									{
										req.session.user.email = email;
										req.session.user.original_password = password;
										req.session.user.city = city;
										req.session.user.state = state;
										req.session.user.education = education;
										req.session.user.major = major;
										res.redirect('/home');
									});
								});
							}
						}
				});
			}
			else if(req.session.type === "Employer")
			{
				let email = req.body.email.trim();
				let password = req.body.original_password.trim();
				let state = req.body.state.trim();
				let city = req.body.city.trim();

				Employer.findOne(
					{
						where: {id: req.session.user.id}
					}).then(employer => 
					{
						if(employer)
						{
							if(password === "")
							{
								Employer.update({email: email, city: city, state: state}, { where: {id: req.session.user.id} }).then(function() 
								{
									req.session.save(function(err) 
									{
										req.session.reload(function (err)
										{
											req.session.user.email = email;
											req.session.user.original_password = password;
											req.session.user.city = city;
											req.session.user.state = state;
											res.redirect('/home');
										});
									});
								});
							}
							else
							{
								Employer.update({email: email, password: bcrypt.hashSync(password), city: city, state: state}, { where: {id: req.session.user.id} }).then(function() 
								{
									req.session.save(function(err) 
									{
										req.session.reload(function (err)
										{
											req.session.user.email = email;
											req.session.user.original_password = password;
											req.session.user.city = city;
											req.session.user.state = state;
											res.redirect('/home');
										});
									});
								});
							}
						}
				});
			}
		}
	}
	else if(req.body.delete_btn)
	{
		if(req.session.user)
		{
			if(req.session.type === "Employee")
			{
				let email = req.body.email.trim();
				let password = req.body.original_password.trim();

				Employee.findOne(
				{
						where: {email: email}
					}).then(employee => 
					{
						if(employee)
						{
							if(email === employee.email)
							{
								// deletes everything the employee was involved in
								Saved_Job.destroy({ where: {employee_id: req.session.user.id }}).then(function()
								{
									Applicant.destroy({ where: {employee_id: req.session.user.id }}).then(function()
									{
										Applied_Job.destroy({ where: {employee_id: req.session.user.id }}).then(function()
										{
											Employee.destroy({ where: {id: req.session.user.id} }).then(function() 
											{
												req.session.save(function(err) 
												{
													req.session.reload(function (err)
													{
														delete req.session.user;
														delete req.session.type;
														res.redirect('/home');
													});
												});
											});
										});
									});
								});	
							}
							else
							{
								res.render('employee_account', {active: { account: true },page: "Account", user: req.session.user});
							}		
						}
				});
			}
			else if(req.session.type === "Employer")
			{
				let email = req.body.email.trim();

				Employer.findOne(
				{
						where: {email: email}
					}).then(employer => 
					{
						if(employer)
						{
							if(email === employer.email)
							{
								// deletes everything the employer was involved in
								Applicant.destroy({ where: {employer_id: req.session.user.id}}).then(function()
								{
									Applied_Job.destroy({ where: {employer_id: req.session.user.id}}).then(function()
									{
										Posted_Job.destroy({ where: {employer_id: req.session.user.id}}).then(function()
										{
											Employer.destroy({ where: {id: req.session.user.id} }).then(function() 
											{
												req.session.save(function(err) 
												{
													req.session.reload(function (err)
													{
														delete req.session.user;
														delete req.session.type;
														res.redirect('/home');
													});
												});
											});
										});
									});
								});
							}
							else
							{
								res.render('employer_account', {active: { account: true }, page: "Account", user: req.session.user, type: req.session.type});
							}		
						}
				});
			}
		}
		
	}
});

app.post('/apply/:id', (req,res) =>
{
	if(req.body.apply_btn)
	{
		if(req.session.user)
		{
			if(req.session.type === "Employee")
			{
				let id = req.params.id;

				// finds posted job that you have clicked on
				Posted_Job.findOne({where: {id: id} }).then(job => 
				{
					var employerid = job.employer_id;
					var title = job.title;

					// creates applied job where you applied for this specifc job then later on create applicant for the employer to see
					Applied_Job.create({employee_id: req.session.user.id, employer_id: job.employer_id, job_id: id, title: job.title, description: job.description, company: job.company, pay: job.pay, education: job.education, major: job.major, state: job.state, city: job.city}).then(job => 
					{
						Applicant.create({job_id: id, job_title: title, employee_id: req.session.user.id, employer_id: employerid, first_name: req.session.user.first_name, last_name: req.session.user.last_name, major: req.session.user.major, education: req.session.user.education, state: req.session.user.state, city: req.session.user.city}).then(applicant => 
						{
							//res.redirect('/home');
							res.redirect('/jobs');
						});		
					});
				});
			}
			else
			{
				res.render('home', {active: { home: true }, page: "Home"});
			}
		}
	}
	else
	{
		res.render('home', {active: { home: true }, page: "Home"});
	}
});

app.get('/saved', (req,res) =>
{
	// shows all jobs you (employee) saved to view later
	Saved_Job.findAll({where: {employee_id: req.session.user.id}}).then(saved_jobs =>
	{
		res.render('saved', {active: { saved: true }, page: "Saved", user: req.session.user, type: req.session.type, saved_jobs: saved_jobs});
	})
});

app.post('/save/:id', (req,res) =>
{
	// if save button is pressed, find posted job and create saved job with posted_job's info in it
	if(req.body.save_btn)
	{
		if(req.session.user)
		{
			if(req.session.type === "Employee")
			{
				let id = req.params.id;

				Posted_Job.findOne({where: {id: id} }).then(job => 
				{
					Saved_Job.create({employee_id: req.session.user.id, employer_id: job.employer_id, job_id: id, title: job.title, description: job.description, company: job.company, pay: job.pay, education: job.education, major: job.major, state: job.state, city: job.city}).then(job => 
					{
						res.redirect('/saved');	
					});
				});
			}
			else
			{
				res.render('home', {active: { home: true }, page: "Home"});
			}
		}
	}
	else
	{
		res.render('home', {active: { home: true }, page: "Home"});
	}
});

app.post('/delete/:id', (req,res) =>
{
	if(req.body.delete_btn)
	{
		if(req.session.user)
		{
			if(req.session.type === "Employee")
			{
				let id = req.params.id;

				// finds saved_job with it's job_id and employee_id and deletes it from the database

				Saved_Job.destroy({where: {job_id: id, employee_id: req.session.user.id} }).then(job => 
				{
					res.redirect('/saved');	
				});
			}
			else
			{
				res.render('home', {active: { home: true }, page: "Home"});
			}
		}
	}
	else
	{
		res.render('home', {active: { home: true }, page: "Home"});
	}
});

//////////////////////////////////////////////////////////////////
//render messages
app.get('/messages', (req,res) => 
{
	if(req.session.user)
	{
		res.render('messages', {active: { messages: true }, page: "Messages", user: req.session.user, type: req.session.type});
	}
	else
	{
		res.render('home', {active: { home: true }, page: "Home"});
	}
});

//////////////////////////////////////////////////////////////////
//home page

app.post('/home', (req,res) => 
{
	if(req.body.keyword && req.body.location)
	{
		//let location = toTitleCase(req.body.location.replace(",", ""));
		let location = toTitleCase(req.body.location);
		let keyword = toTitleCase(req.body.keyword);

		let location_words = location.split(",");
		let keywords = keyword.split(" ");

		if(req.body.joblist_btn)
		{
			// 		[Op.like]: [{title: [keywords[0]]}],

			if(req.session.user)
			{
				Applied_Job.findAll({where: {employee_id: req.session.user.id}}).then(jobs =>
				{
					var applied_jobs = jobs;
	
					Posted_Job.findAll(
					{
						where: 
						{
							[Op.or]: [{city: [location_words, location]}, {state: [location_words, location]}, {title: [keywords, keyword]}, {pay: Number(keyword)}, {company: keyword}, {education: [keyword, keywords]}, {major: [keyword, keywords]}]
						}
					}).then(jobs => 
					{
						if(jobs)
						{
							var results = jobs.slice(0);

							for(var i = 0; i < results.length; ++i)
							{
								for(var j = 0; j < applied_jobs.length; ++j)
								{
									if(results[i].id === applied_jobs[j].job_id)
									{
										delete results[i]
										break;
									}
								}
							}
	
							res.render('home', {active: { home: true }, user: req.session.user, type: req.session.type, page: "Home", jobs: results, location: location, keyword: keyword});	
						}
						else
						{
							res.render('home', {errors : errors});
						}
					});	
				});
			}
			else
			{
				Posted_Job.findAll(
				{
					where: 
					{
						[Op.or]: [{city: [location_words, location]}, {state: [location_words, location]}, {title: [keywords, keyword]}, {pay: Number(keyword)}, {company: keyword}, {education: [keyword, keywords]}, {major: [keyword, keywords]}]
					}
				}).then(jobs => 
				{
					if(jobs)
					{	
						res.render('home', {active: { home: true }, user: req.session.user, type: req.session.type, page: "Home", jobs: jobs, location: location, keyword: keyword});	
					}
					else
					{
						res.render('home', {errors : errors});
					}
				});
			}
		}
	}
	else if(req.body.keyword)
	{
		let keyword = toTitleCase(req.body.keyword);
		let keywords = keyword.split(" ");

		if(req.body.joblist_btn)
		{
			// 		[Op.like]: [{title: [keywords]}]
			
			if(req.session.user)
			{
				Applied_Job.findAll({where: {employee_id: req.session.user.id}}).then(jobs =>
				{
					var applied_jobs = jobs;
	
					Posted_Job.findAll(
					{
						where: 
						{
							[Op.or]: [{title: [keywords, keyword]}, {pay: Number(keyword)}, {company: keyword}, {education: [keyword, keywords]}, {major: [keyword, keywords]}]
						}
					}).then(jobs => 
					{
						if(jobs)
						{
							var results = jobs.slice(0);

							for(var i = 0; i < results.length; ++i)
							{
								for(var j = 0; j < applied_jobs.length; ++j)
								{
									if(results[i].id === applied_jobs[j].job_id)
									{
										delete results[i]
										break;
									}
								}
							}
	
							res.render('home', {active: { home: true }, user: req.session.user, type: req.session.type, page: "Home", jobs: results, keyword: keyword});	
						}
						else
						{
							res.render('home', {errors : errors});
						}
					});	
				});
			}
			else
			{
				Posted_Job.findAll(
				{
					where: 
					{
						[Op.or]: [{title: [keywords, keyword]}, {pay: Number(keyword)}, {company: keyword}, {education: [keyword, keywords]}, {major: [keyword, keywords]}]
					}
				}).then(jobs => 
				{
					if(jobs)
					{	
						res.render('home', {active: { home: true }, user: req.session.user, type: req.session.type, page: "Home", jobs: jobs, keyword: keyword});	
					}
					else
					{
						res.render('home', {errors : errors});
					}
				});
			}
		}
	}
	else if(req.body.location)
	{
		let location = toTitleCase(req.body.location);
		let location_words = location.split(", ");

		if(req.body.joblist_btn)
		{
			if(req.session.user)
			{
				Applied_Job.findAll({where: {employee_id: req.session.user.id}}).then(jobs =>
				{
					var applied_jobs = jobs;
	
					Posted_Job.findAll(
					{
						where: 
						{
							[Op.or]: [{city: [location_words]}, {state: [location_words]}]
						}
					}).then(jobs => 
					{
						if(jobs)
						{
							var results = jobs.slice(0);

							for(var i = 0; i < results.length; ++i)
							{
								for(var j = 0; j < applied_jobs.length; ++j)
								{
									if(results[i].id === applied_jobs[j].job_id)
									{
										delete results[i]
										break;
									}
								}
							}
	
							//res.render('home', {active: { home: true }, user: req.session.user, type: req.session.type, page: "Home", jobs: jobs, location: location});	
							res.render('home', {active: { home: true }, user: req.session.user, type: req.session.type, page: "Home", jobs: results, location: location});	
						}
						else
						{
							res.render('home', {errors : errors});
						}
					});	
				});
			}
			else
			{
				Posted_Job.findAll(
				{
					where: 
					{
					 	[Op.or]: [{city: [location_words]}, {state: [location_words]}]
					}
				}).then(jobs => 
				{
					if(jobs)
					{	
						res.render('home', {active: { home: true }, user: req.session.user, type: req.session.type, page: "Home", jobs: jobs, location: location});	
					}
					else
					{
						res.render('home', {errors : errors});
					}
				});
			}
		}
	}
	else
	{
		if(req.body.joblist_btn)
		{			
			if(req.session.user)
			{
				Applied_Job.findAll({where: {employee_id: req.session.user.id}}).then(jobs =>
				{
					var applied_jobs = jobs;
	
					Posted_Job.findAll().then(jobs => 
					{
						if(jobs)
						{
							var results = jobs.slice(0);

							for(var i = 0; i < results.length; ++i)
							{
								for(var j = 0; j < applied_jobs.length; ++j)
								{
									if(results[i].id === applied_jobs[j].job_id)
									{
										delete results[i]
										break;
									}
								}
							}
	
							res.render('home', {active: { home: true }, user: req.session.user, type: req.session.type, page: "Home", jobs: results});	
						}
						else
						{
							res.render('home', {errors : errors});
						}
					});	
				});
			}
			else
			{
				Posted_Job.findAll().then(jobs => 
				{
					if(jobs)
					{	
						res.render('home', {active: { home: true }, user: req.session.user, type: req.session.type, page: "Home", jobs: jobs});	
					}
					else
					{
						res.render('home', {errors : errors});
					}
				});
			}
		}
	}
});

//////////////////////////////////////////////////////////////////
//deletes user and type from session and redirects back home
app.get('/logout', (req,res) => 
{
	delete req.session.type;
	delete req.session.user;
	res.redirect('/home');
});

// helps with seeing if the user type is an "Employee" or an "Employer"
loop.registerHelper('if_eq', function(arg1, arg2, options) 
{
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function fil(d, f)
{
	return d.filter(e => 
	{
	  try
	  {
		f.forEach(o => 
		{
		  Object.keys(o).forEach(key => 
		  {
			if(e[key] !== o[key]) throw new 1;
		  });
		});
		
		return true;
	  }
	  catch(e)
	  {
		return false;
	  }
	});
  }

var server = app.listen(app.get('port'), function()
{
	console.log("Server started...")
});


